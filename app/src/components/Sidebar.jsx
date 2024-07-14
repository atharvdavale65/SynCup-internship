"use client"

import * as React from "react"
import { MdOutlineDashboard, MdOutlineSettings } from "react-icons/md"
import { FaRegFileLines } from "react-icons/fa6"
import { IoCompassOutline, IoFlashOutline } from "react-icons/io5"
import { LuBarChart } from "react-icons/lu"

import { RiTeamLine } from "react-icons/ri"
import {
  Breadcrumbs,
  BreadcrumbItem,
  Divider,
  Tooltip,
} from "@nextui-org/react"

import { AiOutlineDoubleLeft, AiOutlineDoubleRight } from "react-icons/ai"

import { useParams, usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import PropTypes from "prop-types"
import { useGlobalSyncupContext } from "../context/SyncUpStore"

function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const { data: session } = useSession()
  const { boardData, defaultload, organizationname } = useGlobalSyncupContext()
  const [boardname, setboardname] = useState("")
  const boardid = useParams()
  const currentOrganization = organizationname.find(
    (org) => org.name === boardid.organization,
  )
  const organizationImage = currentOrganization
    ? currentOrganization.profile
    : null
  const menuItems = [
    {
      text: "Board",
      path: `/${boardid.organization}/board`,
      icon: <MdOutlineDashboard className="w-6 h-6" />,
    },
    {
      text: "Backlog",
      path: `/${boardid.organization}/backlog`,
      icon: <FaRegFileLines className="w-6 h-6" />,
    },
    {
      text: "Roadmap",
      path: `/${boardid.organization}/roadmap`,
      icon: <IoCompassOutline className="w-6 h-6" />,
    },
    {
      text: "Report",
      path: `/${boardid.organization}/report`,
      icon: <LuBarChart className="w-6 h-6" />,
    },
    {
      text: "Releases",
      path: `/${boardid.organization}/releases`,
      icon: <IoFlashOutline className="w-6 h-6" />,
    },
    {
      text: "Team",
      path: `/${boardid.organization}/team`,
      icon: <RiTeamLine className="w-6 h-6" />,
    },
    {
      text: "Project Setting",
      path: `/${boardid.organization}/projectsetting`,
      icon: <MdOutlineSettings className="w-6 h-6" />,
    },
  ]

  useEffect(() => {
    const fetchBoards = async () => {
      if (boardid.id !== undefined && boardData.length > 0) {
        try {
          const board = boardData.find(
            (boards) => boards.id === parseInt(boardid.id, 10),
          ).name
          setboardname(board)
        } catch (error) {
          console.error("Error while fetching board name:", error)
        }
      } else if (session && session.user) {
        if (boardData.length > 0) {
          const firstBoard = boardData[0]
          setboardname(firstBoard.name)
        } else {
          setboardname("Project name")
        }
      }
    }
    fetchBoards()
  }, [boardid, session, defaultload, boardData])

  const pathname = usePathname()
  const [screenHeight, setScreenHeight] = useState(0)

  useEffect(() => {
    const updateScreenHeight = () => {
      setScreenHeight(window.innerHeight)
    }

    window.addEventListener("resize", updateScreenHeight)
    updateScreenHeight()

    return () => window.removeEventListener("resize", updateScreenHeight)
  }, [])

  return (
    <div style={{ height: `${screenHeight}px` }}>
      <div style={{ position: "relative" }}>
        <div
          className="dark:text"
          style={{
            position: "absolute",
            top: "15%",
            right: "-11px",
            borderRadius: "50%",
            backgroundColor: "#ede7f6",
            transform: "translateY(-50%)",
            zIndex: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "22px",
            height: "22px",
            padding: 0,
          }}
          onClick={toggleSidebar}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              toggleSidebar()
            }
          }}
          role="button"
          tabIndex={0}
        >
          {isSidebarOpen ? (
            <AiOutlineDoubleLeft className="w-3 h-2" />
          ) : (
            <AiOutlineDoubleRight className="w-3 h-2" />
          )}
        </div>

        <ul
          className={`${isSidebarOpen ? "" : "flex flex-col justify-center items-center"}`}
        >
          <li className="flex items-center p-[0.7rem] mt-1 rounded-lg cursor-pointer">
            {organizationImage ? (
              <img
                src={organizationImage}
                alt="Project Logo"
                className="w-10 h-10 rounded-lg mr-2"
              />
            ) : (
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwhKdsWLbcge24UeYFed6IeLusNnVYe7YV4A&usqp=CAU"
                alt="Project Logo"
                className="w-10 h-10 rounded-lg mr-2"
              />
            )}

            <Breadcrumbs>
              <BreadcrumbItem>
                {isSidebarOpen && (
                  <div className="text-base">
                    <Tooltip
                      content={
                        boardid.organization.length > 25 ? (
                          <>
                            {boardid.organization
                              .match(/.{1,25}/g)
                              .map((line, index) => (
                                <div key={index}>{line}</div>
                              ))}
                          </>
                        ) : (
                          boardid.organization
                        )
                      }
                    >
                      <span>
                        {boardid.organization.length > 7
                          ? `${boardid.organization.substring(0, 7)}...`
                          : boardid.organization}
                      </span>
                    </Tooltip>
                  </div>
                )}
              </BreadcrumbItem>
              <BreadcrumbItem>
                {isSidebarOpen && (
                  <Tooltip
                    content={
                      boardname.length > 25 ? (
                        <>
                          {boardname.match(/.{1,25}/g).map((line, index) => (
                            <div key={index}>{line}</div>
                          ))}
                        </>
                      ) : (
                        boardname
                      )
                    }
                  >
                    <div className="text-base">
                      {boardname.length > 7
                        ? `${boardname.substring(0, 7)}...`
                        : boardname}
                    </div>
                  </Tooltip>
                )}
              </BreadcrumbItem>
            </Breadcrumbs>
          </li>
          <Divider />
          {menuItems.map((item) => (
            <li
              key={item.text}
              textValue={item.text}
              variant="light"
              className={`p-[0.7rem] mt-1 rounded-lg cursor-pointer hover:text-[#9170ca] hover:bg-[#ede7f6] hover:border-l-4 border-[#9170ca] ${isSidebarOpen ? "mx-1" : ""} ${pathname === item.path ? "text-[#9170ca] bg-[#ede7f6] border-l-4 border-[#9170ca]" : ""}`}
            >
              <Link href={item.path} key={item.text}>
                <div className="flex gap-3 items-center">
                  <div>{item.icon}</div>
                  {isSidebarOpen && (
                    <div className="flex flex-col">
                      <span className="text-small">{item.text}</span>
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

Sidebar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
}

export default Sidebar
