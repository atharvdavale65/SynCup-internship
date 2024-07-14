"use client"

import React, { useState, useEffect } from "react"
import { Grid, Popover, Paper } from "@mui/material"
import ChatIcon from "@mui/icons-material/Chat"
import CloseIcon from "@mui/icons-material/Close"
import { usePathname } from "next/navigation"
import { Toaster } from "react-hot-toast"
import PropTypes from "prop-types"
import Navbar from "@/src/components/navbar/Navbar"
import Sidebar from "@/src/components/Sidebar"
import Subnav from "@/src/components/navbar/Subnav"
import { SyncupGlobalContextProvider } from "@/src/context/SyncUpStore"
import Chatbot from "@/src/components/chatbot"

function Layout({ children }) {
  const [isChatOpen, setChatOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()

  const showSubnav =
    !pathname.includes("/helpsupport") &&
    !pathname.includes("/detailedinformation") &&
    !pathname.includes("/report") &&
    !pathname.includes("/team") &&
    !pathname.includes("/roadmap") &&
    !pathname.includes("/backlog") &&
    !pathname.includes("/releases")

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const getGridContainerStyles = () => {
    return {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      minWidth: 400,
    }
  }

  const toggleChat = (event) => {
    setChatOpen(!isChatOpen)
    setAnchorEl(event.currentTarget)
  }

  const closeChatbot = () => {
    setChatOpen(false)
    setAnchorEl(null)
  }

  useEffect(() => {
    const handleResize = () => {
      if (isChatOpen) {
        closeChatbot()
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [isChatOpen])

  return (
    <SyncupGlobalContextProvider>
      <Grid container style={getGridContainerStyles()}>
        <Grid item xs={12}>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Navbar onMenuClick={toggleSidebar} />
        </Grid>
        <Grid
          item
          xs={isSidebarOpen ? 4 : 1}
          sm={isSidebarOpen ? 2.5 : 0.7}
          md={isSidebarOpen ? 1.7 : 0.5}
          lg={isSidebarOpen ? 1.7 : 0.5}
        >
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        </Grid>
        <Grid
          item
          xs={isSidebarOpen ? 8 : 11}
          sm={isSidebarOpen ? 9.5 : 11.3}
          md={isSidebarOpen ? 10.3 : 11.5}
          lg={isSidebarOpen ? 10.3 : 11.5}
        >
          <Grid
            className="dark:bg"
            sx={{
              backgroundColor: "#eef2f6",
              borderRadius: "1rem",
              width: "98%",
            }}
            container
          >
            {showSubnav && (
              <Grid item xs={12}>
                <Subnav />
              </Grid>
            )}
            <Grid
              item
              xs={12}
              sx={{
                height: "100vh",
              }}
            >
              {children}
              <Paper
                elevation={3}
                onClick={toggleChat}
                style={{
                  position: "fixed",
                  bottom: "5vh",
                  right: "2vw",
                  zIndex: 5,
                  cursor: "pointer",
                  borderRadius: "50%",
                  padding: 12,
                  backgroundColor: isChatOpen ? "grey" : "#683ab7",
                }}
              >
                {isChatOpen ? (
                  <CloseIcon style={{ fontSize: 30, color: "white" }} />
                ) : (
                  <ChatIcon style={{ fontSize: 30, color: "white" }} />
                )}
              </Paper>
              <Popover
                open={isChatOpen}
                anchorEl={anchorEl}
                onClose={closeChatbot}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                slotProps={{
                  paper: {
                    sx: { borderRadius: "1rem" },
                  },
                }}
              >
                <Paper sx={{ borderRadius: "20px" }}>
                  <Chatbot onClose={closeChatbot} />
                </Paper>
              </Popover>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </SyncupGlobalContextProvider>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
