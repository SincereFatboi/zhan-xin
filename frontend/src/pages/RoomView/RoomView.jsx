import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router";
import { useNavigate } from "react-router";

import Box from "@mui/material/Box";
import NoSleep from "nosleep.js";
import { io } from "socket.io-client";

import Loading from "../../components/Loading/Loading";
import SpeedDial from "../../components/SpeedDial/SpeedDial";
import { useNotify } from "../../hooks/useNotify";
import { useGetScoreQuery } from "../../redux/apis/scores/getScore";
import { parseHtmlFile } from "../../utils/processor";
import "./RoomView.css";

const RoomView = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { roomName } = useParams();
  const [allScores, setAllScores] = useState(null);
  const [rawHtml, setRawHtml] = useState(null);
  const [transposeKey, setTransposeKey] = useState(0);
  const [scoreIndex, setScoreIndex] = useState(0);
  const [followScroll, setFollowScroll] = useState(true);
  const scrollRef = useRef(null);
  const applyingRemoteScrollRef = useRef(false);
  const lastRemoteRatioRef = useRef(0);
  const lastSentRef = useRef(0);
  const prevTransposeRef = useRef(null);
  const suppressTransposeNotifyRef = useRef(false);
  const didMountRef = useRef(false);
  const skippedFirstTransposeRef = useRef(false);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const notify = useNotify();
  const navigate = useNavigate();

  const getZoomCookie = (key) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${key}=`));
    if (!match) return null;
    const raw = decodeURIComponent(match.split("=")[1] || "");
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const setZoomCookie = (key, value) => {
    if (typeof document === "undefined" || !Number.isFinite(value)) return;
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}`;
  };

  const getBoolCookie = (key) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${key}=`));
    if (!match) return null;
    const raw = decodeURIComponent(match.split("=")[1] || "").toLowerCase();
    if (raw === "true" || raw === "1") return true;
    if (raw === "false" || raw === "0") return false;
    return null;
  };

  const setBoolCookie = (key, value) => {
    if (typeof document === "undefined") return;
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `${key}=${value ? "1" : "0"}; path=/; expires=${expires.toUTCString()}`;
  };

  const handleZoomIn = () =>
    setZoomLevel((zoom) => {
      const next = zoom + 0.05;
      if (roomName) setZoomCookie(`roomZoom_${roomName}`, next);
      return next;
    });
  const handleZoomOut = () =>
    setZoomLevel((zoom) => {
      const next = zoom - 0.05;
      if (roomName) setZoomCookie(`roomZoom_${roomName}`, next);
      return next;
    });
  const handleReset = () => {
    // setZoomLevel(1);
    suppressTransposeNotifyRef.current = true;
    setTransposeKey(0);
    setScoreIndex(0);
    // setFollowScroll(true);
    if (roomName) setBoolCookie(`roomFollow_${roomName}`, true);
    if (allScores) {
      const resetScores = Object.keys(allScores).reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {});
      setAllScores(resetScores);
      if (socket && roomName) {
        socket.emit("send-message", {
          key: 0,
          scoreIndex: 0,
          allScores: resetScores,
          roomName,
        });
      }
    } else if (socket && roomName) {
      socket.emit("send-message", { key: 0, scoreIndex: 0, roomName });
    }
    if (roomName) setZoomCookie(`roomZoom_${roomName}`, 1);

    if (socket && roomName) {
      socket.emit("reset-room", { roomName });
    }
  };

  const handleUpKey = (event) => {
    event.preventDefault();
    if (!socket) return;

    setTransposeKey((prev) => {
      const upKey = prev + 1;
      socket.emit("send-message", {
        key: upKey,
        roomName,
        allScores,
        scoreIndex,
      });
      return upKey;
    });
  };

  const handleDownKey = (event) => {
    event.preventDefault();
    if (!socket) return;

    setTransposeKey((prev) => {
      const downKey = prev - 1;
      socket.emit("send-message", {
        key: downKey,
        roomName,
        scoreIndex,
      });
      return downKey;
    });
  };

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevTransposeRef.current = transposeKey;
      return;
    }

    if (suppressTransposeNotifyRef.current) {
      suppressTransposeNotifyRef.current = false;
      prevTransposeRef.current = transposeKey;
      return;
    }

    if (prevTransposeRef.current !== transposeKey) {
      if (!skippedFirstTransposeRef.current) {
        skippedFirstTransposeRef.current = true;
        prevTransposeRef.current = transposeKey;
        return;
      }
      const prev = prevTransposeRef.current;
      const dir = transposeKey > prev ? "UP KEY ⬆️" : "DOWN KEY ⬇️";
      notify("info", dir);
      prevTransposeRef.current = transposeKey;
    }
  }, [transposeKey, notify]);

  const handleNextScore = () => {
    if (!socket || !allScores) return;
    let nextIndex = 0;
    setScoreIndex((prev) => {
      const lastIndex = Object.keys(allScores).length - 1;
      nextIndex = prev + 1 > lastIndex ? 0 : prev + 1;
      allScores[Object.keys(allScores)[scoreIndex]] = transposeKey;
      // Emit the new score index to the room
      socket.emit("send-message", {
        key: allScores[Object.keys(allScores)[nextIndex]],
        scoreIndex: nextIndex,
        allScores,
        roomName,
      });
      return nextIndex;
    });
  };

  const handlePrevScore = () => {
    if (!socket || !allScores) return;
    let prevIndex = 0;
    setScoreIndex((prev) => {
      const lastIndex = Object.keys(allScores).length - 1;
      prevIndex = prev - 1 < 0 ? lastIndex : prev - 1;
      allScores[Object.keys(allScores)[scoreIndex]] = transposeKey;
      socket.emit("send-message", {
        key: allScores[Object.keys(allScores)[prevIndex]],
        scoreIndex: prevIndex,
        allScores,
        roomName,
      });
      return prevIndex;
    });
  };

  const renderedHtml = useMemo(() => {
    if (!rawHtml) return null;
    return parseHtmlFile(rawHtml, transposeKey);
  }, [rawHtml, transposeKey]);

  const applyScrollRatio = (ratio) => {
    const el = scrollRef.current;
    if (!el) return;

    const clamped = Math.max(0, Math.min(1, ratio));
    const max = el.scrollHeight - el.clientHeight;
    const targetTop = max > 0 ? clamped * max : 0;

    applyingRemoteScrollRef.current = true;
    el.scrollTop = targetTop;
    requestAnimationFrame(() => {
      applyingRemoteScrollRef.current = false;
    });
  };

  const toggleFollowScroll = () => {
    setFollowScroll((prev) => {
      const next = !prev;
      if (next) {
        applyScrollRatio(lastRemoteRatioRef.current || 0);
      }
      if (roomName) setBoolCookie(`roomFollow_${roomName}`, next);
      return next;
    });
  };

  // Load saved zoom level for the room
  useEffect(() => {
    if (!roomName) return;
    const saved = getZoomCookie(`roomZoom_${roomName}`);
    if (Number.isFinite(saved)) setZoomLevel(saved);
    const savedFollow = getBoolCookie(`roomFollow_${roomName}`);
    if (savedFollow !== null) setFollowScroll(savedFollow);
  }, [roomName]);

  useEffect(() => {
    const handleScoreZoom = () => {
      const saved = roomName ? getZoomCookie(`roomZoom_${roomName}`) : null;
      if (Number.isFinite(saved)) return;

      const screenWidth = window.innerWidth;
      setZoomLevel(screenWidth * 0.0009);
    };

    window.addEventListener("resize", handleScoreZoom);
    handleScoreZoom();
    return () => window.removeEventListener("resize", handleScoreZoom);
  }, [roomName]);

  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_IP_ADDRESS}`, {
      auth: { token: accessToken },
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connect error:", err?.message || err);
      notify("error", err?.message || "Socket connection error");
      setIsConnected(false);
      navigate("/rooms");
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("scroll-reset", (data) => {
      const el = scrollRef.current;
      if (!el) return;

      lastRemoteRatioRef.current = 0;
      applyingRemoteScrollRef.current = true;
      el.scrollTop = 0;

      requestAnimationFrame(() => {
        applyingRemoteScrollRef.current = false;
      });

      const user = data?.username;
      if (user) notify("warning", `${user} reset the room`);
    });

    newSocket.on("receive-message", (data) => {
      if (!data || typeof data !== "object") return;

      const key = Number(data.key);
      if (Number.isFinite(key)) {
        setTransposeKey(key);
      }

      const scoreIndex = Number(data.scoreIndex);
      if (Number.isFinite(scoreIndex)) {
        setScoreIndex(scoreIndex);
      }

      if (data.scores && typeof data.scores === "object") {
        setAllScores(data.scores);
      }
    });

    newSocket.on("user-joined", (data) => {
      const name = data?.username;
      if (name) notify("info", `${name} joined the room`);
    });

    newSocket.on("user-left", (data) => {
      const name = data?.username;
      if (name) notify("warning", `${name} left the room`);
    });

    newSocket.on("error", (data) => {
      notify("error", data.message);
      navigate("/rooms");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket && roomName) {
        newSocket.emit("leave-room", { roomName });
      }
      newSocket.off("user-joined");
      newSocket.off("user-left");
      newSocket.disconnect();
    };
  }, [roomName]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !socket || !roomName) return;

    const onScroll = () => {
      if (!followScroll) return;
      if (applyingRemoteScrollRef.current) return;

      const now = Date.now();
      if (now - lastSentRef.current < 10) return; // throttle ~50fps
      lastSentRef.current = now;

      const max = el.scrollHeight - el.clientHeight;
      const ratio = max > 0 ? el.scrollTop / max : 0;

      socket.emit("scroll", { roomName, ratio });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [socket, roomName, renderedHtml, followScroll]);

  useEffect(() => {
    if (!socket || !roomName) return;

    socket.emit("join-room", { roomName }, (state) => {
      const key = Number(state?.key);
      const scoreIndex = Number(state?.scoreIndex);
      if (Number.isFinite(key)) setTransposeKey(key);
      if (Number.isFinite(scoreIndex)) setScoreIndex(scoreIndex);
      if (state?.scores && typeof state.scores === "object")
        setAllScores(state.scores);
    });
  }, [socket, roomName]);

  useEffect(() => {
    if (!socket) return;

    const onRemoteScroll = (data) => {
      const ratio = Number(data?.ratio);
      if (!Number.isFinite(ratio)) return;

      const clamped = Math.max(0, Math.min(1, ratio));
      lastRemoteRatioRef.current = clamped;

      if (!followScroll) return;

      const el = scrollRef.current;
      if (!el) return;

      const max = el.scrollHeight - el.clientHeight;
      const targetTop = max > 0 ? clamped * max : 0;

      // avoid micro-updates that cause jitter
      // if (Math.abs(el.scrollTop - targetTop) < 2) return;

      applyingRemoteScrollRef.current = true;
      el.scrollTop = targetTop;

      requestAnimationFrame(() => {
        applyingRemoteScrollRef.current = false;
      });
    };

    socket.on("scroll", onRemoteScroll);
    return () => socket.off("scroll", onRemoteScroll);
  }, [socket, followScroll]);

  useEffect(() => {
    const noSleep = new NoSleep();

    noSleep.enable().catch((err) => {
      if (err?.name !== "AbortError") {
        console.error("NoSleep enable failed", err);
      }
    });

    return () => {
      try {
        noSleep.disable();
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("NoSleep disable failed", err);
        }
      }
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    applyingRemoteScrollRef.current = true;
    el.scrollTop = 0;
    requestAnimationFrame(() => {
      applyingRemoteScrollRef.current = false;
    });
  }, [scoreIndex]);

  const scoreId = Object.keys(allScores ?? {})[scoreIndex] ?? null;

  const getScore = useGetScoreQuery({ score: scoreId }, { skip: !scoreId });

  useEffect(() => {
    const status = getScore?.error?.status;
    if (status !== 404 || !allScores) return;

    const keys = Object.keys(allScores);
    if (!keys.length) return;

    const badKey = keys[scoreIndex] ?? null;
    const nextScores = { ...allScores };
    if (badKey) delete nextScores[badKey];

    const nextKeys = Object.keys(nextScores);
    const nextIndex =
      nextKeys.length > 0 ? Math.min(scoreIndex, nextKeys.length - 1) : 0;

    setAllScores(nextScores);
    setScoreIndex(nextIndex);

    if (nextKeys.length === 0) {
      notify("error", "No scores available in this room");
      navigate("/rooms");
    }
  }, [getScore?.error?.status, allScores, scoreIndex, navigate, notify]);

  useEffect(() => {
    if (!allScores) return;
    if (Object.keys(allScores).length === 0) {
      notify("error", "No scores available in this room");
      navigate("/rooms");
    }
  }, [allScores, navigate, notify]);

  useEffect(() => {
    const url = getScore?.data?.presignedURL;
    if (!url) return;

    let cancelled = false;

    const transposeKey = async () => {
      const htmlResponse = await fetch(url);
      if (!htmlResponse.ok) {
        throw new Error(`Failed to fetch HTML: ${htmlResponse.status}`);
      }
      const htmlText = await htmlResponse.text();
      if (!cancelled) setRawHtml(htmlText);
    };
    transposeKey();
    // setTransposeKey(allScores?.[scoreId] || 0);

    return () => {
      cancelled = true;
    };
  }, [getScore?.data?.presignedURL]);

  return (
    <Box
      ref={scrollRef}
      sx={{
        width: "100vw",
        transform: "none",
        margin: "auto 0",
        overflowY: "auto",
        overflowX: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          padding: 0,
          margin: "auto",
          alignItems: "center",
          transform: "none",
        }}
      >
        {getScore.isLoading || !renderedHtml ? (
          <Loading />
        ) : (
          <>
            <div
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
                position: "relative",
                top: -10,
                height: "100vh",
                willChange: "transform",
              }}
            />
            <SpeedDial
              handleNextScore={handleNextScore}
              handlePrevScore={handlePrevScore}
              handleUpKey={handleUpKey}
              handleDownKey={handleDownKey}
              handleResetZoom={handleReset}
              handleZoomIn={handleZoomIn}
              handleZoomOut={handleZoomOut}
              handleToggleFollow={toggleFollowScroll}
              isFollowingScroll={followScroll}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default RoomView;
