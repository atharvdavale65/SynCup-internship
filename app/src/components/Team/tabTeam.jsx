import React, { useState, useEffect } from "react"
import toast from "react-hot-toast"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Input,
  useDisclosure,
  AvatarGroup,
  Avatar,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Pagination,
} from "@nextui-org/react"
import { useSession } from "next-auth/react"
import { TbHomeEdit } from "react-icons/tb"
import { MdOutlineDeleteSweep } from "react-icons/md"
import { createTeam, fetchTeams, editTeam, deleteTeam } from "@/server/team"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"

function tabTeam() {
  const [boards, setBoards] = useState([])
  const { boardData } = useGlobalSyncupContext()
  const { data: session } = useSession()
  const [selectedBoard, setSelectedBoard] = useState([""])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [boardUser, setBoardUser] = useState([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [teams, setTeams] = useState([])
  const [isCreated, setIsCreated] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editedTeam, setEditedTeam] = useState({})
  const [selectedTeams, setSelectedTeams] = useState([])

  const [page, setPage] = useState(1)
  const rowsPerPage = 5

  const startIndex = (page - 1) * rowsPerPage
  const endIndex = page * rowsPerPage
  const paginatedteams = teams.slice(startIndex, endIndex)
  const totalPages = Math.ceil(teams.length / rowsPerPage)
  const paginatedteamsSorted = paginatedteams
    .slice()
    .sort((a, b) => a.id - b.id)

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber)
  }
  useEffect(() => {
    async function fetchBoards() {
      try {
        const allBoards = boardData
        setBoards(allBoards)
        if (allBoards.length > 0) {
          const boardid = allBoards[0].id
          setSelectedBoard([boardid.toString()])
          const users = allBoards.find((board) => board.id === boardid)?.users
          setBoardUser(users)
        }
      } catch (error) {
        toast.error("Error fetching boards:", error)
      }
    }
    fetchBoards()
  }, [session])

  useEffect(() => {
    async function fetchTeamsData() {
      try {
        const fetchedTeams = await fetchTeams()
        const sortedTeams = fetchedTeams.sort((a, b) => a.id - b.id)
        setTeams(sortedTeams)
        setIsCreated(false)
      } catch (error) {
        toast.error("Error fetching teams:", error)
      }
    }
    fetchTeamsData()
  }, [isCreated])

  const handleOpenEditModal = (team) => {
    setIsEditModalOpen(true)
    setEditedTeam(team)
    setTeamName(team.name)
    setTeamDescription(team.description)
  }
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditedTeam({})
    setTeamName("")
    setTeamDescription("")
    setSelectedBoard([boards[0].id.toString()])
    setSelectedMembers([])
  }
  const handleEditTeam = async () => {
    try {
      await editTeam(
        editedTeam.id,
        teamName,
        teamDescription,
        Array.from(selectedMembers),
        selectedBoard[0],
      )
      setIsCreated(true)
      handleCloseEditModal()
      toast.success("Team updated successfully!")
    } catch (error) {
      toast.error("Error editing team:", error)
    }
  }

  const handleDeleteTeam = async (teamId) => {
    try {
      await deleteTeam(teamId)
      setIsCreated(true)
      toast.success("Team deleted successfully!")
    } catch (error) {
      toast.error("Error deleting team:", error)
    }
  }
  const handleBoardSelect = async (selectedboard) => {
    const selectedKeys = Array.from(selectedboard)
    if (selectedKeys.length === 0) {
      return true
    }
    setSelectedBoard(selectedKeys)
    setSelectedMembers([])
    const users = boardData.find(
      (board) => board.id === parseInt(selectedKeys, 10),
    )?.users
    setBoardUser(users)
    return false
  }

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Team name is required")
      return
    }

    if (/^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(teamName.trim())) {
      toast.error(
        "Team name should not start with a number or special character",
      )
      return
    }

    if (!teamDescription.trim()) {
      toast.error("Team description is required")
      return
    }

    if (
      /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(teamDescription.trim())
    ) {
      toast.error(
        "Team description should not start with a number or special character",
      )
      return
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member")
      return
    }

    try {
      await createTeam(teamName, teamDescription, Array.from(selectedMembers), [
        selectedBoard,
      ])
      setIsCreated(true)
      onClose()
      setTeamName("")
      setTeamDescription("")
      setSelectedBoard([boards[0].id.toString()])
      const users = boardData.find(
        (board) => board.id === boardData[0].id,
      )?.users
      setBoardUser(users)
      setSelectedMembers([])
      toast.success("Team created successfully!")
    } catch (error) {
      toast.error("Error creating team:", error)
    }
  }
  const handleDeleteMultipleTeams = async () => {
    try {
      if (selectedTeams.length === 0) {
        toast.error("Please select at least one team to delete.")
        return
      }
      let teamIdsToDelete = []
      if (selectedTeams === "all") {
        teamIdsToDelete = teams.map((team) => team.id)
      } else {
        teamIdsToDelete = Array.from(selectedTeams)
      }
      await Promise.all(
        teamIdsToDelete.map((teamId) => deleteTeam(parseInt(teamId, 10))),
      )
      setSelectedTeams([])
      setIsCreated(true)
      toast.success("Teams deleted successfully!")
    } catch (error) {
      toast.error("Error deleting teams:", error)
    }
  }

  const handleCloseModal = async () => {
    setTeamName("")
    setTeamDescription("")
    setSelectedBoard([boards[0].id.toString()])
    const users = boardData.find((board) => board.id === boardData[0].id)?.users
    setBoardUser(users)
    setSelectedMembers([])

    onClose()
  }
  return (
    <div style={{ maxHeight: "75vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px",
          marginRight: "20px",
        }}
      >
        {(selectedTeams.size > 0 || selectedTeams === "all") && (
          <Button
            className="mr-2"
            color="danger"
            variant="bordered"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteMultipleTeams()
            }}
          >
            {selectedTeams === "all" ? (
              <>Delete Teams</>
            ) : (
              <>Delete {Array.from(selectedTeams).length} Teams</>
            )}
          </Button>
        )}
        <Button color="secondary" variant="bordered" size="sm" onPress={onOpen}>
          Add Teams
        </Button>
      </div>
      <div
        className="overflow-Y no-scrollbar"
        style={{
          margin: "0 20px",
          maxHeight: "50vh",
        }}
      >
        <Table
          aria-label="Teams table"
          selectionMode="multiple"
          color="secondary"
          onSelectionChange={setSelectedTeams}
        >
          <TableHeader>
            <TableColumn>Team Name</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn>Boards</TableColumn>
            <TableColumn>Team Members</TableColumn>
            <TableColumn>Action</TableColumn>
          </TableHeader>
          <TableBody>
            {paginatedteamsSorted.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  {team.name.length > 15
                    ? `${team.name.substring(0, 20)}...`
                    : team.name}
                </TableCell>
                <TableCell>{team.description}</TableCell>
                <TableCell>
                  {team.boards.map((board) => (
                    <div key={board.id}>
                      {board.name.length > 15
                        ? `${board.name.substring(0, 15)}...`
                        : board.name}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <AvatarGroup isBordered max={2} size="sm">
                      {team.members.map((member) => (
                        <Tooltip
                          key={member.id}
                          placement="bottom"
                          showArrow
                          content={
                            member.name.length > 15 ? (
                              <>
                                {member.name
                                  .match(/.{1,15}/g)
                                  .map((line, idx) => (
                                    <div key={idx}>{line}</div>
                                  ))}
                              </>
                            ) : (
                              member.name
                            )
                          }
                        >
                          <Avatar
                            key={member.id}
                            name={member.name ? member.name.charAt(0) : ""}
                            size="sm"
                            src={member.photo}
                          />
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="relative flex gap-2 text-center justify-center">
                      <span
                        role="button"
                        tabIndex={0}
                        className={`text-2xl text-default-400 `}
                        onClick={() => handleOpenEditModal(team)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleOpenEditModal(team)
                          }
                        }}
                      >
                        <TbHomeEdit />
                      </span>

                      <Popover placement="top">
                        <PopoverTrigger>
                          <span className="text-2xl text-danger cursor-pointer">
                            <MdOutlineDeleteSweep />
                          </span>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px]">
                          <div className="text-small">
                            Are you sure you want to delete team?
                          </div>

                          <div className="ml-28">
                            <Button
                              color="danger"
                              size="sm"
                              className="capitalize"
                              onClick={() => handleDeleteTeam(team.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        onClose={handleCloseModal}
        className="max-h-screen overflow-y-auto no-scrollbar"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-[#7754bd] ">
            Add Teams
          </ModalHeader>
          <ModalBody>
            <Input
              isRequired
              size="sm"
              type="text"
              label="Team Name"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => {
                if (e.target.value.length <= 30) {
                  setTeamName(e.target.value)
                }
              }}
            />
            <Input
              isRequired
              size="sm"
              type="text"
              label="Description"
              placeholder="Enter team description"
              value={teamDescription}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setTeamDescription(e.target.value)
                }
              }}
            />
            <Select
              isRequired
              size="sm"
              label="Select the board"
              value={selectedBoard}
              selectedKeys={selectedBoard}
              onSelectionChange={handleBoardSelect}
            >
              {boards.map((board) => (
                <SelectItem key={board.id} value={board.id}>
                  {board.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              isRequired
              size="sm"
              label="Select members"
              selectionMode="multiple"
              selectedKeys={Array.from(selectedMembers)}
              onSelectionChange={setSelectedMembers}
            >
              {boardUser.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              variant="light"
              onPress={handleCloseModal}
            >
              CLOSE
            </Button>
            <Button color="secondary" onPress={handleSaveTeam}>
              SAVE
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        className="max-h-screen overflow-y-auto no-scrollbar"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-[#7754bd] ">
            Edit Teams
          </ModalHeader>
          <ModalBody>
            <Input
              isRequired
              size="sm"
              type="text"
              label="Team Name"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
            <Input
              isRequired
              size="sm"
              type="text"
              label="Description"
              placeholder="Enter team description"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
            />
            <Select
              isRequired
              size="sm"
              label="Select the board"
              value={selectedBoard}
              selectedKeys={selectedBoard}
              onSelectionChange={handleBoardSelect}
            >
              {boards.map((board) => (
                <SelectItem key={board.id} value={board.id}>
                  {board.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              isRequired
              size="sm"
              label="Select members"
              selectionMode="multiple"
              selectedKeys={Array.from(selectedMembers)}
              onSelectionChange={setSelectedMembers}
            >
              {boardUser.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onPress={handleEditTeam}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default tabTeam
