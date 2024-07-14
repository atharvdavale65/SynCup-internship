"use client"

import React, { useEffect, useState } from "react"

import { useSession } from "next-auth/react"
import { Paper, Typography } from "@mui/material"
import Link from "next/link"
import toast from "react-hot-toast"
import { useParams } from "next/navigation"
import Cards from "../cards"
import { useGlobalSyncupContext } from "../../context/SyncUpStore"
import Loader from "../Loader"

export default function Home() {
  const { data: session } = useSession()
  const [firstBoardId, setFirstBoardId] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const { boardData, defaultload, setDefaultLoad } = useGlobalSyncupContext()
  const orgname = useParams()
  const fetchBoards = async () => {
    try {
      if (boardData.length > 0) {
        if (session && session.user) {
          const sortedBoards = boardData
          if (sortedBoards.length > 0) {
            const firstBoard = sortedBoards[0]
            setFirstBoardId(firstBoard.id)
            setErrorMessage(null)
          }
        }
      } else {
        setErrorMessage("You don't have any boards. Please create a board.")
      }
    } catch (error) {
      toast.error("An error occurred while fetching boards.")
      setErrorMessage("An error occurred while fetching boards.")
    }
  }

  useEffect(() => {
    fetchBoards()
    setDefaultLoad(false)
  }, [boardData, defaultload])
  return (
    <>
      {defaultload ? (
        <Loader />
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ width: "50%" }}>
            {errorMessage ? (
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  backgroundColor: "#FFCCCC",
                  margin: "auto",
                  textAlign: "center",
                }}
              >
                <Typography color="error">
                  {errorMessage}{" "}
                  <Link href={`/${orgname.organization}/board`} passHref>
                    Click here to create a board
                  </Link>
                </Typography>
              </Paper>
            ) : null}
          </div>
        </div>
      )}
      {firstBoardId && <Cards boardId={firstBoardId} />}
    </>
  )
}
