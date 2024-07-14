import React, { useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Textarea,
  Popover,
  PopoverTrigger,
  PopoverContent,
  User,
} from "@nextui-org/react"
import toast from "react-hot-toast"
import { TbHomeEdit } from "react-icons/tb"
import { MdOutlineDeleteSweep } from "react-icons/md"
import { useParams, useRouter } from "next/navigation"
import CreateOrganization from "../CreateOrganization"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"
import { updateOrganization, deleteOrganization } from "@/server/organization"

function OrganizationSetting() {
  const { organizationname, setUpdateOrg } = useGlobalSyncupContext()
  const router = useRouter()
  const currentOrganization = useParams()
  const [selectedrows, setSelectedrows] = useState([])
  const [orgOpenModal, setOrgOpenModal] = useState(false)
  const [editOrg, setEditOrg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [nameError, setNameError] = useState("")
  const [typeError, setTypeError] = useState("")
  const [descriptionError, setDescriptionError] = useState("")

  const [page, setPage] = useState(1)
  const rowsPerPage = 5

  const organizationTypes = [
    { key: "Education", label: "Education" },
    { key: "HR", label: "Human resources" },
    { key: "operations", label: "Operations" },
    { key: "Marketing", label: "Marketing" },
    { key: "Sales CRM", label: "Sales CRM" },
    { key: "Small Business", label: "Small Business" },
    { key: "Engineering", label: "Engineering It" },
    { key: "Other", label: "Other" },
  ]

  const handleOrgOpenModal = () => {
    setOrgOpenModal(true)
  }

  const handleOrgCloseModal = () => {
    setOrgOpenModal(false)
  }

  const startIndex = (page - 1) * rowsPerPage
  const endIndex = page * rowsPerPage
  const paginatedOrganization = organizationname.slice(startIndex, endIndex)
  const totalPages = Math.ceil(organizationname.length / rowsPerPage)
  const paginatedOrganizationSorted = paginatedOrganization
    .slice()
    .sort((a, b) => a.id - b.id)

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber)
  }

  const handleUpdateOrganization = async () => {
    try {
      if (!editOrg.name.trim()) {
        setNameError("Name is required.")
        return
      }
      if (/\s/.test(editOrg.name)) {
        setNameError("Name should not contain white space.")
        return
      }
      setNameError("")

      if (!editOrg.type.trim()) {
        setTypeError("Type is required.")
        return
      }
      setTypeError("")

      if (editOrg.description.split(/\s+/).length > 500) {
        setDescriptionError(
          "Description should not contain more than 500 words.",
        )
        return
      }
      setDescriptionError("")

      await updateOrganization(editOrg)
      setUpdateOrg(true)
      setEditOrg(null)
    } catch (error) {
      toast.error("Error updating organization:", error)
    }
  }

  const handleMultipleDelete = async () => {
    try {
      setLoading(true)
      let orgIdsToDelete = []
      if (selectedrows === "all") {
        orgIdsToDelete = organizationname.map((org) => org.id)
      } else if (selectedrows.size > 0) {
        orgIdsToDelete = Array.from(selectedrows).filter((orgId) =>
          parseInt(orgId, 10),
        )
      } else {
        toast.error("Please select at least one organization to delete.")
        setLoading(false)
        return
      }
      await Promise.all(
        orgIdsToDelete.map((orgId) => deleteOrganization(parseInt(orgId, 10))),
      )
      setUpdateOrg(true)
      setLoading(false)
      setSelectedrows(new Set())
    } catch (error) {
      toast.error("Error deleting organization")
      setLoading(false)
    }
  }

  const handleDeleteOrg = async (ordId) => {
    try {
      const organisation = await deleteOrganization(ordId)
      if (organisation.name === currentOrganization.organization) {
        router.push("/auth/login")
      }
      setUpdateOrg(true)
    } catch (error) {
      toast.error("Error deleting user")
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
          onPress={handleOrgOpenModal}
        >
          Add Organization
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
              handleMultipleDelete()
            }}
          >
            {selectedrows === "all" ? (
              <>Delete {organizationname.length} Organizations</>
            ) : (
              <>Delete {Array.from(selectedrows).length} Organizations</>
            )}
          </Button>
        )}
      </div>
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
            return error
          }
          return null
        }}
      >
        <TableHeader>
          <TableColumn>Profile</TableColumn>
          <TableColumn>Organization NAME</TableColumn>
          <TableColumn>Type</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn className="text-center">Action</TableColumn>
        </TableHeader>
        <TableBody className="text-center">
          {paginatedOrganizationSorted.map((org) => (
            <TableRow key={org.id}>
              <TableCell>
                <User
                  avatarProps={{
                    radius: "sm",
                    src: org.profile ? org.profile : null,
                    name: org.profile
                      ? null
                      : org.name.slice(0, 1).toUpperCase(),
                  }}
                />
              </TableCell>
              <TableCell>
                {org.name.length > 30
                  ? `${org.name.slice(0, 20)}...`
                  : org.name}
              </TableCell>
              <TableCell>{org.type}</TableCell>
              <TableCell>
                {org.description.length > 30
                  ? `${org.description.slice(0, 30)}...`
                  : org.description}
              </TableCell>
              <TableCell>
                <div className="relative flex gap-2 text-center justify-center">
                  <span
                    className={`text-2xl text-default-400 `}
                    onClick={() => setEditOrg(org)}
                    onKeyDown={() => setEditOrg(org)}
                    tabIndex={0}
                    role="button"
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
                        Are you sure you want to delete organization?
                      </div>

                      <div className="ml-28">
                        <Button
                          color="danger"
                          size="sm"
                          className="capitalize"
                          onClick={() => handleDeleteOrg(org.id)}
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
      <CreateOrganization
        isOpen={orgOpenModal}
        handleOrgCloseModal={handleOrgCloseModal}
        setupdate={setUpdateOrg}
      />
      <Modal
        isOpen={!!editOrg}
        onOpenChange={() => setEditOrg(null)}
        className="max-h-screen overflow-y-auto no-scrollbar"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Update Organization
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-wrap md:flex-nowrap gap-4">
              <Input
                isRequired
                type="name"
                label="Company name"
                name="name"
                placeholder="Enter your organization name"
                value={editOrg ? editOrg.name : ""}
                onChange={(e) => {
                  setNameError("")
                  setEditOrg({ ...editOrg, name: e.target.value })
                }}
                errorMessage={nameError}
              />
            </div>
            <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
              <Select
                isRequired
                label="Company Type"
                name="type"
                placeholder="Select Type of organization"
                defaultSelectedKeys={[editOrg ? editOrg.type : ""]}
                value={editOrg ? editOrg.type : ""}
                onChange={(e) => {
                  setTypeError("")
                  setEditOrg({ ...editOrg, type: e.target.value })
                }}
                errorMessage={typeError}
              >
                {organizationTypes.map((type) => (
                  <SelectItem key={type.key}>{type.label}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
              <Textarea
                label="Description of company"
                name="description"
                placeholder="Enter your description"
                value={editOrg ? editOrg.description : ""}
                onChange={(e) => {
                  setDescriptionError("")
                  setEditOrg({ ...editOrg, description: e.target.value })
                }}
                errorMessage={descriptionError}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setEditOrg(null)}
            >
              Close
            </Button>
            <Button color="primary" onClick={handleUpdateOrganization}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default OrganizationSetting
