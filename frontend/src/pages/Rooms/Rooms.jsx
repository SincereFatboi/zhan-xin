import React, { useEffect, useState } from "react";
import "./Rooms.css";
import Modal from "../../components/Modal/Modal";
import SpeedDial from "../../components/SpeedDial/SpeedDial";
import { useLazyGetDocumentQuery } from "../../redux/api/documents/getDocument";
import DOMPurify from "dompurify";
import Box from "@mui/material/Box";
import Iframe from "react-iframe";
import Loading from "../../components/Loading/Loading";
import Button from "@mui/material/Button";
import { useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";

const Rooms = () => {
  const [getDocument, getDocumentResults] = useLazyGetDocumentQuery();
  const [htmlContent, setHtmlContent] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1); // To track zoom level
  const isScreenBelowSm = useMediaQuery((screen) =>
    screen.breakpoints.down("sm")
  );

  // useEffect(() => {
  //   const getPresignedURL = async () => {
  //     try {
  //       const document = await getDocument("score-1.html");
  //       const htmlResponse = await fetch(document.data.url);
  //       const htmlContent = await htmlResponse.text();
  //       setHtmlContent(htmlContent);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   const handleScoreZoom = () => {
  //     const screenWidth = window.innerWidth;
  //     setZoomLevel(screenWidth * 0.00089);
  //   };

  //   window.addEventListener("resize", handleScoreZoom);
  //   handleScoreZoom();
  //   getPresignedURL();

  //   return () => window.removeEventListener("resize", handleScoreZoom);
  // }, []);

  const socket = new WebSocket(`ws://localhost:5000/api/room/funny`, [
    useSelector((state) => state.auth.accessToken),
  ]);

  socket.onopen = () => {
    socket.onmessage = (event) => {
      console.log(event.data);
    };
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // console.log(data.get("message"));
    const newData = { message: data.get("message") };
    socket.send(JSON.stringify(newData));
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Enter message"
          id="message"
          name="message"
        />
        <button type="submit">Submit</button>
      </form>
      {/* <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center", // Center vertically
          width: 0,
          padding: 0,
          mt: isScreenBelowSm ? "-1.5rem" : "-1rem",
        }}
      >
        {htmlContent ? (
          <div
            dangerouslySetInnerHTML={{
              __html: htmlContent,
            }}
            style={{
              transform: `scale(${zoomLevel})`, // Apply zoom level
              transformOrigin: "top", // Set zoom origin
              position: "relative",
              padding: 0,
              margin: 0,
              maxHeight: "90%",
            }}
          />
        ) : (
          <Loading />
        )}
      </Box> */}
      <SpeedDial />
    </>
  );
};

export default Rooms;
