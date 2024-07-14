/* eslint-disable no-await-in-loop */

"use client"

import React, { useEffect, useState } from "react"
import {
  Modal,
  ModalContent,
  ModalBody,
  Divider,
  Button,
  Breadcrumbs,
  BreadcrumbItem,
  Avatar,
  AvatarGroup,
  Select,
  SelectItem,
  Chip,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Checkbox,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Tooltip,
  Card,
  DateRangePicker,
} from "@nextui-org/react"
import { useSession } from "next-auth/react"
import { FaFlag } from "react-icons/fa"
import { GoAlertFill } from "react-icons/go"
import {
  IoAddOutline,
  IoAttachOutline,
  IoClose,
  IoEyeOutline,
} from "react-icons/io5"
import {
  IoMdSend,
  IoMdPeople,
  IoMdCheckmarkCircleOutline,
} from "react-icons/io"
import {
  MdOutlineFileDownload,
  MdDescription,
  MdLocalOffer,
  MdLink,
  MdInsertComment,
  MdErrorOutline,
  MdOutlineMoreHoriz,
  MdEdit,
} from "react-icons/md"
import { Editor, EditorState, convertFromRaw } from "draft-js"
import { BiSolidCalendar, BiSolidTrashAlt } from "react-icons/bi"
import dayjs from "dayjs"
import { useParams, useRouter } from "next/navigation"

import { TfiComment } from "react-icons/tfi"
import toast from "react-hot-toast"
import { parseDate } from "@internationalized/date"
import {
  cardData,
  updateCardTitle,
  updateInfo,
  updateUser,
  unassignUser,
  updateDates,
  checkCompleted,
} from "@/server/task"
import { assignLabelToCard, unassignLabelFromCard } from "@/server/label"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"
import {
  allComments,
  createComment,
  deleteComment,
  editComment,
} from "@/server/comment"
import { moveCardToList } from "@/server/UpdateCardOrder"
import { updateCardPriority } from "../../server/task"
import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"
import GetSyncupData from "../../server/GetSyncupData"
import {
  allAttachment,
  createAttachment,
  handleDeleteAttachment,
} from "@/server/attachment"
import Loader from "@/src/components/Loader"
import RichTextEditor from "./RichTextEditor"
import "draft-js/dist/Draft.css"

export default function ModalComponent() {
  const params = useParams()
  const isVisible = true
  const updateId = parseInt(params.cardid[0], 10)
  const boardId = params.id
  const [cid, setCid] = useState("")
  const { labels, assignedUserNames, boardData } = useGlobalSyncupContext()
  const [values, setValues] = useState(new Set([]))
  const [data, setModalData] = useState("")
  const [category, setCategory] = useState("")
  const [name, setName] = useState("")
  const [isTitleEmpty, setIsTitleEmpty] = useState(false)
  const [description, setDescription] = useState()
  const [cardLabel, setCardLabel] = useState([])
  const [showComments, setShowComments] = useState("")
  const [comment, setComment] = useState("")
  const { data: session } = useSession()
  const userEmail = session?.user?.email
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [selectedKeys, setSelectedKeys] = React.useState(cardLabel)
  const [editedComment, setEditedComment] = useState("")
  const [editingComment, setEditingComment] = useState(null)
  const [categories, setCategories] = useState([])
  const formattedCreatedAt = dayjs(data?.createdAt).format("YYYY-MM-DD")
  const formattedDueDate = dayjs(data?.dueDate).format("YYYY-MM-DD")
  const minDate = dayjs(new Date()).format("YYYY-MM-DD")
  const selectedUsers = values
    ? Object.values(values).map((value) => value.id)
    : []
  const router = useRouter()
  const { setData } = useGlobalSyncupContext()
  const [boardname, setboardname] = useState("")
  const [labelFlag, setLabelFlag] = useState(false)
  const [isCommentUpdated, setisCommentUpdated] = useState(false)
  const [userFlag, setUserFlag] = useState(false)
  const [attachment, setAttachment] = useState([])
  const [flag, setFlag] = useState(false)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(false)
  const [typeError, setTypeError] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState("")
  const [priorityFlag, setPriorityFlag] = useState(false)
  const [isPoperOpen, setIsPoperOpen] = useState(false)
  const [editPopover, setEditPopover] = useState(false)
  const [searchString, setSearchString] = useState("")
  const [count, setCount] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editdesc, setEditDesc] = useState(false)
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  )

  const handleEditDesc = () => {
    setEditDesc(!editdesc)
  }

  const fetchData = async () => {
    try {
      const updatedData = await GetSyncupData(boardId)
      setData(updatedData)
    } catch (error) {
      toast.error("Error fetching data")
    }
  }

  const handleFileChange = async (event) => {
    const { files } = event.target
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i]
      const fileName = file.name

      if (process.env.NEXT_PUBLIC_ENVIRONMENT === "dev") {
        if (file.type.startsWith("image/")) {
          if (file.size < 1024 * 1024) {
            const reader = new FileReader()
            reader.readAsDataURL(file)

            reader.onload = async () => {
              try {
                await createAttachment({
                  updateId,
                  path: reader.result,
                  name: fileName,
                })
                setFlag(true)
              } catch (error) {
                toast.error("Error uploading file")
              }
            }
            setAlert(false)
          } else {
            setAlert(true)
          }
          setTypeError(false)
        } else {
          setTypeError(true)
        }
      } else {
        try {
          const formData = new FormData()
          formData.append("file", file)
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            toast.error("Failed to upload file")
          }
          const imagePath = await response.text()
          const trimmedImagePath = imagePath.trim()
          const sanitizedImagePath = trimmedImagePath.replace(/^"|"$/g, "")
          await createAttachment({
            updateId,
            path: sanitizedImagePath,
            name: fileName,
          })
          setFlag(true)
          fetchData()
        } catch (error) {
          toast.error("Error uploading file")
        }
      }
    }
  }
  const handleClose = () => {
    setAlert(false)
  }

  const handlePriorityChange = async (event) => {
    const newPriority = event.target.value
    try {
      await updateCardPriority({ updateId, priority: newPriority })
      setPriorityFlag(true)
    } catch (error) {
      toast.error("Error updating priority")
    }
  }

  const handleDroppedFile = async (droppedFile) => {
    const droppedFileName = droppedFile.name

    if (process.env.NEXT_PUBLIC_ENVIRONMENT === "dev") {
      if (droppedFile.type.startsWith("image/")) {
        if (droppedFile.size < 1024 * 1024) {
          const reader = new FileReader()
          reader.readAsDataURL(droppedFile)

          reader.onload = async () => {
            try {
              await createAttachment({
                updateId,
                path: reader.result,
                name: droppedFileName,
              })
              setFlag(true)
            } catch (error) {
              toast.error("Error uploading file")
            }
          }
          setAlert(false)
        } else {
          setAlert(true)
        }
        setTypeError(false)
      } else {
        setTypeError(true)
      }
    } else {
      try {
        const formData = new FormData()
        formData.append("file", droppedFile)
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          toast.error("Failed to upload file")
        }
        const imagePath = await response.text()
        const trimmedImagePath = imagePath.trim()
        const sanitizedImagePath = trimmedImagePath.replace(/^"|"$/g, "")
        await createAttachment({
          updateId,
          path: sanitizedImagePath,
          name: droppedFileName,
        })
        setFlag(true)
      } catch (error) {
        toast.error("Error uploading file")
      }
    }
  }
  const handleCloseError = () => {
    setTypeError(false)
  }

  useEffect(() => {
    const fetch = async () => {
      if (flag === true) {
        const attachments = await allAttachment({ updateId })
        setAttachment(attachments)
        fetchData()
      }
    }
    fetch()
    setFlag(false)
  }, [flag])
  const handleDelete = async (filename, id) => {
    try {
      const response = await fetch(
        `/api/delete?fileName=${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        toast.error("Failed to delete file from S3")
      }

      await handleDeleteAttachment({ id })
      setFlag(true)
      fetchData()
    } catch (error) {
      toast.error("Error deleting file from S3")
    }
  }
  const convertDescriptionToEditorState = (desc) => {
    if (desc) {
      const contentState = convertFromRaw(JSON.parse(desc))
      return EditorState.createWithContent(contentState)
    }
    return EditorState.createEmpty()
  }

  useEffect(() => {
    if (description) {
      const newEditorState = convertDescriptionToEditorState(description)
      setEditorState(newEditorState)
    } else {
      setEditorState(EditorState.createEmpty())
    }
    return () => {
      setEditorState(EditorState.createEmpty())
    }
  }, [description])

  const handleDescriptionChange = (newDescription) => {
    setDescription(newDescription)
    const newEditorState = convertDescriptionToEditorState(newDescription)
    setEditorState(newEditorState)
  }

  useEffect(() => {
    if (boardData.length !== 0) {
      const fetchCategories = async () => {
        try {
          setCategories(
            boardData.find((board) => board.id === parseInt(boardId, 10)).tasks,
          )
        } catch (error) {
          toast.error("Error fetching categories")
        }
      }
      fetchCategories()
      const fetchBoards = async () => {
        try {
          if (boardData.length !== 0) {
            setboardname(
              boardData.find((board) => board.id === parseInt(boardId, 10))
                .name,
            )
          }
        } catch (error) {
          return toast.error("Board not found")
        }
        return true
      }
      fetchBoards()
    }
  }, [boardId, boardData])

  const fetchCard = async () => {
    if (updateId) {
      const newData = await cardData({ updateId })
      setLoading(false)
      setModalData(newData)
      setCategory(newData?.task)
      setCid(category?.id)
      setCardLabel(newData?.label)
      setName(newData.name)
      setDescription(newData?.description)
      setIsChecked(newData?.isCompleted)
      setSelectedPriority(newData.priority)
      setAttachment(newData.attachments)
      setValues(newData.assignedUsers)
    }
  }
  useEffect(() => {
    fetchCard()
    setUserFlag(false)
  }, [updateId, userFlag])
  useEffect(() => {
    if (labelFlag === true) {
      fetchCard()
      setLabelFlag(false)
    }
  }, [labelFlag])
  useEffect(() => {
    if (priorityFlag === true) {
      fetchCard()
      setPriorityFlag(false)
    }
  }, [priorityFlag])

  const handleCopyLink = () => {
    const link = window.location.href
    navigator.clipboard.writeText(link)
    setSnackbarOpen(true)
    setTimeout(() => {
      setSnackbarOpen(false)
    }, 2000)
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const handelChange = async (e) => {
    setName(e.target.value)
    setIsTitleEmpty(e.target.value?.trim() === "")
  }

  const handelSubmit = async (e) => {
    e.preventDefault()
    if (name?.trim() !== "") {
      await updateCardTitle({ updateId, name })
      setLabelFlag(true)
      setIsEditing(false)
    }
    fetchData()
  }
  const handleEditClick = () => {
    setIsEditing(true)
  }

  const updateCard = async () => {
    if (updateId) {
      await updateInfo({
        updateId,
        description,
      })
    }
    fetchData()
    setEditDesc(false)
  }

  useEffect(() => {
    const fetchComments = async () => {
      const comments = await allComments({ updateId })
      setShowComments(comments)
    }
    fetchComments()
    setisCommentUpdated(false)
  }, [updateId, isCommentUpdated])
  const [filteredUsers, setFilteredUsers] = useState(assignedUserNames)
  const handleCommentChange = (e) => {
    const { value, selectionStart } = e.target
    setComment(value)
    const atIndex = value.lastIndexOf("@", selectionStart - 1) + 1
    const ch = value.charAt(value.lastIndexOf("@", selectionStart - 1) + 1)
    const previousValue = comment

    if (atIndex !== 0 && atIndex < selectionStart) {
      const endIndex = value.indexOf(" ", atIndex)
      const newSearchString = value.substring(
        atIndex,
        endIndex !== -1 ? endIndex : value.length,
      )
      setSearchString(newSearchString)

      if (ch === "@") {
        setIsPoperOpen(true)
        setCount(selectionStart)
      }

      if (value.length < previousValue.length) {
        const deletedChar = previousValue.charAt(selectionStart)
        if (deletedChar === "@") {
          setIsPoperOpen(false)
        }
      }

      if (newSearchString.trim() !== "") {
        const filtered = assignedUserNames.filter((user) =>
          user.name.toLowerCase().startsWith(newSearchString.toLowerCase()),
        )
        setFilteredUsers(filtered)
      } else {
        setFilteredUsers(assignedUserNames)
      }
    } else if (value.slice(selectionStart - 1, selectionStart) === "@") {
      setSearchString("")
      setCount(selectionStart)
      setIsPoperOpen(true)
      setFilteredUsers(assignedUserNames)
    } else {
      setIsPoperOpen(false)
      setFilteredUsers([])
    }
  }

  const handleEditComment = (ommentToEdit) => {
    setEditingComment(ommentToEdit.id)
    setEditedComment(ommentToEdit.description)
  }
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment({ commentId })
      setisCommentUpdated(true)
    } catch (error) {
      toast.error("Error deleting comment")
    }
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditedComment("")
  }

  const handleSaveEdit = async (commentId) => {
    if (editedComment?.trim() !== "") {
      await editComment({ description: editedComment, commentId })
      setEditingComment(null)
      setEditedComment("")
      setisCommentUpdated(true)
      setEditPopover(false)
    }
  }

  const handleComment = async () => {
    if (comment?.trim() !== "") {
      await createComment({ updateId, comment, userEmail })
      setComment("")
      setisCommentUpdated(true)
    }
    setIsPoperOpen(false)
    fetchData()
  }
  const handleMoveCard = (toListId) => {
    try {
      moveCardToList(updateId, cid, toListId)
      setLabelFlag(true)
      fetchData()
    } catch (error) {
      toast.error("Error moving card")
    }
  }
  const handleSelectionChange = async (selectedLabels, cardId) => {
    try {
      const currentLabels = Array.from(selectedKeys)
      const newlySelectedLabels = Array.from(selectedLabels)
      const labelsToUnassign = currentLabels.filter(
        (labelId) => !newlySelectedLabels.includes(labelId),
      )

      await Promise.all(
        labelsToUnassign.map(async (labelId) => {
          await unassignLabelFromCard(cardId, labelId)
          setLabelFlag(true)
        }),
      )

      await Promise.all(
        newlySelectedLabels.map(async (labelId) => {
          await assignLabelToCard(cardId, labelId)
          setLabelFlag(true)
        }),
      )

      setSelectedKeys(new Set(newlySelectedLabels))
    } catch (error) {
      toast.error("Error updating label")
    }
    fetchData()
  }

  const setUserId = async (selectedItems) => {
    const Keys = Array.from(selectedItems)
    const selectedUserIds = Keys.map((key) => parseInt(key, 10)).filter(
      (id) => !Number.isNaN(id),
    )
    const previouslySelectedUserIds = values.map((user) => user.id)
    const newlySelectedUserIds = selectedUserIds.filter(
      (id) => !previouslySelectedUserIds.includes(id),
    )
    const deselectedUserIds = previouslySelectedUserIds.filter(
      (id) => !selectedUserIds.includes(id),
    )

    if (newlySelectedUserIds.length > 0) {
      await updateUser({
        selectedUserId: newlySelectedUserIds,
        updateId,
      })
      setUserFlag(true)
    }

    if (deselectedUserIds.length > 0) {
      deselectedUserIds.forEach((userId) => {
        unassignUser({
          selectedUserId: userId,
          updateId,
        })
        setUserFlag(true)
      })
    }
  }

  const handleModalClose = () => {
    router.push(`/${params.organization}/board/${boardId}`)
    setIsTitleEmpty(false)
    setDescription("")
    fetchData()
  }

  const handleDateChange = (dateRange) => {
    const startValue = dateRange.start.toString()
    const endValue = dateRange.end.toString()
    updateDates({ updateId, startValue, endValue })
    setLabelFlag(true)
  }
  const [isOpen, setIsOpen] = useState([])
  const toggleModal = (index) => {
    const updatedIsOpen = [...isOpen]
    updatedIsOpen[index] = !updatedIsOpen[index]
    setIsOpen(updatedIsOpen)
  }
  const [hoveredAttachmentIndex, setHoveredAttachmentIndex] = useState(-1)
  const [hoveredFileIndex, setHoveredFileIndex] = useState(-1)
  const [hoveredVideoIndex, setHoveredVideoIndex] = useState(-1)
  const handleHover = (index, isHovered) => {
    if (isHovered) {
      setHoveredAttachmentIndex(index)
    } else {
      setHoveredAttachmentIndex(-1)
    }
  }

  const handleFileHover = (index, isHovered) => {
    if (isHovered) {
      setHoveredFileIndex(index)
    } else {
      setHoveredFileIndex(-1)
    }
  }
  const handleVideoHover = (index, isHovered) => {
    if (isHovered) {
      setHoveredVideoIndex(index)
    } else {
      setHoveredVideoIndex(-1)
    }
  }

  const handleButtonClick = () => {
    const fileInput = document.getElementById("fileInput")
    if (fileInput) {
      fileInput.click()
    }
  }
  const handleClick = (mentionedName) => {
    const mentionWithSymbol = `**${mentionedName}**`
    if (searchString === "" && count >= 0 && count <= comment.length) {
      const updatedComment = `${comment.slice(
        0,
        count - 1,
      )}@${mentionWithSymbol}${comment.slice(count)}`
      setComment(updatedComment)
    } else {
      const regex = /(?<=@)\w+\b/g
      const updatedComment = comment.replace(regex, mentionWithSymbol)

      setComment(updatedComment)
    }
    if (mentionedName.trim() !== "") {
      const filtered = assignedUserNames.filter((user) =>
        user.name.toLowerCase().startsWith(mentionedName.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(assignedUserNames)
    }
    setIsPoperOpen(false)
  }
  const handleInputFocus = (event) => {
    const newEvent = { ...event }
    newEvent.target.selectionStart = newEvent.target.value.length
    newEvent.target.selectionEnd = newEvent.target.value.length
    const inputElement = document.querySelector(".inputWrapper")
    inputElement.focus()
  }

  const usernames = assignedUserNames.map((user) => ({
    name: `@${user.name}`,
    email: user.email,
  }))

  const handleEditChange = (e) => {
    const { value, selectionStart } = e.target
    setEditedComment(value)
    const atIndex = value.lastIndexOf("@", selectionStart - 1) + 1
    const ch = value.charAt(value.lastIndexOf("@", selectionStart - 1) + 1)
    const previousValue = editedComment

    if (atIndex !== 0 && atIndex < selectionStart) {
      const endIndex = value.indexOf(" ", atIndex)
      const newSearchString = value.substring(
        atIndex,
        endIndex !== -1 ? endIndex : value.length,
      )
      setSearchString(newSearchString)

      if (ch === "@") {
        setEditPopover(true)
        setCount(selectionStart)
      }

      if (value.length < previousValue.length) {
        const deletedChar = previousValue.charAt(selectionStart)
        if (deletedChar === "@") {
          setEditPopover(false)
        }
      }

      if (newSearchString.trim() !== "") {
        const filtered = assignedUserNames.filter((user) =>
          user.name.toLowerCase().startsWith(newSearchString.toLowerCase()),
        )
        setFilteredUsers(filtered)
      } else {
        setFilteredUsers(assignedUserNames)
      }
    } else if (value.slice(selectionStart - 1, selectionStart) === "@") {
      setSearchString("")
      setCount(selectionStart)
      setEditPopover(true)
      setFilteredUsers(assignedUserNames)
    } else {
      setEditPopover(false)
      setFilteredUsers([])
    }
  }
  const handleEditPopover = (mentionedName) => {
    const mentionWithSymbol = `**${mentionedName}**`
    if (searchString === "" && count >= 0 && count <= editedComment.length) {
      const updatedComment = `${editedComment.slice(
        0,
        count - 1,
      )}@${mentionWithSymbol}${editedComment.slice(count)}`
      setEditedComment(updatedComment)
    } else {
      const regex = /(?<=@)\w+\b/g
      const updatedComment = editedComment.replace(regex, mentionWithSymbol)

      setEditedComment(updatedComment)
    }
    if (mentionedName.trim() !== "") {
      const filtered = assignedUserNames.filter((user) =>
        user.name.toLowerCase().startsWith(mentionedName.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(assignedUserNames)
    }
    setEditPopover(false)
  }

  const styleMap = {
    CODE: {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
  }
  return (
    <Modal
      backdrop="opaque"
      isOpen={isVisible}
      onClose={handleModalClose}
      placement="center"
      size="3xl"
      className="max-h-[34rem]"
    >
      <ModalContent>
        {(onClose) => (
          <div className="overflow-y-auto md:max-h-[34rem] md:no-scrollbar pb-0">
            <div className="h-[34rem] justify-center pb-0">
              {loading ? (
                <Loader />
              ) : (
                <div className="flex flex-col md:flex-row mb-0">
                  <div className="w-full md:w-7/12 max-h-[34rem] overflow-y-auto no-scrollbar">
                    <div className="flex-grow overflow-y-auto no-scrollbar">
                      <div className="flex ">
                        <div className="mt-2">
                          <Tooltip
                            content="Copy link"
                            placement="bottom"
                            showArrow
                            size="sm"
                          >
                            <div>
                              <MdLink
                                className="ml-3 text-xl"
                                onClick={handleCopyLink}
                              />
                            </div>
                          </Tooltip>
                          {snackbarOpen && (
                            <div
                              className="fixed bottom-0 left-0 bg-green-100 text-green-800 p-3 mb-4 ml-4 rounded flex justify-between"
                              role="alert"
                            >
                              <IoMdCheckmarkCircleOutline className="text-green-800 w-6 h-6 mr-2" />
                              <strong className="font-bold mr-8">
                                Link copied to clipboard!
                              </strong>
                              <IoClose
                                className="text-green-800 mt-0.5 w-5 h-5"
                                onClick={handleCloseSnackbar}
                              />
                            </div>
                          )}
                        </div>
                        <Breadcrumbs className="m-2 flex">
                          <BreadcrumbItem>
                            {boardname.length > 15 ? (
                              <Tooltip
                                content={
                                  boardname.length > 15 ? (
                                    <>
                                      {boardname
                                        .match(/.{1,15}/g)
                                        .map((line, index) => (
                                          <div key={index}>{line}</div>
                                        ))}
                                    </>
                                  ) : (
                                    boardname
                                  )
                                }
                              >
                                <span>{boardname.substring(0, 15)}...</span>
                              </Tooltip>
                            ) : (
                              <span>{boardname}</span>
                            )}
                          </BreadcrumbItem>
                          <BreadcrumbItem>
                            <Dropdown>
                              <DropdownTrigger>
                                <span>
                                  {category?.category.length > 30
                                    ? `${category?.category.substring(0, 30)}...`
                                    : category?.category}
                                </span>
                              </DropdownTrigger>
                              <DropdownMenu aria-label="Static Actions">
                                {categories.map((singleCategory) => (
                                  <DropdownItem
                                    key={singleCategory.id}
                                    onClick={() => {
                                      handleMoveCard(singleCategory.id)
                                    }}
                                    variant="solid"
                                    color="secondary"
                                  >
                                    <span>
                                      {singleCategory.category.length > 30
                                        ? `${singleCategory.category.substring(0, 30)}...`
                                        : singleCategory.category}
                                    </span>
                                  </DropdownItem>
                                ))}
                              </DropdownMenu>
                            </Dropdown>
                          </BreadcrumbItem>
                          <BreadcrumbItem>
                            {data.name.length > 30 ? (
                              <Tooltip
                                content={
                                  data.name.length > 15 ? (
                                    <>
                                      {data.name
                                        .match(/.{1,15}/g)
                                        .map((line, index) => (
                                          <div key={index}>{line}</div>
                                        ))}
                                    </>
                                  ) : (
                                    data.name
                                  )
                                }
                              >
                                <div>{`${data.name.substring(0, 30)}${data.name.length > 30 ? "..." : ""}`}</div>
                              </Tooltip>
                            ) : (
                              `${data.name.substring(0, 30)}${data.name.length > 30 ? "..." : ""}`
                            )}
                          </BreadcrumbItem>
                        </Breadcrumbs>
                      </div>
                      <ModalBody>
                        <div>
                          <div
                            onClick={handleEditClick}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleEditClick()
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            style={{ fontWeight: "bold", fontSize: "1.25rem" }}
                          >
                            {isEditing ? (
                              <Input
                                variant="bordered"
                                value={name}
                                onChange={handelChange}
                                onBlur={handelSubmit}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handelSubmit(e)
                                }}
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "1.25rem",
                                  width: "100%",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  marginLeft: "14px",
                                  fontSize: "1.25rem",
                                  display: "flex",
                                  flexWrap: "wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {name}
                              </div>
                            )}
                          </div>

                          {isTitleEmpty && (
                            <Tooltip
                              content="Card name cannot be empty"
                              placement="bottom"
                              size="sm"
                            >
                              <div className="flex justify-end mt-1">
                                <MdErrorOutline
                                  style={{
                                    color: "red",
                                    fontSize: "medium",
                                  }}
                                />
                              </div>
                            </Tooltip>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <BiSolidCalendar className="mt-1" />
                          Dates
                        </div>
                        <div className="flex text-sm items-center ">
                          <div>
                            <Checkbox
                              className="mb-7"
                              color="secondary"
                              checked={isChecked}
                              onChange={() => {
                                setIsChecked(!isChecked)
                                checkCompleted({
                                  updateId,
                                  isChecked: !isChecked,
                                })
                              }}
                              isSelected={isChecked}
                            />
                          </div>
                          <div className="flex items-center">
                            <DateRangePicker
                              classname="mt-2"
                              label="Card duration"
                              onChange={handleDateChange}
                              defaultValue={{
                                start: parseDate(formattedCreatedAt),
                                end: parseDate(formattedDueDate),
                              }}
                              minValue={parseDate(minDate)}
                              validationBehavior="native"
                            />
                            <div className="ml-2">
                              {isChecked ? (
                                <Chip
                                  size="sm"
                                  className="text-white"
                                  color={isChecked ? "success" : "default"}
                                  radius="sm"
                                >
                                  Completed
                                </Chip>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        </div>
                        <Divider />

                        <div className="flex gap-2 mt-[-8px]">
                          <GoAlertFill className="mt-1" />
                          Select Priority:
                          <Select
                            className="max-w-44 mt-1"
                            aria-label="priority"
                            id="priority"
                            name="priority"
                            value={selectedPriority}
                            defaultSelectedKeys={[selectedPriority]}
                            onChange={handlePriorityChange}
                            style={{
                              border: "1px solid gray",
                              height: "2rem",
                              minHeight: "unset",
                            }}
                          >
                            <SelectItem
                              key="highest"
                              startContent={
                                <FaFlag color="red" className="w-4 h-4 mr-2" />
                              }
                            >
                              Highest
                            </SelectItem>
                            <SelectItem
                              key="high"
                              startContent={
                                <FaFlag
                                  color="rgba(255, 0, 0, 0.5)"
                                  className="w-4 h-4 mr-2"
                                />
                              }
                            >
                              High
                            </SelectItem>
                            <SelectItem
                              key="medium"
                              startContent={
                                <FaFlag
                                  color="rgb(252, 220, 42)"
                                  className="w-4 h-4 mr-2"
                                />
                              }
                            >
                              Medium
                            </SelectItem>
                            <SelectItem
                              key="low"
                              startContent={
                                <FaFlag
                                  color="rgba(0, 128, 0, 0.5)"
                                  className="w-4 h-4 mr-2"
                                />
                              }
                            >
                              Low
                            </SelectItem>

                            <SelectItem
                              key="lowest"
                              startContent={
                                <FaFlag
                                  color="green"
                                  className="w-4 h-4 mr-2"
                                />
                              }
                            >
                              Lowest
                            </SelectItem>
                          </Select>
                        </div>
                        <Divider className="mt-[-px]" />
                        <div className="flex justify-between mt-[-10px]">
                          <div className="flex gap-2">
                            <MdDescription className="mt-1" />
                            Description
                          </div>
                          {editorState && (
                            <div>
                              <MdEdit
                                className="mt-1"
                                onClick={handleEditDesc}
                              />
                            </div>
                          )}
                        </div>
                        <div
                          className="border border-grey rounded min-h-[80px] max-h-[28vh] overflow-auto"
                          style={{
                            fontFamily: "Georgia",
                            display: editdesc ? "none" : "block",
                          }}
                          role="button"
                          tabIndex={0}
                          onClick={handleEditDesc}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleEditDesc()
                            }
                          }}
                        >
                          <Editor
                            placeholder="Tap to add description..."
                            editorState={editorState}
                            onChange={setEditorState}
                            customStyleMap={styleMap}
                          />
                        </div>
                        {editdesc && (
                          <div>
                            <RichTextEditor
                              initialContentState={description}
                              onDescriptionChange={handleDescriptionChange}
                            />
                            <Button
                              variant="faded"
                              className="mt-2 bg-[#e4d4f4] text-[#7828c8] hover:bg-[#7828c8] hover:text-white font-semibold"
                              size="sm"
                              onClick={updateCard}
                            >
                              Save
                            </Button>
                          </div>
                        )}
                        <input
                          type="file"
                          id="fileInput"
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                          multiple
                        />
                        <div>
                          <Divider />
                          <div className="flex mb-1">
                            <IoAttachOutline className="mt-1 w-5 h-5 mr-1" />
                            Attachments
                          </div>
                          <Button
                            size="sm"
                            variant="faded"
                            onClick={handleButtonClick}
                            aria-label="Attach File"
                            className="w-full"
                            onDrop={(e) => {
                              e.preventDefault()
                              const droppedFile = e.dataTransfer.files[0]
                              handleDroppedFile(droppedFile)
                            }}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            Drag/Drop or Tap to add images
                          </Button>
                          <div
                            className="flex flex-row gap-2 flex-wrap"
                            onDrop={(e) => {
                              e.preventDefault()
                              const droppedFile = e.dataTransfer.files[0]
                              handleDroppedFile(droppedFile)
                            }}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            <div className="flex flex-wrap gap-2">
                              {attachment &&
                                attachment
                                  .filter((currentAttachment) => {
                                    const fileType = currentAttachment.name
                                      .split(".")
                                      .pop()
                                      .toLowerCase()
                                    return [
                                      "jpg",
                                      "jpeg",
                                      "png",
                                      "gif",
                                    ].includes(fileType)
                                  })
                                  .map((currentAttachment, index) => (
                                    <div
                                      className="flex gap-2 mt-2 border-solid border-[1px] border-grey-100 rounded"
                                      key={currentAttachment.id}
                                    >
                                      <div className="cursor-pointer flex gap-3">
                                        <div className="flex flex-col">
                                          <div
                                            style={{
                                              position: "relative",
                                              display: "inline-block",
                                            }}
                                            onMouseEnter={() =>
                                              handleHover(index, true)
                                            }
                                            onMouseLeave={() =>
                                              handleHover(index, false)
                                            }
                                          >
                                            <Card
                                              radius="none"
                                              className="border-none"
                                            >
                                              <div className="relative group">
                                                <img
                                                  src={currentAttachment.file}
                                                  alt="Attachment"
                                                  style={{
                                                    display: "block",
                                                    height: "120px",
                                                    width: "150px",
                                                  }}
                                                />
                                                <div
                                                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                                                  style={{
                                                    backgroundColor:
                                                      "rgba(0, 0, 0, 0.5)",
                                                  }}
                                                />
                                                {hoveredAttachmentIndex ===
                                                  index && (
                                                  <div
                                                    style={{
                                                      position: "absolute",
                                                      top: "20%",
                                                      left: "70%",
                                                      transform:
                                                        "translate(-50%, -50%)",
                                                      display: "flex",
                                                      justifyContent: "center",
                                                      alignItems: "center",
                                                    }}
                                                  >
                                                    <a
                                                      href={
                                                        currentAttachment.file
                                                      }
                                                      download={`${currentAttachment.name}`}
                                                      className="justify-center"
                                                    >
                                                      <MdOutlineFileDownload
                                                        size={24}
                                                        style={{
                                                          marginRight: "5px",
                                                          opacity: 0.8,
                                                          color: "white",
                                                        }}
                                                      />
                                                    </a>
                                                    <BiSolidTrashAlt
                                                      size={24}
                                                      style={{
                                                        marginRight: "5px",
                                                        opacity: 0.8,
                                                        color: "white",
                                                      }}
                                                      onClick={() => {
                                                        handleDelete(
                                                          currentAttachment.name,
                                                          currentAttachment.id,
                                                        )
                                                      }}
                                                    />
                                                    <IoEyeOutline
                                                      size={24}
                                                      onClick={() =>
                                                        toggleModal(index)
                                                      }
                                                      style={{
                                                        opacity: 0.8,
                                                        color: "white",
                                                      }}
                                                    />
                                                  </div>
                                                )}
                                              </div>
                                            </Card>
                                          </div>
                                          <div
                                            className="p-1 text-sm font-semibold"
                                            style={{
                                              maxWidth: "150px",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            {currentAttachment.name}
                                          </div>
                                          <div className="text-xs pl-1">
                                            {new Date(
                                              currentAttachment.time,
                                            ).toLocaleDateString("en-GB", {
                                              day: "numeric",
                                              month: "long",
                                              year: "numeric",
                                            })}{" "}
                                            {new Date(
                                              currentAttachment.time,
                                            ).toLocaleTimeString("en-US", {
                                              hour: "numeric",
                                              minute: "numeric",
                                              hour12: true,
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                      <Modal
                                        isOpen={isOpen[index]}
                                        onOpenChange={() => toggleModal(index)}
                                        className=" pointer"
                                        hideCloseButton
                                        size="xl"
                                      >
                                        <ModalContent>
                                          <ModalBody className="p-0">
                                            <img
                                              src={currentAttachment.file}
                                              height="600px"
                                              width="600px"
                                              alt="attachment"
                                            />
                                          </ModalBody>
                                        </ModalContent>
                                      </Modal>
                                    </div>
                                  ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <div>
                                {attachment &&
                                  attachment
                                    .filter((currentAttachment) => {
                                      const fileType = currentAttachment.name
                                        .split(".")
                                        .pop()
                                        .toLowerCase()
                                      return [
                                        "pdf",
                                        "docx",
                                        "xlsx",
                                        "csv",
                                      ].includes(fileType)
                                    })
                                    .map((currentAttachment, index) => (
                                      <div key={currentAttachment.id}>
                                        <div
                                          className="flex gap-2 mt-2 border-solid border-[1px] border-grey-100 rounded relative group"
                                          onMouseEnter={() =>
                                            handleFileHover(index, true)
                                          }
                                          onMouseLeave={() =>
                                            handleFileHover(index, false)
                                          }
                                        >
                                          <div className="p-1 text-sm font-semibold">
                                            <a
                                              href={currentAttachment.file}
                                              download={`${currentAttachment.name}`}
                                              className="text-blue-600 hover:underline"
                                            >
                                              {currentAttachment.name}
                                            </a>
                                          </div>
                                          <div>
                                            {hoveredFileIndex === index && (
                                              <div
                                                style={{
                                                  position: "absolute",
                                                  left: "100%",
                                                  display: "flex",
                                                  justifyContent: "center",
                                                  alignItems: "center",
                                                }}
                                              >
                                                <BiSolidTrashAlt
                                                  size={24}
                                                  style={{
                                                    marginRight: "5px",
                                                    opacity: 0.8,
                                                    color: "black",
                                                  }}
                                                  onClick={() => {
                                                    handleDelete(
                                                      currentAttachment.name,
                                                      currentAttachment.id,
                                                    )
                                                  }}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {attachment &&
                                attachment
                                  .filter((currentAttachment) => {
                                    const fileType = currentAttachment.name
                                      .split(".")
                                      .pop()
                                      .toLowerCase()
                                    return [
                                      "mp4",
                                      "avi",
                                      "mov",
                                      "mkv",
                                      "webm",
                                      "3gp",
                                      "m4v",
                                    ].includes(fileType)
                                  })

                                  .map((currentAttachment, index) => (
                                    <div
                                      className="flex gap-2 mt-2 border-solid border-[1px] border-grey-100 rounded"
                                      key={currentAttachment.id}
                                    >
                                      <div
                                        className="flex gap-2 mt-2 border-solid border-[1px] border-grey-100 rounded relative group"
                                        onMouseEnter={() =>
                                          handleVideoHover(index, true)
                                        }
                                        onMouseLeave={() =>
                                          handleVideoHover(index, false)
                                        }
                                      >
                                        <div className="p-1 text-sm font-semibold">
                                          <a
                                            href={currentAttachment.file}
                                            download={`${currentAttachment.name}`}
                                            className="text-blue-600 hover:underline"
                                          >
                                            {}
                                          </a>
                                        </div>
                                        <div className="relative group">
                                          <video
                                            width="320"
                                            height="240"
                                            controls
                                          >
                                            <source
                                              src={currentAttachment.file}
                                            />
                                            <track
                                              kind="captions"
                                              src="path_to_captions.vtt"
                                              srclang="en"
                                              label="English captions"
                                            />
                                            Your browser does not support the
                                            video tag.
                                          </video>

                                          {hoveredVideoIndex === index && (
                                            <div
                                              style={{
                                                position: "absolute",
                                                top: "15%",
                                                left: "80%",
                                                paddingLeft: "20px",
                                                transform:
                                                  "translate(-50%, -50%)",
                                                display: "flex",
                                              }}
                                            >
                                              <a
                                                href={currentAttachment.file}
                                                download={`${currentAttachment.name}`}
                                                className="mr-2"
                                              >
                                                <MdOutlineFileDownload
                                                  size={24}
                                                  style={{
                                                    opacity: 0.8,
                                                    color: "black",
                                                  }}
                                                />
                                              </a>
                                              <BiSolidTrashAlt
                                                size={24}
                                                className="mr-2"
                                                style={{
                                                  opacity: 0.8,
                                                  color: "black",
                                                }}
                                                onClick={() => {
                                                  handleDelete(
                                                    currentAttachment.name,
                                                    currentAttachment.id,
                                                  )
                                                }}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          {alert && (
                            <div
                              className=" bg-red-100 text-red-800 p-2 rounded flex justify-between"
                              role="alert"
                            >
                              <span className="text-sm">
                                Image size should be less than 1mb.
                              </span>
                              <IoClose
                                className="text-red-800 mt-0.5 w-5 h-5"
                                onClick={handleClose}
                              />
                            </div>
                          )}
                          {typeError && (
                            <div
                              className=" bg-red-100 text-red-800 p-2  rounded flex justify-between"
                              role="alert"
                            >
                              <span className="text-sm">
                                Attachment should be image.
                              </span>
                              <IoClose
                                className="text-red-800 mt-0.5 w-5 h-5"
                                onClick={handleCloseError}
                              />
                            </div>
                          )}
                        </div>
                        <Divider className="mt-[-10px]" />
                        <div className="flex gap-2">
                          <MdLocalOffer className="mt-1" />
                          Labels
                          <div className="flex gap-2">
                            {cardLabel && (
                              <>
                                {Object.values(cardLabel)
                                  .slice(0, 2)
                                  .map((label, index) => (
                                    <Chip
                                      size="xs  "
                                      key={index}
                                      style={{ backgroundColor: label.color }}
                                      variant="flat"
                                      className="text-xs dark:text-900"
                                      title={label.name}
                                    >
                                      <span
                                        style={{
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow:
                                            label.name.length > 10
                                              ? "ellipsis"
                                              : "unset",
                                        }}
                                      >
                                        {label.name.length > 10
                                          ? `${label.name.slice(0, 10)}...`
                                          : label.name}
                                      </span>
                                    </Chip>
                                  ))}
                              </>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Dropdown placement="top-start">
                              <DropdownTrigger>
                                <Button
                                  isIconOnly
                                  radius="full"
                                  className="w-2 h-7 bg-[#e4d4f4] hover:bg-[#7828c8] text-[#7828c8] hover:text-white  dark:bg-700 dark:text-black"
                                  variant="faded"
                                >
                                  {cardLabel ? (
                                    Object.values(cardLabel).length > 2 ? (
                                      <>
                                        <IoAddOutline className="w-3 h-3 font-semibold" />
                                        {Object.values(cardLabel).length - 2}
                                      </>
                                    ) : (
                                      <IoAddOutline className="w-4 h-4 font-semibold" />
                                    )
                                  ) : (
                                    <IoAddOutline className="w-4 h-4 font-semibold" />
                                  )}
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                className="w-48 max-h-52 overflow-auto no-scrollbar dark:text-text"
                                variant="flat"
                                closeOnSelect={false}
                                selectionMode="multiple"
                                defaultSelectedKeys={cardLabel.map(
                                  (item) => item.id,
                                )}
                                onSelectionChange={(currentKey) => {
                                  setSelectedKeys(currentKey)
                                  handleSelectionChange(currentKey, updateId)
                                }}
                              >
                                {labels?.map((item) => (
                                  <DropdownItem
                                    key={item.id}
                                    style={{ backgroundColor: item.color }}
                                  >
                                    {item.name}
                                  </DropdownItem>
                                ))}
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </div>

                        <Divider />
                        <div className="flex row gap-2">
                          <IoMdPeople className="mt-1" />
                          Members
                          <Select
                            items={assignedUserNames.map((user) => {
                              const isSelected = selectedUsers.includes(user.id)
                              return {
                                key: user.id.toString(),
                                ...user,
                                selected: isSelected,
                                value: user.id,
                              }
                            })}
                            selectedKeys={selectedUsers.map((user) =>
                              user.toString(),
                            )}
                            aria-label="select"
                            isMultiline
                            selectionMode="multiple"
                            placeholder="Add Members"
                            className="max-w-xs"
                            variant="bordered"
                            size="sm"
                            onSelectionChange={setUserId}
                            style={{ border: "none" }}
                            renderValue={(items) => {
                              return (
                                <div className="flex flex-wrap gap-2">
                                  <AvatarGroup
                                    size="sm"
                                    className="justify-start"
                                    isBordered
                                    max={5}
                                  >
                                    {items.map((item) => (
                                      <Tooltip
                                        placement="bottom"
                                        showArrow
                                        size="sm"
                                        content={
                                          item.textValue.length > 25 ? (
                                            <>
                                              {item.textValue
                                                .match(/.{1,25}/g)
                                                .map((line, index) => (
                                                  <div key={index}>{line}</div>
                                                ))}
                                            </>
                                          ) : (
                                            item.textValue
                                          )
                                        }
                                        key={item.id}
                                      >
                                        <Avatar
                                          size="sm"
                                          name={item.textValue.substring(0, 1)}
                                          src={item.data.photo}
                                        />
                                      </Tooltip>
                                    ))}
                                  </AvatarGroup>
                                </div>
                              )
                            }}
                          >
                            {(user) => (
                              <SelectItem
                                className="max-h-52 overflow-auto no-scrollbar"
                                variant="solid"
                                color="secondary"
                                value={user.value}
                                key={user.id}
                                textValue={user.name}
                                selected={user.selected}
                              >
                                <div className="flex-column">
                                  <div className="flex gap-2 items-center">
                                    <Avatar
                                      name={user.name.substring(0, 1)}
                                      src={user.photo}
                                      className="flex-shrink-0 text-lg"
                                      size="sm"
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-small">
                                        {user.name.length > 15
                                          ? `${user.name.substring(0, 15)}...`
                                          : user.name}
                                      </span>
                                      <span className="text-tiny">
                                        ({user.email})
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            )}
                          </Select>
                        </div>
                      </ModalBody>
                    </div>
                  </div>

                  <div className="w-full md:w-5/12 max-h-[33.5rem] flex flex-col m-1">
                    <div className="flex-grow border border-grey rounded-xl flex flex-col dark:border-none max-h-70vh overflow-y-auto no-scrollbar">
                      <div className="flex justify-between position-sticky">
                        <div className="flex gap-3 p-2">
                          <MdInsertComment className="mt-1" />
                          Comments
                        </div>
                      </div>
                      <div className="flex-grow max-h-70vh overflow-y-auto no-scrollbar">
                        {showComments.length ? (
                          showComments.map((currentComment, index) => {
                            const commentDate = new Date(
                              currentComment.createdAt,
                            )
                            const today = new Date()
                            const yesterday = new Date(today)
                            yesterday.setDate(today.getDate() - 1)

                            let displayDate
                            if (
                              commentDate.toDateString() ===
                              today.toDateString()
                            ) {
                              displayDate = "Today"
                            } else if (
                              commentDate.toDateString() ===
                              yesterday.toDateString()
                            ) {
                              displayDate = "Yesterday"
                            } else {
                              displayDate = commentDate.toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            }

                            const isFirstCommentOrNewDate =
                              index === 0 ||
                              commentDate.toDateString() !==
                                new Date(
                                  showComments[index - 1].createdAt,
                                ).toDateString()
                            return (
                              <div key={currentComment.id}>
                                {isFirstCommentOrNewDate &&
                                  showComments.length && (
                                    <div className="p-2">
                                      <div className="relative flex items-center">
                                        <div
                                          className="flex-grow border-t border-gray-400"
                                          style={{ marginLeft: "10%" }}
                                        />
                                        <span className="flex-shrink mx-4 text-sm">
                                          {displayDate}
                                        </span>
                                        <div
                                          className="flex-grow border-t border-gray-400"
                                          style={{ marginRight: "10%" }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                <div className="m-1 p-1 bg-gray-100 border dark:bg-black rounded-xl">
                                  <div className="flex gap-2 items-center">
                                    <Avatar
                                      className="w-6 h-6"
                                      name={currentComment.user?.name.substring(
                                        0,
                                        1,
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <div className="flex items-center">
                                        <Tooltip
                                          content={
                                            currentComment.user.name.length >
                                            25 ? (
                                              <>
                                                {currentComment.user.name
                                                  .match(/.{1,25}/g)
                                                  .map((line, CommentIndex) => (
                                                    <div key={CommentIndex}>
                                                      {line}
                                                    </div>
                                                  ))}
                                              </>
                                            ) : (
                                              currentComment.user.name
                                            )
                                          }
                                        >
                                          <div className="font-semibold text-sm">
                                            {currentComment.user?.name &&
                                            currentComment.user.name.length > 15
                                              ? `${currentComment.user.name.substring(0, 15)}...`
                                              : currentComment.user?.name}
                                          </div>
                                        </Tooltip>
                                        <div className="text-xs p-2">
                                          {new Date(
                                            currentComment.createdAt,
                                          ).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "numeric",
                                            hour12: true,
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                    <Dropdown
                                      className="min-w-[80px]"
                                      placement="bottom-end"
                                    >
                                      <DropdownTrigger>
                                        <div className="flex ml-auto items-center">
                                          <MdOutlineMoreHoriz className="w-4 h-4" />
                                        </div>
                                      </DropdownTrigger>
                                      <DropdownMenu aria-label="Static Actions">
                                        <DropdownItem
                                          variant="solid"
                                          color="secondary"
                                          onClick={() => {
                                            handleEditComment(currentComment, {
                                              onClose,
                                            })
                                          }}
                                        >
                                          Edit
                                        </DropdownItem>
                                        <DropdownItem
                                          variant="solid"
                                          color="danger"
                                          onClick={() => {
                                            handleDeleteComment(
                                              currentComment.id,
                                              {
                                                onClose,
                                              },
                                            )
                                          }}
                                        >
                                          Delete
                                        </DropdownItem>
                                      </DropdownMenu>
                                    </Dropdown>
                                  </div>
                                  <div className="text-sm">
                                    {editingComment === currentComment.id ? (
                                      <div>
                                        <div className="max-h-[42vh] p-0">
                                          <div>
                                            {filteredUsers.length > 0 &&
                                              editPopover && (
                                                <Popover
                                                  shouldBlockScroll
                                                  className="w-fit popover-scroll-container max-h-[42vh] overflow-y-auto no-scrollbar border border-gray-200 rounded-2xl"
                                                  isOpen={editPopover}
                                                  align="start"
                                                  placement="top"
                                                  tabIndex={!null}
                                                  style={{
                                                    marginTop: "35px",
                                                    marginBottom: "27px",
                                                  }}
                                                >
                                                  <PopoverTrigger>
                                                    <div />
                                                  </PopoverTrigger>
                                                  <PopoverContent
                                                    aria-label="Static Actions"
                                                    tabIndex={!null}
                                                    className="p-2 bg-white shadow-md items-start dark:bg-black "
                                                  >
                                                    {filteredUsers.map(
                                                      (user) => (
                                                        <div
                                                          key={user.id}
                                                          onClick={() =>
                                                            handleEditPopover(
                                                              user.name,
                                                              user.email,
                                                            )
                                                          }
                                                          onKeyDown={(e) => {
                                                            if (
                                                              e.key ===
                                                                "Enter" ||
                                                              e.key === " "
                                                            ) {
                                                              handleEditPopover(
                                                                user.name,
                                                                user.email,
                                                              )
                                                            }
                                                          }}
                                                          role="button"
                                                          tabIndex={0}
                                                          className="flex items-start py-2 cursor-pointer p-1 transition duration-200 group w-full hover:bg-purple-700 hover:text-white rounded-2xl"
                                                        >
                                                          <Avatar
                                                            name={user.name.substring(
                                                              0,
                                                              1,
                                                            )}
                                                            className="mr-2"
                                                          />
                                                          <div className="flex flex-col">
                                                            <div className="font-semibold group-hover:text-white">
                                                              {user.name
                                                                .length > 15
                                                                ? `${user.name.substring(0, 15)}...`
                                                                : user.name}
                                                            </div>
                                                            <div className="text-gray-500 group-hover:text-white dark:text-white">
                                                              {user.email}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      ),
                                                    )}
                                                  </PopoverContent>
                                                </Popover>
                                              )}
                                          </div>
                                          <Input
                                            variant="underlined"
                                            className="w-full"
                                            autoFocus
                                            value={editedComment}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                handleSaveEdit(comment.id)
                                              }
                                            }}
                                            onChange={handleEditChange}
                                          />
                                        </div>
                                        <div className="flex gap-1 p-1">
                                          <Button
                                            variant="faded"
                                            className="bg-[#e4d4f4] text-[#7828c8] hover:bg-[#7828c8] hover:text-white font-semibold"
                                            radius="full"
                                            size="sm"
                                            onClick={() =>
                                              handleSaveEdit(currentComment.id)
                                            }
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            variant="faded"
                                            className="bg-[#e4d4f4] text-[#7828c8] hover:bg-[#7828c8] hover:text-white font-semibold"
                                            radius="full"
                                            size="sm"
                                            onClick={handleCancelEdit}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        className="ml-10"
                                        style={{ wordBreak: "break-word" }}
                                      >
                                        {currentComment.description
                                          .replace(/\*/g, "")
                                          .split(
                                            new RegExp(
                                              `(${usernames.map((user) => user.name).join("|")})`,
                                              "g",
                                            ),
                                          )
                                          .map((word, DescriptionIndex) => {
                                            const matchedUsernameIndex =
                                              usernames.findIndex(
                                                (user) => user.name === word,
                                              )
                                            if (matchedUsernameIndex !== -1) {
                                              const matchedUser =
                                                usernames[matchedUsernameIndex]
                                              return (
                                                <Tooltip
                                                  key={DescriptionIndex}
                                                  placement="bottom"
                                                  showArrow
                                                  size="sm"
                                                  content={matchedUser.email}
                                                >
                                                  <strong>{word}</strong>
                                                </Tooltip>
                                              )
                                            }
                                            if (
                                              /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(
                                                word,
                                              )
                                            ) {
                                              return (
                                                <a
                                                  key={DescriptionIndex}
                                                  href={word}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-500 hover:underline"
                                                >
                                                  {word}
                                                </a>
                                              )
                                            }
                                            return (
                                              <span key={DescriptionIndex}>
                                                {word}{" "}
                                              </span>
                                            )
                                          })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <div className="flex flex-col justify-center items-center w-full h-full">
                            <TfiComment />
                            <div className="text-lg font-semibold mb-2 dark:text-white">
                              No Comments Yet
                            </div>
                            <span className="text-sm text-gray-500 text-center mb-4 block">
                              Comment and @mention <br /> people to notify them.
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-auto w-full">
                        <div>
                          {filteredUsers.length > 0 && isPoperOpen && (
                            <Popover
                              shouldBlockScroll
                              className="w-fit popover-scroll-container max-h-[42vh] overflow-y-auto no-scrollbar border border-gray-200 rounded-2xl"
                              isOpen={isPoperOpen}
                              align="start"
                              placement="top"
                            >
                              <PopoverTrigger>
                                <div />
                              </PopoverTrigger>
                              <PopoverContent
                                aria-label="Static Actions"
                                tabIndex={!null}
                                className="p-2 bg-white shadow-md items-start dark:bg-black"
                              >
                                {filteredUsers.map((user) => (
                                  <div
                                    key={user.id}
                                    onClick={() =>
                                      handleClick(user.name, user.email)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        handleClick(user.name, user.email)
                                      }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    className="flex items-start py-2 p-1 cursor-pointer transition duration-200 group w-full hover:bg-purple-700 hover:text-white rounded-2xl"
                                  >
                                    <Avatar
                                      name={user.name.substring(0, 1)}
                                      className="mr-2"
                                    />
                                    <div className="flex flex-col">
                                      <div className="font-semibold group-hover:text-white">
                                        {user.name.length > 15
                                          ? `${user.name.substring(0, 15)}...`
                                          : user.name}
                                      </div>
                                      <div className="text-gray-500 group-hover:text-white dark:text-white">
                                        {user.email}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        <div className="p-0 positio-sticky">
                          <Input
                            value={comment}
                            onChange={handleCommentChange}
                            onFocus={handleInputFocus}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleComment()
                              }
                            }}
                            className="inputWrapper p-2"
                            placeholder="Add a comment..."
                            endContent={
                              <button type="button" onClick={handleComment}>
                                <IoMdSend />
                              </button>
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  )
}
