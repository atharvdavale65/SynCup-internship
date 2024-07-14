"use client"

import React, { useEffect, useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  Radio,
  RadioGroup,
  Card,
  Button,
  Select,
  SelectItem,
  Avatar,
  AvatarGroup,
  Tooltip,
} from "@nextui-org/react"
import { IoAdd, IoCloseOutline } from "react-icons/io5"
import { useParams } from "next/navigation"

import { BiSolidLock } from "react-icons/bi"
import {
  MdOutlinePublic,
  MdArrowForwardIos,
  MdArrowBackIos,
} from "react-icons/md"
import { useSession } from "next-auth/react"
import reactCSS from "reactcss"
import { SketchPicker } from "react-color"
import { toast } from "react-hot-toast"
import PropTypes from "prop-types"
import {
  createcategory,
  updateCategory,
  deleteCategory,
} from "@/server/category"
import {
  createboard,
  getAllUsers,
  getUserByEmail,
  updateBoard,
} from "@/server/board"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"

const backgroundImages = [
  "/backgrounds/image1.avif",
  "/backgrounds/image2.avif",
  "/backgrounds/image3.jpg",
  "/backgrounds/image4.jpg",
  "/backgrounds/image5.jpg",
  "/backgrounds/image6.avif",
  "/backgrounds/image7.jpg",
  "/backgrounds/image8.jpg",
  "/backgrounds/image1.avif",
]
const defaultColor = "#8e78b6"
function AddBoardModal({ open, onClose, boardData }) {
  const board = useParams()
  const { setudpateboard, setupdate, setcreatenotification } =
    useGlobalSyncupContext()
  const [boardName, setBoardName] = useState("")
  const [visibility, setVisibility] = useState(
    board.organization === "Ptask" ? "PRIVATE" : "PUBLIC",
  )
  const [error, setError] = useState("")
  const [categories, setCategories] = useState([""])
  const [selectedBackground, setSelectedBackground] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [allUsers, setAllUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const { data: session, status } = useSession()
  const [categoryColors, setCategoryColors] = useState([""])
  const [catgeoryId, setCatgeoryId] = useState([""])
  const [curentuser, setUser] = useState([])
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(
    Array(categories.length).fill(false),
  )
  const userName = session?.user?.name
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers(board.organization)
        if (!users) return toast.error("No users found")
        setAllUsers(users)
        if (status === "authenticated" && session && open && !boardData) {
          const userId = await getUserByEmail(session.user.email)
          setUser(userId)
        }
      } catch (errorOfUser) {
        toast.error("Error fetching users")
      }
      return null
    }
    if (open) {
      setCategories(categories)
      fetchUsers()
    }
  }, [open])
  useEffect(() => {
    setSelectedBackground(backgroundImages[currentIndex + 1])
  }, [currentIndex, backgroundImages])
  useEffect(() => {
    if (boardData) {
      if (session && session.user) {
        setBoardName(boardData.name || "")
        setVisibility(boardData.visibility || "PUBLIC")
        setSelectedBackground(boardData.background || "")
        setCurrentIndex(
          backgroundImages.findIndex((img) => img === boardData.background) - 1,
        )
        const sortedTasks = boardData.tasks.slice().sort((a, b) => a.id - b.id)
        const categoriesN = sortedTasks.map((task) => task.category)
        setCategories(categoriesN || [""])
        setCategoryColors(
          boardData.tasks.map((task) => task.color) || defaultColor,
        )
        setCatgeoryId(boardData.tasks.map((task) => task.id))
        setSelectedUsers(boardData.users.map((user) => user.id))
        setupdate(false)
      }
    }
  }, [boardData, session])
  const handleClose = () => {
    onClose()
    setError("")
    setBoardName("")
    setVisibility(board.organization === "Ptask" ? "PRIVATE" : "PUBLIC")
    setCurrentIndex(0)
    setSelectedUsers([])
    setCategories([""])
    setCategoryColors([""])
    setCatgeoryId([""])
  }
  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1
      return nextIndex >= backgroundImages.length ? 0 : nextIndex
    })
  }
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? backgroundImages.length - 1 : prevIndex - 1,
    )
  }
  const handleInputChange = (e) => {
    const { value } = e.target
    const specialCharacters = /[!@#$%^&*(),.?":{}|<>]/
    if (specialCharacters.test(value)) {
      setError("Special characters are not allowed")
    } else {
      setBoardName(value)
      setError("")
    }
  }
  const handleUserChange = (selectedItems) => {
    const selectedKeys = Array.from(selectedItems)
    setSelectedUsers(selectedKeys)
  }
  const handleVisibilityChange = (e) => {
    setError("")
    setVisibility(e.target.value)
  }
  const handleCreateOrUpdateBoard = async () => {
    try {
      if (!boardName.trim()) {
        setError("Board name cannot be empty")
        return
      }
      if (boardData) {
        const previousUserIds = boardData.users.map((user) => user.id)
        const usersToUnassign = previousUserIds.filter(
          (id) => !selectedUsers.includes(id.toString()),
        )
        const usersToAssign = selectedUsers.filter(
          (id) => !previousUserIds.includes(id),
        )
        await updateBoard(
          boardData.id,
          boardName,
          selectedBackground,
          visibility,
          usersToAssign.map((id) => ({ id })),
          usersToUnassign.map((id) => ({ id })),
          visibility === "PRIVATE"
            ? selectedUsers
            : allUsers.map((user) => user.id),
          userName,
        )
        const nonEmptyCategories = categories.filter(
          (category) => category.trim() !== "",
        )
        const updateTasksPromises = catgeoryId.map(async (taskId) => {
          const task = boardData.tasks.find((tasks) => tasks.id === taskId)
          if (task) {
            const categoryIndex = catgeoryId.indexOf(task.id)
            if (categoryIndex !== -1) {
              const newCategoryName = categories[categoryIndex]
              const color = categoryColors[categoryIndex]
              await updateCategory(newCategoryName, taskId, color)
            }
          }
        })

        const newIds = catgeoryId.filter(
          (id) => !boardData.tasks.some((task) => task.id === id),
        )

        const newCategories = nonEmptyCategories.filter(
          (category, index) =>
            category.trim() !== "" &&
            !catgeoryId.includes(boardData.tasks[index]?.id),
        )

        const updatecolor = categoryColors.filter(
          (color) => !boardData.tasks.some((task) => task.color === color),
        )

        const createCategoryPromises = newIds.map(async (id, index) => {
          if (newCategories.length > 0) {
            const categoryname = newCategories[index]
            const colors = updatecolor[index]
            await createcategory(categoryname, boardData.id, colors)
          }
        })

        const removedCategories = boardData.tasks.filter(
          (task) => !catgeoryId.includes(task.id),
        )
        const deleteCategoryPromises = removedCategories.map(async (task) => {
          await deleteCategory(task.id)
        })

        await Promise.all([
          ...updateTasksPromises,
          ...createCategoryPromises,
          ...deleteCategoryPromises,
        ])
        setudpateboard(true)
        setcreatenotification(false)
        setBoardName("")
        setVisibility(board.organization === "Ptask" ? "PRIVATE" : "PUBLIC")
        setCategories([""])
        setCategoryColors([""])
        setCatgeoryId([""])
        setSelectedUsers([])
        toast.success("Board updated successfully")
      } else if (boardName !== "") {
        const boardId = await createboard(
          boardName,
          visibility,
          selectedBackground,
          visibility === "PRIVATE"
            ? board.organization === "Ptask"
              ? [curentuser]
              : selectedUsers
            : allUsers.map((user) => user.id),
          board.organization,
          userName,
        )
        setudpateboard(true)
        const nonEmptyCategories = categories.filter(
          (category) => category.trim() !== "",
        )
        await Promise.all(
          nonEmptyCategories.map(async (category, index) => {
            const color = categoryColors[index]
            await createcategory(category, boardId, color)
          }),
        )
        if (boardId) toast.success("Board created successfully")
      }
      setBoardName("")
      setcreatenotification(false)
      setVisibility(board.organization === "Ptask" ? "PRIVATE" : "PUBLIC")
      setCategories([""])
      setCategoryColors([""])
      setCatgeoryId([""])
      setSelectedUsers([])
      if (boardName !== "") {
        handleClose()
      }
    } catch (errorOfBoard) {
      toast.error("Error creating board")
    }
  }
  const handleAddCategory = () => {
    setCategories([...categories, ""])
    setCatgeoryId([...catgeoryId, ""])
    setCategoryColors([...categoryColors, defaultColor])
    setCategoryPickerOpen([...categoryPickerOpen, false])
  }
  const handleDeleteCategory = (index) => {
    const updatedid = [...catgeoryId]
    updatedid.splice(index, 1)
    setCatgeoryId(updatedid)
    const updatedCategories = [...categories]
    updatedCategories.splice(index, 1)
    setCategories(updatedCategories)
    const updatedColors = [...categoryColors]
    updatedColors.splice(index, 1)
    setCategoryColors(updatedColors)
    const updatedPickerOpen = [...categoryPickerOpen]
    updatedPickerOpen.splice(index, 1)
    setCategoryPickerOpen(updatedPickerOpen)
  }
  const handleCategoryInputChange = (event, index) => {
    const updatedCategories = [...categories]
    updatedCategories[index] = event.target.value
    setCategories(updatedCategories)
  }

  const handleSwatchClick = (index) => {
    const updatedPickerOpen = [...categoryPickerOpen]
    updatedPickerOpen[index] = !updatedPickerOpen[index]
    setCategoryPickerOpen(updatedPickerOpen)
  }

  const handlePickerClose = (index) => {
    const updatedPickerOpen = [...categoryPickerOpen]
    updatedPickerOpen[index] = false
    setCategoryPickerOpen(updatedPickerOpen)
  }

  const handleCategoryColorChange = (index, newColor) => {
    const updatedColors = [...categoryColors]
    updatedColors[index] = newColor.hex
    setCategoryColors(updatedColors)
  }

  const getCategoryStyles = (categoryColor) =>
    reactCSS({
      default: {
        color: {
          width: "36px",
          height: "14px",
          borderRadius: "2px",
          background: categoryColor || defaultColor,
        },
        swatch: {
          padding: "5px",
          background: "#fff",
          borderRadius: "1px",
          boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
          display: "inline-block",
          cursor: "pointer",
        },
        popover: {
          position: "absolute",
          zIndex: "2",
          top: "25px",
          right: "0",
        },
        cover: {
          position: "fixed",
          top: "0px",
          right: "0px",
          bottom: "0px",
          left: "0px",
        },
      },
    })
  return (
    <Modal
      shouldBlockScroll={false}
      isOpen={open}
      onClose={handleClose}
      placement="center"
      className="p-1 max-h-[80vh] md:no-scrollbar"
    >
      <ModalContent className="overflow-y-auto md:max-h-500 no-scrollbar">
        <ModalHeader>{boardData ? "Update Board" : "Create Board"}</ModalHeader>
        <ModalBody>
          <Input
            label="BoardName"
            size="sm"
            value={boardName}
            onChange={handleInputChange}
            errorMessage={error}
          />
          {board.organization !== "Ptask" && (
            <RadioGroup
              label="Visiblity"
              color="secondary"
              orientation="horizontal"
              value={visibility}
              onChange={handleVisibilityChange}
            >
              <Radio value="PUBLIC">
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <MdOutlinePublic size={20} />
                  Public
                </span>
              </Radio>
              <Radio value="PRIVATE">
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <BiSolidLock size={20} />
                  Private
                </span>
              </Radio>
            </RadioGroup>
          )}

          <>
            <div style={{ color: "#72727a" }}>Categories</div>
            {categories.map((category, index) => (
              <div
                className="flex items-center"
                key={index}
                style={{ position: "relative" }}
              >
                <Input
                  placeholder="Enter Category Name"
                  variant="bordered"
                  size="sm"
                  value={category}
                  onChange={(event) => handleCategoryInputChange(event, index)}
                  endContent={
                    <IoCloseOutline
                      size={25}
                      onClick={() => handleDeleteCategory(index)}
                      style={{ color: "grey" }}
                    />
                  }
                />
                <div
                  className="ml-2"
                  style={getCategoryStyles(categoryColors[index]).swatch}
                  onClick={() => handleSwatchClick(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSwatchClick(index)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div style={getCategoryStyles(categoryColors[index]).color} />
                </div>
                {categoryPickerOpen[index] && (
                  <div style={getCategoryStyles(categoryColors[index]).popover}>
                    <div
                      style={getCategoryStyles(categoryColors[index]).cover}
                      onClick={() => handlePickerClose(index)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handlePickerClose(index)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    />
                    <SketchPicker
                      color={categoryColors[index]}
                      onChange={(color) =>
                        handleCategoryColorChange(index, color)
                      }
                    />
                  </div>
                )}
              </div>
            ))}
            <Button
              className="w-9"
              variant="flat"
              color="secondary"
              onClick={handleAddCategory}
            >
              <IoAdd size={25} />
            </Button>
          </>

          {visibility === "PRIVATE" && board.organization !== "Ptask" && (
            <div>
              <span>Select users</span>
              <Select
                className="w-full "
                color="secondary"
                placeholder="Select users"
                aria-label="select"
                items={allUsers.map((user) => {
                  const isSelected = selectedUsers.includes(user.id)
                  return {
                    key: user.id.toString(),
                    ...user,
                    selected: isSelected,
                    value: user.id,
                  }
                })}
                selectionMode="multiple"
                {...(boardData?.visibility === "PRIVATE" && {
                  selectedKeys: selectedUsers.map((user) => user.toString()),
                })}
                onSelectionChange={handleUserChange}
                variant="bordered"
                size="sm"
                classNames={{
                  label: "group-data-[filled=true]:-translate-y-5",
                  trigger: "min-h-unit-16",
                  listboxWrapper: "max-h-[200px] overflow-y-auto",
                }}
                style={{ border: "none" }}
                renderValue={(items) => {
                  return (
                    <div className="flex flex-wrap gap-2 p-4">
                      <AvatarGroup
                        size="sm"
                        className="justify-start"
                        isBordered
                        max={2}
                      >
                        {items.map((item, index) => (
                          <Tooltip
                            key={index}
                            placement="bottom"
                            showArrow
                            size="sm"
                            content={
                              item.textValue.length > 25 ? (
                                <>
                                  {item.textValue
                                    .match(/.{1,25}/g)
                                    .map((line, idx) => (
                                      <div key={idx}>{line}</div>
                                    ))}
                                </>
                              ) : (
                                item.textValue
                              )
                            }
                          >
                            <Avatar
                              size="sm"
                              name={item.textValue.substring(0, 1)}
                            />
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                    </div>
                  )
                }}
              >
                {allUsers.map((user) => (
                  <SelectItem
                    className={`max-h-32 overflow-auto no-scrollbar ${user.id === curentuser ? "bg-[#e5d5f5]" : ""}`}
                    value={user.value}
                    key={user.id}
                    textValue={user.name}
                  >
                    <div className="flex-column">
                      <div className="flex gap-2 items-center">
                        <Avatar name={user.name.substring(0, 1)} size="sm" />
                        <div className="flex flex-col">
                          <span className="text-small">
                            {user.name.length > 15
                              ? `${user.name.substring(0, 20)}...`
                              : user.name}{" "}
                          </span>
                          <span className="text-default-500 text-tiny">
                            ({user.email})
                          </span>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
          <div
            style={{
              color: "#72727a",
            }}
          >
            Background
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              height: "100px",
              perspective: "1000px",
            }}
          >
            {backgroundImages
              .slice(currentIndex, currentIndex + 3)
              .map((bg, index) => (
                <Card
                  key={index}
                  style={{
                    width: "30%",
                    cursor: "pointer",
                    borderRadius: "4px",
                    overflow: "hidden",
                    position: "absolute",
                    left: `calc(25% - 17% + ${index * (25 + 2)}%)`,
                    transition: "transform 0.5s ease-in-out",
                    height: "80px",
                    transform:
                      index === 1 ? "translateZ(140px)" : "translateZ(0)",
                    zIndex: index === 1 ? 1 : 0,
                    backgroundImage: `url(${bg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
            <Button
              color="secondary"
              onClick={handlePrev}
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                marginLeft: "20px",
                transform: "translateY(-50%)",
                zIndex: "2",
                background: "none",
                boxShadow: "none",
              }}
            >
              <MdArrowBackIos size={25} />
            </Button>
            <Button
              color="secondary"
              onClick={handleNext}
              style={{
                position: "absolute",
                top: "50%",
                marginRight: "16px",
                right: "0",
                transform: "translateY(-50%)",
                zIndex: "2",
                background: "none",
                boxShadow: "none",
              }}
            >
              <MdArrowForwardIos size={25} />
            </Button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
            }}
          >
            <Button variant="flat" color="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="flat"
              color="secondary"
              onClick={handleCreateOrUpdateBoard}
            >
              {boardData ? "Update" : "Create"}
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

AddBoardModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  boardData: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    visibility: PropTypes.string.isRequired,
    background: PropTypes.string.isRequired,
    categories: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
    tasks: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
      }),
    ).isRequired,
    users: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
}

export default AddBoardModal
