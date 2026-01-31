import { useLocation, useNavigate } from "react-router";

import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

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
          sx={{
            "& .MuiListItemIcon-root": {
              minWidth: "40px",
              color: "secondary.main",
            },
          }}
        >
          <ListItemIcon
            sx={{
              ...(section.path === location.pathname && {
                color: "secondary.main",
              }),
            }}
          >
            {section.icon}
          </ListItemIcon>
          <ListItemText
            primary={section.title}
            sx={{ color: "secondary.main" }}
          />
        </ListItemButton>
      ))}
    </>
  );
};

export default ListItems;
