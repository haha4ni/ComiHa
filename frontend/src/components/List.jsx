import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useNavigate } from "react-router-dom";
import { ScanBookAll } from "../../wailsjs/go/main/App";
import CircularProgress from "@mui/material/CircularProgress";

const drawerWidth = 240;

export default function SimpleDrawer({ open, onToggle }) {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  return (
    <>
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: (theme) => theme.zIndex.modal,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Drawer
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 0,
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar variant='dense' disableGutters sx={{ minHeight: 40, height: 40 }}/>
        <Box sx={{ overflow: "auto" }}>
          <List>
            {["首頁", "全部書籍", "全部系列", "掃描書籍", "＜"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton onClick={async () => {
                  switch(index) {
                    case 0:
                      navigate("/");
                      break;
                    case 1:
                      navigate("/bookinfo");
                      break;
                    case 2:
                      navigate("/series");
                      break;
                    case 3:
                      setLoading(true);
                      try {
                        await ScanBookAll();
                      } finally {
                        setLoading(false);
                      }
                      break;
                    case 4:
                      onToggle();
                      break;
                    default:
                      onToggle();
                  }
                }}>
                  <ListItemIcon>
                    {(() => {
                      switch(index) {
                        case 0:
                          return <HomeIcon />;
                        case 1:
                          return <LibraryBooksIcon />;
                        case 2:
                          return <InboxIcon />;
                        case 3:
                          return <MailIcon />;
                        case 4:
                          return <ArrowBackIcon />;
                        default:
                          return <MailIcon />;
                      }
                    })()}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
    </>
  );
}
