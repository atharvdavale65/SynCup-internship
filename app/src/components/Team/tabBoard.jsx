import React, { useState, useEffect } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  AvatarGroup,
  Avatar,
  Tooltip,
  Pagination,
} from "@nextui-org/react"
import toast from "react-hot-toast"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"

function tabBoard() {
  const [boards, setBoards] = useState([])
  const { boardData } = useGlobalSyncupContext()

  const [page, setPage] = useState(1)
  const rowsPerPage = 5

  const startIndex = (page - 1) * rowsPerPage
  const endIndex = page * rowsPerPage
  const paginatedboards = boards.slice(startIndex, endIndex)
  const totalPages = Math.ceil(boards.length / rowsPerPage)
  const paginatedboardsSorted = paginatedboards
    .slice()
    .sort((a, b) => a.id - b.id)

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber)
  }

  useEffect(() => {
    async function fetchBoards() {
      try {
        setBoards(boardData)
      } catch (error) {
        toast.error("Error fetching boards:", error)
      }
    }
    fetchBoards()
  }, [])

  return (
    <div
      style={{
        margin: "0 20px",
        maxHeight: "50vh",
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
    >
      <Table
        aria-label="Boards table"
        selectionMode="multiple"
        color="secondary"
      >
        <TableHeader>
          <TableColumn>Board ID</TableColumn>
          <TableColumn>Board Name</TableColumn>
          <TableColumn>Members</TableColumn>
        </TableHeader>
        <TableBody>
          {paginatedboardsSorted.map((board) => (
            <TableRow key={board.id}>
              <TableCell>{board.id}</TableCell>
              <TableCell>
                {board.name.length > 15
                  ? `${board.name.substring(0, 15)}...`
                  : board.name}
              </TableCell>
              <TableCell>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <AvatarGroup isBordered max={2} size="sm">
                    {board.users &&
                      board.users.map((user) => (
                        <Tooltip
                          key={user.id}
                          placement="bottom"
                          showArrow
                          content={
                            user.name.length > 15 ? (
                              <>
                                {user.name
                                  .match(/.{1,15}/g)
                                  .map((line, idx) => (
                                    <div key={idx}>{line}</div>
                                  ))}
                              </>
                            ) : (
                              user.name
                            )
                          }
                        >
                          <Avatar
                            key={user.id}
                            name={user.name ? user.name.charAt(0) : ""}
                            size="sm"
                            src={user.photo}
                          />
                        </Tooltip>
                      ))}
                  </AvatarGroup>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages >= 1 && (
        <div className="flex w-full justify-end pr-5">
          <Pagination
            page={page}
            isCompact
            className="mt-[1.5px]"
            showControls
            showShadow
            size="sm"
            total={totalPages}
            color="secondary"
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}

export default tabBoard
