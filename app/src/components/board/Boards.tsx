"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Card,
  ListboxItem,
  Listbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react"
import { GrAdd } from "react-icons/gr"
import { MdOutlinePublic } from "react-icons/md"
import { BiSolidLock } from "react-icons/bi"
import { SlOptionsVertical } from "react-icons/sl"
import toast from "react-hot-toast"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { deleteBoard } from "@/server/board"
import AddBoardModal from "./boardmodal"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"
import { hasAccess, Permissions } from "@/src/roleManagement/roleManagement"

function Board() {
  const [openPopoverId, setOpenPopoverId] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [selectedBoardId, setSelectedBoardId] = useState(null)
  const [selectedBoardData, setSelectedBoardData] = useState(null)
  const [isconfirmationOpen, setIsconfirmationOpen] = useState(false)
  const { boardData, setBoardData, setDefaultLoad, setcreatenotification } =
    useGlobalSyncupContext()
  const orgname = useParams()
  const { data: session } = useSession()
  const userName = session?.user?.name

  const handleModalOpen = () => {
    setOpenModal(true)
    setSelectedBoardData(null)
  }

  const handleEdit = (board) => {
    setSelectedBoardData(board)
    setOpenModal(true)
    setOpenPopoverId(null)
  }
  const handleDelete = async (boardId, boardname, boarduser) => {
    try {
      await deleteBoard(boardId, boardname, boarduser, userName)
      setBoardData(boardData.filter((board) => board.id !== boardId))
      setIsconfirmationOpen(false)
      setDefaultLoad(true)
      setcreatenotification(false)
      toast.success("Board deleted successfully")
      return true
    } catch (error) {
      toast.error("Error deleting board")
      return false
    } finally {
      setOpenPopoverId(null)
    }
  }
  const handleModalClose = () => {
    setOpenModal(false)
  }

  return (
    <div className="flex">
      <div className="flex flex-row flex-wrap ml-5 mt-5">
        {boardData.map((board) => (
          <div key={board.id} className="relative p-1">
            {hasAccess(Permissions.createBoard) && (
              <Popover
                style={{ zIndex: 50 }}
                isOpen={openPopoverId === board.id}
                onOpenChange={(isOpen) =>
                  isOpen ? setOpenPopoverId(board.id) : setOpenPopoverId(null)
                }
                placement="bottom-end"
                offset={-5}
              >
                <PopoverTrigger>
                  <div className="absolute mt-2 mr-1 top-0 right-0 text-white">
                    <SlOptionsVertical
                      onClick={() => setSelectedBoardId(board.id)}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-1 w-20">
                  <Listbox variant="solid">
                    <ListboxItem
                      className="text-black dark:text-text"
                      color="secondary"
                      key="edit"
                      onClick={() =>
                        handleEdit(
                          boardData.find((b) => b.id === selectedBoardId),
                        )
                      }
                    >
                      Edit
                    </ListboxItem>
                    <ListboxItem
                      className="text-black dark:text-text"
                      color="danger"
                      key="delete"
                      onClick={() => setIsconfirmationOpen(true)}
                    >
                      Delete
                    </ListboxItem>
                  </Listbox>
                </PopoverContent>
              </Popover>
            )}

            <Link
              legacyBehavior
              href={`/${orgname.organization}/board/${board.id}`}
              passHref
            >
              <a
                className="cursor-pointer"
                style={{ textDecoration: "none", height: "100%" }}
              >
                <Card
                  className="flex flex-col overflow-hidden p-7 text-white rounded-lg shadow-md bg-cover bg-center bg-no-repeat"
                  style={{
                    width: "10.3rem",
                    height: "100px",
                    backgroundImage: board.background
                      ? `url(${board.background})`
                      : "linear-gradient(to right, #ff9a44, #ff4e00)",
                    opacity: 0.9,
                    textAlign: "center",
                    wordWrap: "break-word",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px 0 0 0",
                      width: "20px",
                      height: "20px",
                    }}
                  >
                    {board.visibility === "PUBLIC" ? (
                      <MdOutlinePublic />
                    ) : (
                      <BiSolidLock />
                    )}
                  </div>
                  <span className="font-bold overflow-ellipsis block text-xl leading-tight text-white">
                    {board.name}
                  </span>
                </Card>
              </a>
            </Link>
            <Modal
              isOpen={isconfirmationOpen}
              onOpenChange={() => setIsconfirmationOpen(!isconfirmationOpen)}
              style={{ zIndex: 9999 }}
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Delete Confirmation
                    </ModalHeader>
                    <ModalBody>
                      <p>Are you sure you want to delete this Board?</p>
                      <p>This action cannot be undone.</p>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="secondary"
                        variant="light"
                        onPress={onClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        color="danger"
                        onPress={() =>
                          handleDelete(selectedBoardId, board.name, board.users)
                        }
                      >
                        Delete
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        ))}

        {hasAccess(Permissions.createBoard) && (
          <div className="mt-1.5 ml-1">
            <Card
              className="h-[100px] w-[10.3rem] flex flex-col justify-center  text-center transition-transform duration-300 ease-in-out bg-[#7CB86E] bg-opacity-90 text-white rounded-lg shadow-md dark:bg-700 dark:text-black"
              onPress={handleModalOpen}
              isPressable
            >
              <GrAdd style={{ fontSize: 40, marginLeft: "60px" }} />
            </Card>
          </div>
        )}
      </div>

      <AddBoardModal
        open={openModal}
        onClose={handleModalClose}
        boardData={selectedBoardData}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      />
    </div>
  )
}
export default Board
