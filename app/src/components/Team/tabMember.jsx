import React, { useState, useEffect } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Progress,
  Pagination,
} from "@nextui-org/react"
import toast from "react-hot-toast"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"

function tabMember() {
  const [users, setUsers] = useState([])
  const { allUserData } = useGlobalSyncupContext()

  const [page, setPage] = useState(1)
  const rowsPerPage = 5

  useEffect(() => {
    async function fetchUsersData() {
      try {
        setUsers(allUserData)
      } catch (error) {
        toast.error("Error fetching users:", error)
      }
    }
    fetchUsersData()
  }, [allUserData])

  const startIndex = (page - 1) * rowsPerPage
  const endIndex = page * rowsPerPage
  const paginatedusers = users.slice(startIndex, endIndex)
  const totalPages = Math.ceil(users.length / rowsPerPage)
  const paginatedusersSorted = paginatedusers
    .slice()
    .sort((a, b) => a.id - b.id)

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber)
  }

  return (
    <div
      className="max-h-[50vh] overflow no-scrollbar"
      style={{
        margin: "0 20px",
      }}
    >
      <Table
        aria-label="Members table"
        selectionMode="multiple"
        color="secondary"
      >
        <TableHeader>
          <TableColumn>Name</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Role</TableColumn>
          <TableColumn>Tasks Assigned</TableColumn>
          <TableColumn>Tasks Progress</TableColumn>
        </TableHeader>
        <TableBody>
          {paginatedusersSorted.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.name.length > 15
                  ? `${user.name.substring(0, 25)}...`
                  : user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                Development of Project A, Coordination of Project B
              </TableCell>
              <TableCell>
                <Progress
                  aria-label="Task progress"
                  size="md"
                  value={90}
                  color="secondary"
                  showValueLabel
                  className="max-w-md"
                />
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

export default tabMember
