import Button from "@mui/material/Button";
import React from "react";
import "./PianoKey.css";

const PianoKey = (props) => {
  const handleSoundAnimation = () => {
    const sound = new Audio(props.sound);
    sound.play();
    props.setSlide(false);
  };

  return (
    <Button
      variant="contained"
      color={props.color}
      sx={{
        height: "100%",
        width: "100%",
        minWidth: "auto",
        padding: 0,
        flexDirection: "column",
        justifyContent: "flex-end",
        borderRadius: "0",
        visibility: props.index === 2 ? "hidden" : "visible",
        pointerEvents: "auto",
      }}
      onClick={handleSoundAnimation}
    >
      {props.note}
    </Button>
  );
};

export default PianoKey;
