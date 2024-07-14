import React, { useState } from "react"
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
  Input,
  Textarea,
} from "@nextui-org/react"
import { Pagination } from "@nextui-org/pagination"
import { TbHomeEdit } from "react-icons/tb"
import { MdOutlineDeleteSweep } from "react-icons/md"
import toast from "react-hot-toast"
import intentsData from "../../chatbot/intents.json"

export default function App() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isMultipleDeleteOpen, setIsMultipleDeleteOpen] = useState(false)
  const [selectedrows, setSelectedrows] = useState([])
  const [newIntent, setNewIntent] = useState({
    name: "",
    training_phrases: [],
    response: "",
  })
  const [selectedIntentIndex, setSelectedIntentIndex] = useState(null)
  const [deleteIndex, setDeleteIndex] = useState(null)
  const itemsPerPage = 5

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleEditIntent = (index) => {
    setSelectedIntentIndex(index)
    setIsOpen(true)
    const selectedIntent =
      intentsData.intents[(currentPage - 1) * itemsPerPage + index]
    setNewIntent({
      name: selectedIntent.name,
      training_phrases: selectedIntent.training_phrases,
      response: selectedIntent.response,
    })
  }

  const handleAddOrUpdateIntent = async () => {
    setIsOpen(false)
    if (selectedIntentIndex !== null) {
      const adjustedIndex =
        (currentPage - 1) * itemsPerPage + selectedIntentIndex
      intentsData.intents[adjustedIndex] = newIntent
    } else {
      intentsData.intents.push(newIntent)
    }
    try {
      const response = await fetch("http://localhost:5000/api/save_intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(intentsData),
      })
      if (!response.ok) {
        toast.error("Failed to save intents.")
      }
    } catch (error) {
      toast.error("Error saving intents:", error.message)
    }
  }

  const handleDeleteIntent = (index) => {
    setDeleteIndex(index)
    setIsDeleteOpen(true)
  }

  const confirmDelete = () => {
    const adjustedIndex = (currentPage - 1) * itemsPerPage + deleteIndex
    intentsData.intents.splice(adjustedIndex, 1)
    try {
      fetch("http://localhost:5000/api/save_intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(intentsData),
      })
      setIsDeleteOpen(false)
    } catch (error) {
      toast.error("Error deleting intent:", error.message)
    }
  }

  const handleMultipleDelete = async () => {
    setIsMultipleDeleteOpen(true)
  }

  const confirmMultipleDelete = async () => {
    try {
      let indexesToDelete = []

      if (selectedrows === "all") {
        indexesToDelete = Array.from(
          { length: intentsData.intents.length },
          (_, index) => index,
        )
      } else {
        indexesToDelete = Array.from(selectedrows)
      }

      indexesToDelete
        .sort((a, b) => b - a)
        .forEach((index) => {
          intentsData.intents.splice(index, 1)
        })

      await fetch("http://localhost:5000/api/save_intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(intentsData),
      })

      setSelectedrows(new Set())
      setIsMultipleDeleteOpen(false)
    } catch (error) {
      toast.error("Error deleting intents:", error.message)
    }
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    intentsData.intents.length,
  )
  const visibleIntents = intentsData.intents.slice(startIndex, endIndex)
  const totalPages = Math.ceil(intentsData.intents.length / itemsPerPage)

  return (
    <>
      <div className="flex flex-row-reverse">
        <Button
          className="mb-2 mr-2"
          size="sm"
          color="secondary"
          variant="bordered"
          onClick={() => {
            setSelectedIntentIndex(null)
            setNewIntent({
              name: "",
              training_phrases: [],
              response: "",
            })
            setIsOpen(true)
          }}
        >
          Add New Intent
        </Button>

        {(selectedrows.size > 0 || selectedrows === "all") && (
          <Button
            className="mb-2 mr-2"
            size="sm"
            color="danger"
            variant="bordered"
            onClick={(e) => {
              e.stopPropagation()
              handleMultipleDelete()
            }}
          >
            {selectedrows === "all" ? (
              <>Delete {intentsData.intents.length} Intents</>
            ) : (
              <>Delete {selectedrows.size} Intents</>
            )}
          </Button>
        )}
      </div>

      <div className="flex flex-col max-h-[25rem] overflow-auto gap-5 no-scrollbar">
        <Table
          className="w-full"
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
              return error
            }
            return null
          }}
        >
          <TableHeader>
            <TableColumn className="w-1/6">Intents</TableColumn>
            <TableColumn className="w-1/5">Training Phrases</TableColumn>
            <TableColumn>Response</TableColumn>
            <TableColumn className="w-24">Action</TableColumn>
          </TableHeader>
          <TableBody>
            {visibleIntents.map((intent, index) => (
              <TableRow key={startIndex + index}>
                <TableCell>{intent.name}</TableCell>
                <TableCell>
                  <ol style={{ listStyleType: "decimal" }}>
                    {intent.training_phrases.map((phrase, i) => (
                      <li key={i}>
                        {phrase.length > 28
                          ? `${phrase.substring(0, 28)}...`
                          : phrase}
                      </li>
                    ))}
                  </ol>
                </TableCell>
                <TableCell>{intent.response}</TableCell>
                <TableCell>
                  <div className="flex justify-around content-center h-full">
                    <span
                      className="text-2xl cursor-pointer text-gray-500"
                      onClick={() => handleEditIntent(index)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleEditIntent(index)
                        }
                      }}
                    >
                      <TbHomeEdit />
                    </span>
                    <button
                      type="button"
                      className="text-2xl cursor-pointer text-red-500"
                      onClick={() => handleDeleteIntent(index)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleDeleteIntent(index)
                        }
                      }}
                    >
                      <MdOutlineDeleteSweep />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex w-full justify-end pr-5">
        <Pagination
          page={currentPage}
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

      <Modal
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(!isOpen)}
        style={{ zIndex: 9999 }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {selectedIntentIndex !== null
                  ? "Edit Intent"
                  : "Add New Intent"}
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Name"
                  value={newIntent.name}
                  onChange={(e) =>
                    setNewIntent({ ...newIntent, name: e.target.value })
                  }
                  placeholder="Enter intent name"
                />
                <Textarea
                  label="Training Phrases"
                  value={newIntent.training_phrases.join("\n")}
                  onChange={(e) =>
                    setNewIntent({
                      ...newIntent,
                      training_phrases: e.target.value.split("\n"),
                    })
                  }
                  placeholder="Enter training phrases (each phrase in a new line)"
                  className="mt-2"
                  height={100}
                />
                <Textarea
                  label="Response"
                  value={newIntent.response}
                  onChange={(e) =>
                    setNewIntent({ ...newIntent, response: e.target.value })
                  }
                  placeholder="Enter response"
                  className="mt-2"
                  height={100}
                />
              </ModalBody>
              <ModalFooter>
                <Button auto onPress={onClose} color="error">
                  Cancel
                </Button>
                <Button
                  auto
                  onClick={handleAddOrUpdateIntent}
                  color="secondary"
                >
                  {selectedIntentIndex !== null ? "Save Changes" : "Add Intent"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={() => setIsDeleteOpen(!isDeleteOpen)}
        style={{ zIndex: 9999 }}
      >
        <ModalContent>
          <ModalHeader>Delete Confirmation</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this Intent?</p>
            <p>This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              variant="light"
              onPress={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isMultipleDeleteOpen}
        onOpenChange={() => setIsMultipleDeleteOpen(!isMultipleDeleteOpen)}
        style={{ zIndex: 9999 }}
      >
        <ModalContent>
          <ModalHeader>Delete Confirmation</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete selected Intents?</p>
            <p>This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              variant="light"
              onPress={() => setIsMultipleDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onPress={confirmMultipleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
