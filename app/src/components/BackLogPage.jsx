import React, { useState, useEffect } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  AvatarGroup,
  AvatarIcon,
  Tooltip,
  Accordion,
  AccordionItem,
  Pagination,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react"
import toast from "react-hot-toast"
import { CiSearch } from "react-icons/ci"
import { HiMiniChevronUpDown } from "react-icons/hi2"
import { FaFlag } from "react-icons/fa"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { getAllboards } from "@/server/board"
import GetSyncupData from "@/server/GetSyncupData"

function BackLogPage() {
  const { data: session } = useSession()
  const orgName = useParams()
  const userEmail = session?.user?.email
  const [boards, setBoards] = useState([])
  const [selectedBoardId, setSelectedBoardId] = useState(null)
  const [boardData, setBoardData] = useState(null)
  const [selectedrows, setSelectedrows] = useState([])
  const [page, setPage] = useState(1)
  const [sortOrder, setSortOrder] = useState("asc")
  const [searchQuery, setSearchQuery] = useState("")
  const rowsPerPage = 3

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const fetchedBoards = await getAllboards(
          userEmail,
          orgName.organization,
        )
        setBoards(fetchedBoards)
        if (fetchedBoards.length > 0) {
          setSelectedBoardId(fetchedBoards[0].id)
        }
      } catch (error) {
        toast.error("Error fetching boards")
      }
    }
    fetchBoards()
  }, [])

  useEffect(() => {
    const fetchBoardData = async () => {
      if (selectedBoardId) {
        try {
          const data = await GetSyncupData(selectedBoardId)
          setBoardData(data)
        } catch (error) {
          toast.error("Error fetching board data")
        }
      }
    }
    fetchBoardData()
  }, [selectedBoardId])

  const handleBoardChange = (value) => {
    setSelectedBoardId(value)
  }

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber)
  }

  const sortCardsByPriority = (cards) => {
    const priorityOrder = ["highest", "high", "medium", "low", "lowest"]
    if (sortOrder === "asc") {
      return cards.sort((a, b) =>
        priorityOrder.indexOf(a.priority) > priorityOrder.indexOf(b.priority)
          ? 1
          : -1,
      )
    }
    return cards.sort((a, b) =>
      priorityOrder.indexOf(a.priority) < priorityOrder.indexOf(b.priority)
        ? 1
        : -1,
    )
  }

  let hasBacklog = false
  const allBacklogCards = boardData
    ? boardData
        .filter((board) => board.title === "Backlog")
        .flatMap((board) => board.cards)
    : []

  const sortedBacklogCards = sortCardsByPriority(allBacklogCards)

  const startIndex = (page - 1) * rowsPerPage
  const endIndex = page * rowsPerPage

  const filteredCards = sortedBacklogCards.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSortOrder = (value) => {
    setSortOrder(value.currentKey)
  }

  const paginatedCards = filteredCards.slice(startIndex, endIndex)

  return (
    <>
      <div className="mt-5">
        <span className="text-xl font-medium p-5">Backlogs</span>
      </div>
      <div className="mt-5 overflow-y-scroll max-h-[70vh] no-scrollbar">
        <Accordion variant="splitted" defaultExpandedKeys={["1"]}>
          {boards.map((board) => (
            <AccordionItem
              key={board.id}
              aria-label={`Accordion ${board.id}`}
              onPress={() => handleBoardChange(board.id)}
              title={board.name}
            >
              <div>
                {boardData &&
                  boardData.map((backBoard) => {
                    if (backBoard.title === "Backlog") {
                      hasBacklog = true
                      return (
                        <div key={backBoard.id}>
                          {hasBacklog && (
                            <div className="flex gap-3 mb-2">
                              <Input
                                classNames={{
                                  base: "max-w-[10rem] h-8",
                                  mainWrapper: "h-full",
                                  input: "text-small",
                                  inputWrapper:
                                    "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                                }}
                                color="secondary"
                                placeholder="Type to search..."
                                size="sm"
                                startContent={<CiSearch size={18} />}
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                              <Select
                                disallowEmptySelection
                                placeholder="Select workspace"
                                className="max-w-[10rem]"
                                aria-label="order"
                                size="sm"
                                selectedKeys={[sortOrder]}
                                onSelectionChange={handleSortOrder}
                                color="secondary"
                              >
                                <SelectItem
                                  key="asc"
                                  value="asc"
                                  color="secondary"
                                >
                                  High to Low
                                </SelectItem>
                                <SelectItem
                                  key="desc"
                                  value="desc"
                                  color="secondary"
                                >
                                  Low to High
                                </SelectItem>
                              </Select>
                            </div>
                          )}
                          <div>
                            <Table
                              selectedKeys={selectedrows}
                              onSelectionChange={setSelectedrows}
                              removeWrapper
                            >
                              <TableHeader>
                                <TableColumn>Title</TableColumn>
                                <TableColumn>Description</TableColumn>
                                <TableColumn
                                  onClick={() => {
                                    setSortOrder(
                                      sortOrder === "asc" ? "desc" : "asc",
                                    )
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div className="flex">
                                    <p>Priority</p>
                                    <span className="mt-1 ml-1">
                                      <HiMiniChevronUpDown />
                                    </span>
                                  </div>
                                </TableColumn>
                                <TableColumn>Labels</TableColumn>
                                <TableColumn>Members</TableColumn>
                              </TableHeader>
                              <TableBody>
                                {paginatedCards.map((card) => (
                                  <TableRow key={card.id}>
                                    <TableCell>
                                      {card.name.length > 30
                                        ? `${card.name.slice(0, 20)}...`
                                        : card.name}
                                    </TableCell>
                                    <TableCell>
                                      {card?.description?.length > 30
                                        ? `${card?.description?.slice(0, 20)}...`
                                        : card?.description || "-"}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex">
                                        <FaFlag
                                          color={
                                            card.priority === "highest"
                                              ? "red"
                                              : card.priority === "high"
                                                ? "rgba(255, 0, 0, 0.5)"
                                                : card.priority === "medium"
                                                  ? "rgba(252, 220, 42, 1)"
                                                  : card.priority === "low"
                                                    ? "rgba(0, 128, 0, 0.5)"
                                                    : card.priority === "lowest"
                                                      ? "green"
                                                      : ""
                                          }
                                          className="w-4 h-4"
                                        />
                                        <span className="ml-2">
                                          {card.priority
                                            .charAt(0)
                                            .toUpperCase() +
                                            card.priority.slice(1)}
                                        </span>
                                      </div>
                                    </TableCell>

                                    <TableCell>
                                      {card.label && card.label.length > 0 ? (
                                        <>
                                          {card.label
                                            .slice(0, 2)
                                            .map((label, labelIndex) => (
                                              <div
                                                key={labelIndex}
                                                className="text-black overflow-hidden font-semibold h-6 inline-flex items-center justify-center px-2 rounded-xl text-xs"
                                                style={{
                                                  backgroundColor: label.color,
                                                  marginRight:
                                                    labelIndex < 2 ? "3px" : 0,
                                                }}
                                                title={label.name}
                                              >
                                                <span
                                                  className="dark:text-900"
                                                  style={{
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow:
                                                      label.name.length > 12
                                                        ? "ellipsis"
                                                        : "unset",
                                                  }}
                                                >
                                                  {label.name.length > 12
                                                    ? `${label.name.slice(0, 12)}...`
                                                    : label.name}
                                                </span>
                                              </div>
                                            ))}
                                          {card.label.length > 2 && (
                                            <div className="text-xs inline-block font-medium">
                                              <div className="rounded-full border border-gray-400 flex items-center justify-center h-7 w-7 dark:text-text">
                                                +{card.label.length - 2}
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <span>-</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex">
                                        {card.assignedUsers.length > 0 ? (
                                          <AvatarGroup
                                            className="mt-1"
                                            size="sm"
                                            max={2}
                                            total={card.assignedUsers.length}
                                            renderCount={(count) =>
                                              count > 2 && (
                                                <Avatar
                                                  isBordered
                                                  name={`+${count - 2}`}
                                                  size="sm"
                                                  style={{
                                                    height: "1.5rem",
                                                    width: "1.5rem",
                                                  }}
                                                />
                                              )
                                            }
                                          >
                                            {card.assignedUsers
                                              .slice(0, 3)
                                              .map((user, cardIndex) => (
                                                <Tooltip
                                                  placement="bottom"
                                                  showArrow
                                                  content={user.name}
                                                  key={cardIndex}
                                                >
                                                  <Avatar
                                                    className="w-6 h-6 text-6"
                                                    isBordered
                                                    key={cardIndex}
                                                    name={
                                                      user.name
                                                        ? user.name.charAt(0)
                                                        : ""
                                                    }
                                                    size="sm"
                                                    src={user.photo}
                                                    style={{
                                                      height: "1.5rem",
                                                      width: "1.5rem",
                                                      margin: "auto",
                                                    }}
                                                  />
                                                </Tooltip>
                                              ))}
                                          </AvatarGroup>
                                        ) : (
                                          <div className="flex items-center">
                                            <Tooltip
                                              placement="bottom"
                                              showArrow
                                              content="No users assigned"
                                            >
                                              <Avatar
                                                isBordered
                                                icon={<AvatarIcon />}
                                                className="text-black/80 dark:bg-900 dark:text-text dark:border-900 "
                                                size="sm"
                                                style={{
                                                  height: "1.5rem",
                                                  width: "1.5rem",
                                                }}
                                              />
                                            </Tooltip>
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <div className="flex w-full justify-end pr-4">
                              <Pagination
                                page={page}
                                isCompact
                                className="mt-[1.5px]"
                                showControls
                                showShadow
                                size="sm"
                                total={Math.ceil(
                                  filteredCards.length / rowsPerPage,
                                )}
                                color="secondary"
                                onChange={handlePageChange}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })}
                {!hasBacklog && (
                  <div key={board.id}>No category present with backlogs</div>
                )}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
        {boards.length < 1 && <div>No Boards Are Present</div>}
      </div>
    </>
  )
}

export default BackLogPage
