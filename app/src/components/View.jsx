import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
} from "@nextui-org/react"

import React, { useState } from "react"
import PropTypes from "prop-types"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import toast from "react-hot-toast"
import { createTitle, deleteTask } from "@/server/task"
import { assignLabelToCard, unassignLabelFromCard } from "@/server/label"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"

function View({ data, handleCardRowClick }) {
  const getInitials = (name) => {
    const names = name.split(" ")
    return names[0] && names[0][0] ? names[0][0].toUpperCase() : ""
  }
  const [page, setPage] = useState(1)
  const rowsPerPage = 6
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = page * rowsPerPage
  const paginatedData = data
    .flatMap((category) => category.cards)
    .slice(startIndex, endIndex)
  const pages = Math.ceil(
    data.reduce((acc, val) => acc + val.cards.length, 0) / rowsPerPage,
  )
  const [loading, setLoading] = useState(false)
  const { labels, setTableUpdate } = useGlobalSyncupContext()
  const [selectedKeys, setSelectedKeys] = React.useState(data.lable)
  const [selectedrows, setSelectedrows] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [cardName, setCardName] = useState()
  const [selectedCategory, setSelectedCategory] = useState()
  const [CardNameError, setCardNameError] = useState("")
  const [categoryError, setCategoryError] = useState("")
  const handleAdddelete = async () => {
    try {
      setLoading(true)
      if (selectedrows === "all") {
        const allCardIds = paginatedData.map((item) => item.id)
        setSelectedrows(allCardIds)
        await Promise.all(
          allCardIds.map(async (cardId) => {
            await deleteTask(parseInt(cardId, 10))
            setTableUpdate(true)
          }),
        )
        setLoading(false)
        setSelectedrows(new Set())
      } else {
        const selectedRowsArray = Array.from(selectedrows)
        await Promise.all(
          selectedRowsArray.map(async (cardId) => {
            await deleteTask(parseInt(cardId, 10))
          }),
        )
        setLoading(false)
        setTableUpdate(true)
        setSelectedrows(new Set())
      }
    } catch (error) {
      toast.error("Error deleting card")
      setLoading(false)
    }
  }

  const handleSelectionChange = async (cardId, selectedLabels = []) => {
    const currentLabels = selectedKeys ? Array.from(selectedKeys) : []
    const newlySelectedLabels = Array.from(selectedLabels)
    const labelsToUnassign = currentLabels.filter(
      (labelId) => !newlySelectedLabels.includes(labelId),
    )
    await Promise.all(
      labelsToUnassign.map(async (labelId) => {
        await unassignLabelFromCard(cardId, labelId)
        setTableUpdate(true)
      }),
    )

    await Promise.all(
      newlySelectedLabels.map(async (labelId) => {
        await assignLabelToCard(cardId, labelId)
        setTableUpdate(true)
      }),
    )

    setSelectedKeys(new Set(newlySelectedLabels))
  }

  const handleAddCard = async () => {
    if (cardName === "") {
      setCardNameError("Please enter a card name.")
      return
    }
    setCardNameError("")

    if (selectedCategory.length === 0) {
      setCategoryError("Please select a category.")
      return
    }
    setCategoryError("")

    const taskid = selectedCategory.target.value
    try {
      await createTitle({ title: cardName }, parseInt(taskid, 10))
      setCardName("")
      setIsOpen(false)
      setTableUpdate(true)
    } catch (error) {
      toast.error("Error creating card")
    }
  }
  const totalCards = data.reduce(
    (total, category) => total + category.cards.length,
    0,
  )
  const formatDate = (date) => {
    const options = { month: "short", day: "numeric" }
    return new Date(date).toLocaleDateString("en-US", options)
  }
  return (
    <div className="mr-4 mt-4">
      <Table
        color="secondary"
        className="ml-2 mt-1"
        selectionMode="multiple"
        selectedKeys={selectedrows}
        onSelectionChange={setSelectedrows}
        onRowAction={(event) => {
          try {
            const checkboxClicked = event.target?.type === "checkbox"
            if (!checkboxClicked) {
              event.preventDefault()
            }
          } catch (error) {
            setSelectedCategory([])
          }
        }}
        topContent={
          <span className="ml-2">
            <Popover
              placement="right-start"
              shouldBlockScroll
              isOpen={isOpen}
              onOpenChange={setIsOpen}
            >
              <PopoverTrigger>
                <Button
                  size="sm"
                  className="mr-2 h-7"
                  color="secondary"
                  onClick={() => {
                    setSelectedCategory([])
                    setSelectedCategory("")
                    setCardName("")
                    setCategoryError("")
                    setCardNameError("")
                    setIsOpen(true)
                  }}
                >
                  Add Card
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="px-1 py-2">
                  <div className="text-small ">Card Name</div>

                  <Input
                    placeholder="Enter card name "
                    minRows={1}
                    value={cardName}
                    errorMessage={CardNameError}
                    className="mt-1"
                    onChange={(e) => {
                      setCardName(e.target.value)
                      setCardNameError("")
                    }}
                  />
                  <div className="text-small mt-1">Select Category</div>
                  <Select
                    className="mt-1"
                    errorMessage={categoryError}
                    placeholder="Select category"
                    style={{
                      maxWidth: "208px",
                    }}
                    value={selectedCategory}
                    onChange={(value) => {
                      setSelectedCategory(value)
                      setCategoryError("")
                    }}
                  >
                    {data.map((item) => (
                      <SelectItem
                        className="h-5 overflow-hidden"
                        key={item.id}
                        value={item.title}
                      >
                        {item.title}
                      </SelectItem>
                    ))}
                  </Select>
                  <div className=" flex justify-end">
                    <Button
                      color="secondary"
                      className="mt-2 "
                      onClick={() => {
                        handleAddCard()
                      }}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {(selectedrows.size > 0 || selectedrows === "all") && (
              <Button
                size="sm"
                isLoading={loading}
                color="danger"
                className="h-7"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAdddelete()
                }}
              >
                {selectedrows === "all" ? (
                  <>Delete {totalCards} Card</>
                ) : (
                  <>Delete {Array.from(selectedrows).length} Card</>
                )}
              </Button>
            )}
          </span>
        }
      >
        <TableHeader>
          <TableColumn style={{ minWidth: "140px" }}>CARD</TableColumn>
          <TableColumn style={{ minWidth: "140px" }}>CATEGORY</TableColumn>
          <TableColumn style={{ minWidth: "140px" }}>DESCRIPTION</TableColumn>
          <TableColumn style={{ minWidth: "140px", paddingLeft: "25px" }}>
            LABLES
          </TableColumn>
          <TableColumn style={{ minWidth: "140px" }}>MEMBERS</TableColumn>
          <TableColumn style={{ minWidth: "140px" }}>DUE DATE</TableColumn>
        </TableHeader>
        <TableBody>
          {paginatedData
            .filter((card) => card.status === "active")
            .map((card) => (
              <TableRow
                key={card.id}
                onClick={() => handleCardRowClick(card, card.id)}
              >
                <TableCell
                  style={{
                    maxWidth: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {card.name || "-"}
                </TableCell>
                <TableCell
                  style={{
                    maxWidth: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {
                    data.find((category) =>
                      category.cards.find((c) => c.id === card.id),
                    ).title
                  }
                </TableCell>
                <TableCell
                  style={{
                    maxWidth: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={card.description}
                >
                  {card.description || "-"}
                </TableCell>
                <TableCell>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button className="bg-null">
                        {card.label && card.label.length > 0 ? (
                          <div>
                            {card.label.length > 1 ? (
                              <>
                                <Chip
                                  radius="sm"
                                  className="text-white dark:text-900"
                                  style={{
                                    backgroundColor: card.label[0].color,
                                    marginRight: "5px",
                                  }}
                                  title={card.label[0].name}
                                >
                                  <span
                                    style={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow:
                                        card.label[0].name.length > 12
                                          ? "ellipsis"
                                          : "unset",
                                    }}
                                  >
                                    {card.label[0].name.length > 12
                                      ? `${card.label[0].name.slice(0, 12)}...`
                                      : card.label[0].name}
                                  </span>
                                </Chip>
                                <span>+{card.label.length - 1}</span>
                              </>
                            ) : (
                              <Chip
                                radius="sm"
                                className="text-white"
                                style={{
                                  backgroundColor: card.label[0].color,
                                  marginRight: "5px",
                                }}
                                title={card.label[0].name}
                              >
                                <span
                                  style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow:
                                      card.label[0].name.length > 12
                                        ? "ellipsis"
                                        : "unset",
                                  }}
                                >
                                  {card.label[0].name.length > 12
                                    ? `${card.label[0].name.slice(0, 12)}...`
                                    : card.label[0].name}
                                </span>
                              </Chip>
                            )}
                          </div>
                        ) : (
                          "No labels"
                        )}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      className="w-48 max-h-52 overflow-auto no-scrollbar dark:text-900"
                      variant="flat"
                      closeOnSelect={false}
                      selectionMode="multiple"
                      defaultSelectedKeys={card.label.map((item) => item.id)}
                      onSelectionChange={(Keys) => {
                        setSelectedKeys(Keys)
                        handleSelectionChange(Keys, card.id)
                      }}
                    >
                      {labels.map((item) => (
                        <DropdownItem
                          key={item.id}
                          style={{ backgroundColor: item.color }}
                          className="text-white dark:text-900"
                        >
                          {item.name}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
                <TableCell style={{ maxWidth: "100px" }}>
                  {card.assignedUsers.length > 0 ? (
                    <AvatarGroup
                      className="flex w-full items-start justify-start"
                      max={3}
                      total={card.assignedUsers.length}
                      renderCount={(count) =>
                        count > 3 && (
                          <p className="text-small text-foreground font-medium ms-2">
                            +{count - 3}
                          </p>
                        )
                      }
                    >
                      {card.assignedUsers.map((user, index) => (
                        <Avatar
                          key={index}
                          showFallback
                          name={getInitials(user.name)}
                        />
                      ))}
                    </AvatarGroup>
                  ) : (
                    <p className="ml-2"> No members</p>
                  )}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <AccessTimeIcon fontSize="small" />
                    <span className="color-black">
                      {card.dueDate ? formatDate(card.dueDate) : "-"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <div className="flex w-full justify-end pr-5 	">
        <Pagination
          page={page}
          isCompact
          className="mt-[1.5px]"
          showControls
          showShadow
          size="sm"
          total={pages}
          color="secondary"
          onChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  )
}

View.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      cards: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
      label: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  handleCardRowClick: PropTypes.func.isRequired,
}

export default View
