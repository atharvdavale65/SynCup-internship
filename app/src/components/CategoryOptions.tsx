import React, { useState } from "react"
import { CiCircleMore } from "react-icons/ci"
import PropTypes from "prop-types"

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react"
import { MdDeleteSweep, MdEdit } from "react-icons/md"
import toast from "react-hot-toast"
import { deleteCategory } from "@/server/category"
import { useGlobalSyncupContext } from "../context/SyncUpStore"
import GetSyncupData from "@/server/GetSyncupData"

// eslint-disable-next-line react/prop-types
function CategoryOptions({ taskid, boardid, setcategory, setId }) {
  const { setData } = useGlobalSyncupContext()
  const [isOpen, setIsOpen] = useState(false)

  const fetchData = async () => {
    try {
      const updatedData = await GetSyncupData(boardid)
      setData(updatedData)
    } catch (error) {
      toast.error("Error fetching data")
    }
  }
  const handleDeleteCategory = async () => {
    setIsOpen(false)
    await deleteCategory(taskid)
    fetchData()
  }

  const handleEditClick = async () => {
    setcategory(true)
    setId(taskid)
  }

  return (
    <>
      <Dropdown placement="bottom-end" className="min-w-[80px] " radius="sm">
        <DropdownTrigger>
          <div id="dropdownNavbarLink" className="cursor-pointer ">
            <CiCircleMore size={25} />
          </div>
        </DropdownTrigger>
        <DropdownMenu aria-label="Delete Category">
          <DropdownItem
            key="edit"
            className="cursor-pointer  text-sm w-25 "
            startContent={<MdEdit />}
            onClick={handleEditClick}
            color="secondary"
          >
            Edit
          </DropdownItem>
          <DropdownItem
            key="delete"
            color="danger"
            className="cursor-pointer text-danger text-sm w-25 "
            onClick={() => {
              setIsOpen(true)
            }}
            startContent={<MdDeleteSweep />}
          >
            Delete
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Modal
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(!isOpen)}
        style={{ zIndex: 9999 }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Confirmation
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this category?</p>
                <p>This action cannot be undone.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDeleteCategory}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

CategoryOptions.propTypes = {
  taskid: PropTypes.number.isRequired,
  boardid: PropTypes.number.isRequired,
}

export default CategoryOptions
