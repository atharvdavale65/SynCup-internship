"use client"

import React, { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Textarea,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react"
import { FaCloudUploadAlt } from "react-icons/fa"
import { getSession } from "next-auth/react"
import PropTypes from "prop-types"
import toast from "react-hot-toast"
import { Addorganization, Adduserorganization } from "@/server/organization.js"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"
import { Role } from "../roleManagement/roleManagement"

function CreateOrganization({ isOpen, handleOrgCloseModal, setupdate }) {
  const [companyName, setCompanyName] = useState("")
  const [companyType, setCompanyType] = useState("")
  const [showNameError, setShowNameError] = useState("")
  const [descriptionError, setDescriptionError] = useState("")
  const [showTypeError, setShowTypeError] = useState("")
  const [profileImage, setProfileImage] = useState(null)
  const [organizationData, setorganizationData] = useState({
    name: "",
    type: "",
    description: "",
    profile: "",
  })
  const { setUpdateOrg } = useGlobalSyncupContext()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setorganizationData({ ...organizationData, [name]: value })
  }

  const handleProfileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size < 1024 * 1024) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        setProfileImage(reader.result)
        setorganizationData({ ...organizationData, profile: reader.result })
      }
    }
  }

  const handleSubmitOrganization = async () => {
    try {
      const session = await getSession()
      if (!session) {
        return
      }

      if (companyName.trim() === "") {
        setShowNameError("Organization name is required.")
        return
      }
      if (!/^[a-zA-Z0-9]*$/.test(companyName)) {
        setShowNameError(
          "Organization name must not contain special characters, spaces, or dots.",
        )
        return
      }
      if (companyType.trim() === "") {
        setShowTypeError("Type is required.")
        return
      }

      const createdorganization = await Addorganization(
        organizationData,
        session.user.email,
      )
      setCompanyName("")
      setCompanyType("")
      setProfileImage(null)
      setorganizationData({
        name: "",
        type: "",
        description: "",
        profile: "",
      })
      await Adduserorganization(
        createdorganization.name,
        session.user.email,
        Role.SuperAdmin,
      )
      setUpdateOrg(true)
      setupdate(true)
      handleOrgCloseModal()
      setShowNameError(false)
      setShowTypeError(false)
    } catch (error) {
      toast.error("Error submitting organization:", error)
    }
  }

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      onClose={() => {
        handleOrgCloseModal()
        setProfileImage(null)
        setorganizationData({
          name: "",
          type: "",
          description: "",
          profile: "",
        })
        setShowNameError("")
        setShowTypeError("")
      }}
      classNames={{
        backdrop:
          "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            <h1 className="font-bold"> Let Build a Organization</h1>
            <p className="text-xs ">
              Boost your productivity by making it easier for everyone to acess
              boards in one location.
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="flex items-center justify-center w-full">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Organization Profile"
                  className="flex flex-col items-center justify-center w-full h-32 rounded-lg"
                />
              ) : (
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaCloudUploadAlt className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span>{" "}
                      Organization Profile
                    </p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    onChange={handleProfileChange}
                  />
                </label>
              )}
            </div>

            <Input
              isRequired
              type="name"
              label=" Company name"
              name="name"
              value={organizationData.name}
              placeholder="Enter your organization name"
              onChange={(e) => {
                setCompanyName(e.target.value)
                setShowNameError("")
                handleInputChange(e)
              }}
              errorMessage={showNameError}
            />

            <Select
              isRequired
              label="Company Type"
              name="type"
              placeholder="Select Type of organization"
              value={organizationData.type}
              onChange={(e) => {
                setCompanyType(e.target.value)
                setShowTypeError("")
                handleInputChange(e)
              }}
              errorMessage={showTypeError}
            >
              <SelectItem key="Education">Education</SelectItem>
              <SelectItem key="HR">Human resources</SelectItem>
              <SelectItem key="operations">Operations</SelectItem>
              <SelectItem key="Marketing">Marketing</SelectItem>
              <SelectItem key="Sales CRM">Sales CRM</SelectItem>
              <SelectItem key="Small Business">Small Business</SelectItem>
              <SelectItem key="Engineering">Engineering It</SelectItem>
              <SelectItem key="Other">Other</SelectItem>
            </Select>
            <Textarea
              label="Description of company"
              name="description"
              placeholder="Enter your description"
              onChange={(e) => {
                setDescriptionError("")
                handleInputChange(e)
              }}
              errorMessage={descriptionError}
            />
          </ModalBody>

          <ModalFooter>
            <div className="save flex">
              <Button color="secondary" onPress={handleSubmitOrganization}>
                Save
              </Button>
            </div>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  )
}
CreateOrganization.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleOrgCloseModal: PropTypes.func.isRequired,
  setupdate: PropTypes.func.isRequired,
}
export default CreateOrganization
