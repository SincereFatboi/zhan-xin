import React from "react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import "./ListItems.css";
import { useLocation, useNavigate } from "react-router-dom";

const ListItems = ({ sections }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {sections.map((section, index) => (
        <ListItemButton
          key={index}
          onClick={() => {
            navigate(section.path);
          }}
        >
          <ListItemIcon
            sx={{
              ...(section.path === location.pathname && {
                color: "primary.main",
              }),
            }}
          >
            {section.icon}
          </ListItemIcon>
          <ListItemText primary={section.title} />
        </ListItemButton>
      ))}
    </>
  );
};

export default ListItems;
