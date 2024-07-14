"use client"

import React, { useEffect, useState } from "react"
import { Draggable, DropResult, Droppable } from "react-beautiful-dnd"
import { Box, Stack, useMediaQuery } from "@mui/material"
import {
  CircularProgress,
  Card,
  CardHeader,
  CardBody,
  Button,
  Avatar,
  AvatarGroup,
  AvatarIcon,
  Badge,
  Tooltip,
  Input,
} from "@nextui-org/react"
import PropTypes from "prop-types"
import AttachmentIcon from "@mui/icons-material/Attachment"
import InsertCommentIcon from "@mui/icons-material/InsertComment"
import Link from "next/link"

import { useParams, useRouter } from "next/navigation"

import { FaFlag } from "react-icons/fa"
import toast from "react-hot-toast"
import { useSession } from "next-auth/react"
import Loader from "./Loader"
import DndContext from "../context/DndContext"
import CardOption from "./CardOption"
import {
  updateCardPositionInDB,
  moveCardToList,
} from "@/server/UpdateCardOrder"
import { createTitle } from "@/server/task"
import { createTask, editCategory } from "@/server/category"
import { useGlobalSyncupContext } from "../context/SyncUpStore"
import CategoryOptions from "./CategoryOptions"
import GetSyncupData from "../../server/GetSyncupData"
import View from "./View"

function Cards({ boardId }) {
  const {
    data,
    setData,
    setLoad,
    load,
    categoryLoad,
    setCategoryLoad,
    TableView,
    boardData,
    setcreatenotification,
    setupdate,
    defaultload,
    setDefaultLoad,
    setudpateboard,
  } = useGlobalSyncupContext()
  const router = useRouter()
  const orgname = useParams()
  const [id, setId] = useState<number>(null)
  const [inputfeild, showInput] = useState(false)
  const [categoryedit, setcategory] = useState(false)
  const [flag, setFlag] = useState(true)
  const [newListInput, setNewListInput] = useState("")
  const isSmallScreen = useMediaQuery("(max-width: 400px)")
  const [inputFieldVisible, setInputFieldVisible] = useState(false)
  const [boarduser, setboarduser] = useState([])
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const userName = session?.user?.name

  const handleCardRowClick = (cardid) => {
    router.push(`/${orgname.organization}/board/${boardId}/${cardid.id}`)
  }
  const fetchboard = async () => {
    const board = boardData.map((boards) => boards.users)
    const userIds = board.flat().map((user) => user.id)
    setboarduser(userIds)
  }
  const fetchData = async () => {
    try {
      const updatedData = await GetSyncupData(boardId)
      setData(updatedData)
    } catch (error) {
      toast.error("Error fetching data")
    } finally {
      setLoad(false)
      setCategoryLoad(false)
    }
  }
  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result
    if (!destination) return
    const newData = [...data]
    const sourceIndex = source.index
    const destIndex = destination.index

    if (source.droppableId === destination.droppableId) {
      const droppableIndex = parseInt(
        destination.droppableId.replace("droppable", ""),
        10,
      )
      const task = newData[droppableIndex]
      const [movedCard] = task.cards.splice(sourceIndex, 1)
      task.cards.splice(destIndex, 0, movedCard)

      task.cards.forEach((card, index) => {
        const updatedCard = { ...card, order: index }
        task.cards[index] = updatedCard
      })
      setData(newData)
      try {
        await Promise.all(
          task.cards.map(async (card) => {
            await updateCardPositionInDB(card.id, task.id, card.order)
          }),
        )
        fetchData()
      } catch (error) {
        toast.error("Error updating card position")
      }
    } else {
      const sourceDroppableIndex = parseInt(
        source.droppableId.replace("droppable", ""),
        10,
      )
      const destDroppableIndex = parseInt(
        destination.droppableId.replace("droppable", ""),
        10,
      )
      const movedCard = newData[sourceDroppableIndex].cards[sourceIndex]

      newData[sourceDroppableIndex].cards.splice(sourceIndex, 1)

      newData[sourceDroppableIndex].cards = newData[
        sourceDroppableIndex
      ].cards.map((card, index) => ({
        ...card,
        order: index,
      }))

      newData[destDroppableIndex].cards = newData[destDroppableIndex].cards.map(
        (card, index) => ({
          ...card,
          order: index,
        }),
      )

      newData[destDroppableIndex].cards.splice(destIndex, 0, movedCard)
      newData[destDroppableIndex].cards = newData[destDroppableIndex].cards.map(
        (card, index) => ({
          ...card,
          order: index,
        }),
      )

      setData(newData)
      try {
        await Promise.all(
          newData[destDroppableIndex].cards.map(async (card) => {
            await updateCardPositionInDB(
              card.id,
              newData[destDroppableIndex].id,
              card.order,
            )
          }),
        )
        fetchData()
      } catch (error) {
        toast.error("Error updating card position")
      }
    }
    fetchData()
  }
  const [, setError] = useState("")

  const [title, setTitle] = useState("")
  const handleTitleChange = (e) => {
    setTitle(e.target.value)
    setFlag(false)
  }
  const [submitted, setSubmitted] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoad(true)
    showInput(false)
    setFlag(true)
    await createTitle({ title }, id, boarduser, userName)
    setLoad(false)
    setcreatenotification(false)

    setTitle("")
    setSubmitted(true)
    fetchData()
  }

  const handleAddListClick = () => {
    setInputFieldVisible(true)
  }

  const handleAddListClose = async () => {
    setInputFieldVisible(false)
  }
  const handleTitleSubmit = async (e) => {
    const newTitle = e.target.value.trim()
    if (newTitle === "") {
      setError("Category name cannot be empty")
      e.target.focus()
      return
    }
    e.preventDefault()
    editCategory(name, id)
    setudpateboard(true)
    setcategory(false)
    fetchData()
  }
  const handelChange = async (e) => {
    setName(e.target.value)
  }

  const handleAddList = async () => {
    try {
      if (newListInput.trim() === "") {
        handleAddListClose()
      } else if (newListInput.trim() !== "") {
        setCategoryLoad(true)
        await createTask(newListInput, boardId, "#8e78b6", boarduser, userName)
        setupdate(true)
        setcreatenotification(false)
        setNewListInput("")
        setInputFieldVisible(false)
      }
      fetchData()
    } catch (error) {
      toast.error("Error creating list")
    }
  }

  const toSentenceCase = (str) => {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const priorityIconMapping = {
    highest: <FaFlag color="red" className="w-4 h-4 mr-2 ml-2" />,
    high: <FaFlag color="rgba(255, 0, 0, 0.5)" className="w-4 h-4 mr-2 ml-2" />,
    medium: <FaFlag color="rgb(252, 220, 42)" className="w-4 h-4 mr-2" />,
    low: <FaFlag color="rgba(0, 128, 0, 0.5)" className="w-4 h-4 mr-2 ml-2" />,
    lowest: <FaFlag color="green" className="w-4 h-4 mr-2 ml-2" />,
  }

  useEffect(() => {
    fetchboard()
    setDefaultLoad(false)
  }, [boardId, boardData, defaultload])

  return TableView ? (
    <View data={data} handleCardRowClick={handleCardRowClick} />
  ) : defaultload ? (
    <Loader />
  ) : (
    <DndContext onDragEnd={onDragEnd}>
      <Stack
        direction={{ xs: "row", sm: "row" }}
        spacing={{ xs: 1, sm: 2, md: 4 }}
        className={`overflow-x-scroll no-scrollbar ${
          isSmallScreen ? "min-w-80 ml-5" : "ml-3"
        }`}
      >
        {data?.map((val, index) => (
          <Droppable key={index} droppableId={`droppable${index}`}>
            {(provided) => (
              <Box>
                <Box className="overflow-x-auto">
                  {categoryedit && val.id === id ? (
                    <Input
                      color="secondary"
                      style={{
                        padding: "0.75rem 0.75rem",
                        fontWeight: "bold",
                      }}
                      className={`flex justify-between mb-2 ${
                        isSmallScreen ? "min-w-80" : "w-56"
                      } mt-3 dark:text-white py-2 px-2 border-gray-400 bg-800:bg-800 rounded shadow`}
                      defaultValue={val.title}
                      onBlur={handleTitleSubmit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleTitleSubmit(e)
                        }
                      }}
                      onChange={handelChange}
                    />
                  ) : (
                    <div
                      style={{ backgroundColor: val.color || "#8e78b6" }}
                      className={`dark:bg-800 flex justify-between mb-2 ${
                        isSmallScreen ? "min-w-80" : "w-56"
                      } mt-5 font-bold text-white py-2 px-2 border-gray-400 dark:bg-800 rounded shadow`}
                    >
                      <span className="truncate">
                        {toSentenceCase(val.title)}
                      </span>
                      <span>
                        <CategoryOptions
                          taskid={val.id}
                          boardid={boardId}
                          setcategory={setcategory}
                          setId={setId}
                        />
                      </span>
                    </div>
                  )}
                </Box>
                <Box
                  style={{
                    minHeight: "1rem",
                    height: "auto",
                  }}
                  className={`crd-height overflow-y-scroll no-scrollbar ${isSmallScreen ? "min-w-80" : "w-56"}`}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {val?.cards
                    ?.filter((card) => card.status === "active")
                    ?.map((card, indexId) => (
                      <Draggable
                        key={card.id}
                        draggableId={card?.id?.toString()}
                        index={indexId}
                      >
                        {(provideded) => (
                          <Card
                            className=" dark:bg-900  card rounded mb-3 shadow-none"
                            {...provideded.dragHandleProps}
                            {...provideded.draggableProps}
                            ref={provideded.innerRef}
                          >
                            <Badge
                              showOutline={false}
                              className="bg-transparent top-1"
                              placement="top-left"
                              content={
                                <Tooltip
                                  content={card.priority || "medium"}
                                  color="secondary"
                                >
                                  <span
                                    className="mt-3 relative"
                                    style={{ zIndex: "1" }}
                                  >
                                    {card.priority === "medium" ? (
                                      <FaFlag
                                        color="rgb(252, 220, 42)"
                                        className="w-4 h-4"
                                      />
                                    ) : (
                                      priorityIconMapping[
                                        card.priority || "medium"
                                      ]
                                    )}
                                  </span>
                                </Tooltip>
                              }
                            >
                              <CardBody
                                onClick={() => {
                                  setId(card.id)
                                }}
                                className="py-0 px-2"
                              >
                                <Link
                                  legacyBehavior
                                  href={`/${orgname.organization}/board/${boardId}/${card.id}`}
                                  passHref
                                >
                                  <a
                                    className="cursor-pointer"
                                    style={{
                                      textDecoration: "none",
                                      height: "100%",
                                    }}
                                  >
                                    <CardHeader className="flex justify-between p-2 pt-4 ">
                                      <span
                                        className="flex"
                                        style={{
                                          maxWidth:
                                            card.name.length > 15
                                              ? "150px"
                                              : "auto",
                                          wordWrap:
                                            card.name.length > 30
                                              ? "break-word"
                                              : "normal",
                                        }}
                                      >
                                        <span className="block max-h-[4.8em] leading-[1.2em] overflow-hidden">
                                          <span
                                            style={{
                                              display: "-webkit-box",
                                              WebkitBoxOrient: "vertical",
                                              WebkitLineClamp: 2,
                                              overflow: "hidden",
                                            }}
                                          >
                                            {toSentenceCase(card.name)}
                                          </span>
                                        </span>
                                      </span>
                                      <span
                                        onClick={(e) => {
                                          e.stopPropagation()
                                        }}
                                        onKeyDown={(e) => {
                                          e.stopPropagation()
                                          if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                          ) {
                                            e.preventDefault()
                                          }
                                        }}
                                        role="button"
                                        tabIndex={0}
                                      >
                                        <div
                                          onClick={(e) => e.preventDefault()}
                                          onKeyDown={(e) => {
                                            e.stopPropagation()
                                            if (
                                              e.key === "Enter" ||
                                              e.key === " "
                                            ) {
                                              e.preventDefault()
                                            }
                                          }}
                                          role="button"
                                          tabIndex={0}
                                        >
                                          <div
                                            style={{
                                              position: "absolute",
                                              top: 3,
                                              right: 11,
                                            }}
                                          >
                                            <CardOption
                                              taskId={card.id}
                                              currentListId={val.id}
                                              moveCardToList={moveCardToList}
                                              cardTitle={card.name}
                                              boardId={boardId}
                                              boarduser={boarduser}
                                              username={userName}
                                            />
                                          </div>
                                        </div>
                                      </span>
                                    </CardHeader>
                                    <Box className="m-0 rounded-none ">
                                      <Box className="flex justify-start my-2">
                                        {card.label && card.label.length > 0 ? (
                                          <>
                                            {card.label
                                              .slice(0, 2)
                                              .map((label, labelIndex) => (
                                                <div
                                                  key={labelIndex}
                                                  className="text-black overflow-hidden font-semibold h-6 inline-flex items-center justify-center px-2 rounded-xl text-xs"
                                                  style={{
                                                    backgroundColor:
                                                      label.color,
                                                    marginRight:
                                                      labelIndex < 2
                                                        ? "3px"
                                                        : 0,
                                                  }}
                                                >
                                                  <Tooltip
                                                    content={
                                                      label.name.length > 25 ? (
                                                        <>
                                                          {label.name
                                                            .match(/.{1,25}/g)
                                                            .map(
                                                              (line, idx) => (
                                                                <div key={idx}>
                                                                  {line}
                                                                </div>
                                                              ),
                                                            )}
                                                        </>
                                                      ) : (
                                                        label.name
                                                      )
                                                    }
                                                  >
                                                    <span className="dark:text-900">
                                                      {label.name.length > 12
                                                        ? `${label.name.slice(
                                                            0,
                                                            12,
                                                          )}...`
                                                        : label.name}
                                                    </span>
                                                  </Tooltip>
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
                                          <span />
                                        )}
                                      </Box>
                                    </Box>
                                    <Box className="flex items-center justify-between">
                                      <Box>
                                        <Box
                                          className="inline-block"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                          }}
                                        >
                                          <span className="inline-block">
                                            <AttachmentIcon className="text-gray-600 dark:text-text" />
                                          </span>
                                          <span className="inline-block mr-3 text-sm ml-1 dark:text-text">
                                            {card.attachments.length}
                                          </span>
                                        </Box>
                                        <Box
                                          className="inline-block"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                          }}
                                        >
                                          <InsertCommentIcon className="text-base text-gray-600 dark:text-text" />
                                          <span className="inline-block mr-3 text-sm ml-1  dark:text-text">
                                            {card.comments.length}
                                          </span>
                                        </Box>
                                      </Box>

                                      <Box className="flex mb-2">
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
                                                  content={
                                                    user.name.length > 15 ? (
                                                      <>
                                                        {user.name
                                                          .match(/.{1,15}/g)
                                                          .map((line, idx) => (
                                                            <div key={idx}>
                                                              {line}
                                                            </div>
                                                          ))}
                                                      </>
                                                    ) : (
                                                      user.name
                                                    )
                                                  }
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
                                      </Box>
                                    </Box>
                                  </a>
                                </Link>
                              </CardBody>
                            </Badge>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                  {inputfeild && val.id === id && (
                    <form id="input" onSubmit={handleSubmit}>
                      <input
                        autoFocus
                        value={toSentenceCase(title)}
                        type="text"
                        onChange={handleTitleChange}
                        onBlur={handleSubmit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmit(e)
                        }}
                        className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                        placeholder="Enter the title"
                      />
                    </form>
                  )}
                </Box>
                <Box className="flex justify-center">
                  {load && val.id === id ? (
                    <CircularProgress style={{ color: "#ed7620" }} />
                  ) : (
                    <Button
                      form="input"
                      type={flag ? "button" : "submit"}
                      className="flex w-3/5 justify-center items-center bg-[#ede7f6]  my-1.5 text-[#7754bd]  hover:bg-[#8e78b6] hover:text-white font-semibold  px-1 py-1 border border-gray-400 rounded-lg shadow dark:bg-700 dark:text-black"
                      onClick={() => {
                        if (val.id !== id || !submitted || !inputfeild) {
                          setId(val.id)
                          showInput(true)
                          setSubmitted(false)
                        } else {
                          setSubmitted(false)
                        }
                      }}
                    >
                      Add Card +
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Droppable>
        ))}

        <Box>
          <Box>
            {inputFieldVisible && !categoryLoad && (
              <input
                autoFocus
                type="text"
                value={toSentenceCase(newListInput)}
                onChange={(e) => setNewListInput(e.target.value)}
                onBlur={handleAddList}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddList()
                  }
                }}
                className="w-48 p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 mt-5"
                placeholder="Enter list name"
              />
            )}
          </Box>
          <Box>
            {categoryLoad ? (
              <CircularProgress className="mt-4" style={{ color: "#ed7620" }} />
            ) : (
              <Button
                type="button"
                className={`flex mt-5 font-semibold justify-center items-center bg-[#683ab7] text-white hover:bg-[#7754BC] px-4 py-2 border dark:bg-700 dark:text-black border-gray-400 rounded shadow ${
                  inputFieldVisible ? "w-16 mt-2 mx-auto" : "w-48"
                }`}
                onClick={inputFieldVisible ? handleAddList : handleAddListClick}
              >
                {inputFieldVisible ? "Add+" : "Add List"}
              </Button>
            )}
          </Box>
        </Box>
      </Stack>
    </DndContext>
  )
}

Cards.propTypes = {
  boardId: PropTypes.number.isRequired,
}

export default Cards
