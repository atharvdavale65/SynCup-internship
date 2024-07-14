import React, { useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  User,
  Pagination,
  Button,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react"
import { MdOutlineDeleteSweep } from "react-icons/md"
import { LiaUserEditSolid } from "react-icons/lia"
import toast from "react-hot-toast"
import { useParams } from "next/navigation"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"
import {
  updateUserRole,
  updateUser,
  removeUserFromOrganization,
  createUser,
  UserExists,
} from "@/server/user"
import { Role } from "@/src/roleManagement/roleManagement"
import InviteUser from "@/src/lib/actions/authActions"
import "react-toastify/dist/ReactToastify.css"
import { Adduserorganization, assignuser } from "@/server/organization"
import { connectUserToPublicBoards } from "@/server/board"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^\d{10,13}$/

const validateName = (name) => {
  if (name.trim() === "") {
    return false
  }
  return true
}
const validateEmail = (email) => {
  return emailRegex.test(email)
}

const validatePhone = (phone) => {
  return phoneRegex.test(phone)
}

export default function UserManagement() {
  const { allUserData, setUserUpdate, boardData } = useGlobalSyncupContext()
  const [page, setPage] = useState(1)
  const params = useParams()
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: Role.User,
  })
  const [selectedrows, setSelectedrows] = useState([])
  const [editUser, setEditUser] = useState(null)
  const rowsPerPage = 5
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = page * rowsPerPage
  const paginatedData = allUserData.slice(startIndex, endIndex)
  const totalPages = Math.ceil(allUserData.length / rowsPerPage)
  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onOpenChange: onOpenChange1,
  } = useDisclosure()

  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [nameError, setNameError] = useState("")
  const [loading, setLoading] = useState(false)
  const boardid = useParams()

  const handleAdddelete = async () => {
    try {
      setLoading(true)
      if (selectedrows === "all") {
        const allUserId = paginatedData.map((item) => item.email)
        await Promise.all(
          allUserId.map((email) =>
            removeUserFromOrganization(email, boardid.organization),
          ),
        )
        setUserUpdate(true)
        setLoading(false)
        setSelectedrows(new Set())
      } else {
        const selectedRowsArray = Array.from(selectedrows)
        await Promise.all(
          selectedRowsArray.map((userId) => {
            const user = paginatedData.find(
              (item) => item.id === parseInt(userId, 10),
            )
            if (user) {
              return removeUserFromOrganization(
                user.email,
                boardid.organization,
              )
            }
            return null
          }),
        )

        setUserUpdate(true)

        setLoading(false)
        setSelectedrows(new Set())
      }
    } catch (error) {
      toast.error("Error deleting user")
      setUserUpdate(true)
      setLoading(false)
    }
  }

  const handleRoleChange = async (newRole, userEmail) => {
    const orgnization = params.organization
    try {
      await updateUserRole({
        email: userEmail,
        role: newRole,
        organizationname: orgnization,
      })
      setUserUpdate(true)
    } catch (error) {
      toast.error("Error updating role")
    }
  }

  const handleDeleteUser = async (email) => {
    try {
      await removeUserFromOrganization(email, boardid.organization)
      setUserUpdate(true)
    } catch (error) {
      toast.error("Error deleting user")
    }
  }

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber)
  }

  const handleNewUserInputChange = (e, field) => {
    const { value } = e.target
    setNewUserData({ ...newUserData, [field]: value })

    if (field === "name") setNameError("")
    if (field === "email") setEmailError("")
    if (field === "phone") setPhoneError("")
  }

  const handleModalClose = () => {
    setNewUserData({ name: "", email: "", phone: "", role: Role.User })
    setEmailError("")
    setPhoneError("")
  }

  const handleSaveEdit = async () => {
    const isNameValid = validateName(editUser.name)
    const isPhoneValid = validatePhone(editUser.phone)
    if (!isNameValid) setNameError("User name can not be empty")
    if (!isPhoneValid) setPhoneError("Invalid phone number")
    if (isNameValid && isPhoneValid) {
      try {
        setPhoneError("")
        setNameError("")
        await updateUser({
          name: editUser.name,
          role: editUser.role,
          phone: editUser.phone,
          password: editUser.password,
          userEmail: editUser.email,
        })
        setEditUser(null)
        setUserUpdate(true)
      } catch (error) {
        toast.error("Error updating user")
      }
    }
  }

  const submitRequest = async () => {
    try {
      await InviteUser(newUserData.email, boardid.organization)
      toast.success("Invite link was sent to your email.")
    } catch (e) {
      if (e.message === "The User Does Not Exist!") {
        toast.error("No user found with the provided email address.")
      } else {
        toast.error("Something went wrong!")
      }
    }
  }

  const handleCreateNewUser = async () => {
    const isNameValid = validateName(newUserData.name)
    const isEmailValid = validateEmail(newUserData.email)
    const isPhoneValid = validatePhone(newUserData.phone)

    if (!isNameValid) setNameError("User name can not be empty")
    if (!isEmailValid) setEmailError("Invalid email format")
    if (!isPhoneValid) setPhoneError("Invalid phone number")
    setUserUpdate(true)
    if (isNameValid && isEmailValid && isPhoneValid) {
      try {
        const userData = { ...newUserData }
        const isPresent = await UserExists(userData.email)
        if (isPresent) {
          await assignuser(boardid.organization, userData.email)
          await Adduserorganization(
            boardid.organization,
            userData.email,
            userData.role,
          )
          await connectUserToPublicBoards(userData.id, boardData)
          await submitRequest()
          setUserUpdate(true)
          onOpenChange1()
          setNewUserData({ name: "", email: "", phone: "", role: Role.User })
        } else {
          const result = await createUser(userData)
          await assignuser(boardid.organization, result.email)
          await Adduserorganization(
            boardid.organization,
            userData.email,
            userData.role,
          )
          await connectUserToPublicBoards(result.id, boardData)
          await submitRequest()
          setUserUpdate(true)
          onOpenChange1()
          setNewUserData({ name: "", email: "", phone: "", role: Role.User })
        }
      } catch (e) {
        onOpenChange1()
      }
    }
  }

  return (
    <div>
      <div className="flex flex-row-reverse">
        <Button
          className=" mb-2 mr-2"
          size="sm"
          color="secondary"
          variant="bordered"
          onPress={onOpen1}
        >
          Add User
        </Button>
        {(selectedrows.size > 0 || selectedrows === "all") && (
          <Button
            className=" mb-2 mr-2"
            size="sm"
            color="danger"
            variant="bordered"
            isLoading={loading}
            onClick={(e) => {
              e.stopPropagation()
              handleAdddelete()
            }}
          >
            {selectedrows === "all" ? (
              <>Delete {allUserData.length} Users</>
            ) : (
              <>Delete {Array.from(selectedrows).length} Users</>
            )}
          </Button>
        )}
        <Modal
          isOpen={isOpen1}
          onOpenChange={onOpenChange1}
          onClose={handleModalClose}
          className="max-h-screen overflow-y-auto no-scrollbar"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Add User
                </ModalHeader>
                <ModalBody>
                  <Input
                    size="sm"
                    type="text"
                    label="Full Name"
                    value={newUserData.name}
                    onChange={(e) => handleNewUserInputChange(e, "name")}
                    errorMessage={nameError}
                    isRequired
                  />
                  <Input
                    size="sm"
                    type="email"
                    label="Email"
                    value={newUserData.email}
                    onChange={(e) => handleNewUserInputChange(e, "email")}
                    errorMessage={emailError}
                    isRequired
                  />
                  <Input
                    size="sm"
                    type="tel"
                    label="Phone"
                    value={newUserData.phone}
                    onChange={(e) => handleNewUserInputChange(e, "phone")}
                    errorMessage={phoneError}
                    isRequired
                  />
                  <Select
                    label="Select a Role"
                    size="sm"
                    isRequired
                    value={newUserData.role}
                    onChange={(e) => handleNewUserInputChange(e, "role")}
                  >
                    {Object.values(Role).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={handleCreateNewUser}>
                    Submit
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
      {paginatedData.length > 0 ? (
        <>
          <Table
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
                return false
              }
              return undefined
            }}
          >
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>Phone</TableColumn>
              <TableColumn className="text-center">Role</TableColumn>
              <TableColumn className="text-center">Action</TableColumn>
            </TableHeader>
            <TableBody className="text-center">
              {paginatedData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <User
                      avatarProps={{
                        radius: "sm",
                        src: user.photo ? user.photo : null,
                        name: user.photo
                          ? null
                          : user.name.slice(0, 1).toUpperCase(),
                      }}
                      description={
                        user.email.length > 30
                          ? `${user.email.slice(0, 30)}...`
                          : user.email
                      }
                      name={
                        user.name.length > 20
                          ? `${user.name.slice(0, 20)}...`
                          : user.name
                      }
                    >
                      {user.email}
                    </User>
                  </TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Select
                      defaultSelectedKeys={[
                        user.userOrganizations.find(
                          (org) => org.organizationName === params.organization,
                        )?.role || "",
                      ]}
                      className="max-w-xs"
                      onChange={(e) =>
                        handleRoleChange(e.target.value, user.email)
                      }
                    >
                      {Object.values(Role).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="relative flex gap-2 text-center justify-center">
                      <span
                        className="text-2xl text-default-400 cursor-pointer active:opacity-50"
                        onClick={() => setEditUser(user)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setEditUser(user)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <LiaUserEditSolid />
                      </span>

                      <Popover placement="top">
                        <PopoverTrigger>
                          <span className="text-2xl text-danger cursor-pointer active:opacity-50">
                            <MdOutlineDeleteSweep />
                          </span>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px]">
                          <div className="text-small">
                            Are you sure you want to delete member?
                          </div>

                          <div className="ml-28">
                            <Button
                              color="danger"
                              size="sm"
                              className="capitalize"
                              onClick={() => handleDeleteUser(user.email)}
                            >
                              Delete
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
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
              total={totalPages}
              color="secondary"
              onChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <div className="w-full text-center bg-white text-xl p-5 rounded-md">
          No user found
        </div>
      )}
      <Modal
        isOpen={!!editUser}
        onOpenChange={() => setEditUser(null)}
        className="max-h-screen overflow-y-auto no-scrollbar"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Update User</ModalHeader>
          <ModalBody>
            <Input
              size="sm"
              type="text"
              label="Name"
              value={editUser?.name || ""}
              onChange={(e) => {
                setNameError("")
                setEditUser({ ...editUser, name: e.target.value })
              }}
              errorMessage={nameError}
            />
            <Input
              size="sm"
              type="tel"
              label="Phone"
              value={editUser?.phone || ""}
              onChange={(e) => {
                setPhoneError("")
                setEditUser({ ...editUser, phone: e.target.value })
              }}
              errorMessage={phoneError}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setEditUser(null)}
            >
              Close
            </Button>
            <Button color="primary" onPress={handleSaveEdit}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
