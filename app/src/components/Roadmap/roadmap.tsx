"use client"

import React, { useState } from "react"
import { Card, CardBody, Checkbox, Progress } from "@nextui-org/react"
import { MdOutlinePublic } from "react-icons/md"
import { BiSolidLock } from "react-icons/bi"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"
import GanttChart from "./ganttchart"

export default function RoadmapUI() {
  const { boardData } = useGlobalSyncupContext()
  const [selectedBoard, setSelectedBoard] = useState(null)

  const handleCheckboxChange = (boardId) => {
    if (selectedBoard === boardId) {
      setSelectedBoard(null)
    } else {
      setSelectedBoard(boardId)
    }
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        overflow: "auto",
        scrollbarWidth: "none",
      }}
    >
      <div style={{ display: "flex", marginRight: "10px" }}>
        <Card
          style={{
            borderRadius: "12px",
            height: "600px",
            marginLeft: "17px",
            marginTop: "12px",
            marginRight: "2px",
          }}
        >
          <CardBody className="no-scrollbar">
            <div>
              {boardData.map((board) => (
                <div
                  key={board.id}
                  style={{ width: "93%", marginBottom: "10px" }}
                >
                  <Card
                    style={{
                      borderRadius: "12px",
                      height: "100px",
                      marginLeft: "10px",
                    }}
                  >
                    <CardBody className="no-scrollbar">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Checkbox
                          color="secondary"
                          checked={
                            board.id !== null && selectedBoard === board.id
                          }
                          onChange={() => handleCheckboxChange(board.id)}
                        />
                        <p style={{ marginLeft: "1px" }}>{board.name}</p>
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            zIndex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "0,10px 0 0",
                            width: "20px",
                            height: "20px",
                            color: "#606060",
                          }}
                        >
                          {board.visibility === "PUBLIC" ? (
                            <MdOutlinePublic className="text-[#7754bd]" />
                          ) : (
                            <BiSolidLock size={80} className="text-[#7754bd]" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs mt-2">Status: In Progress</p>
                      <Progress
                        aria-label="Loading..."
                        value={60}
                        className="max-w-md, mt-2"
                        color="secondary"
                      />
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
      <div style={{ flex: "70%", marginTop: "12px", marginRight: "15px" }}>
        <Card style={{ borderRadius: "12px", height: "600px" }}>
          <CardBody className="no-scrollbar">
            <GanttChart selectedBoardId={selectedBoard} />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
