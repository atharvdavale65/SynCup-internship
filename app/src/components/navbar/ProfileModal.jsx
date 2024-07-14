import {
  Chip,
  Modal,
  ModalContent,
  ModalBody,
  Avatar,
  CircularProgress,
  Input,
} from "@nextui-org/react"
import { FiPlusSquare } from "react-icons/fi"
import { FaEdit } from "react-icons/fa"
import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { MdCheckCircleOutline, MdHighlightOff } from "react-icons/md"
import bcrypt from "bcryptjs"
import toast from "react-hot-toast"
import PropTypes from "prop-types"
import { UserData, updateProfile, updateUser } from "@/server/user"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"

export default function ProfileModal(props) {
  const { handleCloseModal } = props
  const { setPhotoUpdate } = useGlobalSyncupContext()
  const [openm] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isPasswordEditMode, setIsPasswordEditMode] = useState(false)
  const [currentPassword] = useState("********")
  const [newPassword, setNewPassword] = useState("")
  const [data, setData] = useState("")
  const { data: session } = useSession()
  const userEmail = session.user.email
  const [image, setImage] = useState("")
  const [label, setLabels] = useState("")
  const [load, setLoad] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [passwordError, setPasswordError] = useState(null)

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const handlePasswordEditButtonClick = () => {
    setIsPasswordEditMode(true)
  }

  async function fetchData() {
    if (image !== image.photo) {
      setLoad(true)
    }
    if (userEmail !== undefined) {
      try {
        const userData = await UserData(userEmail)
        setData(userData)
        setImage(userData)
        setLabels(userData.boards.map((board) => board.name))
      } catch (error) {
        toast.error("Error fetching user data:")
      }
    }
    setLoad(false)
  }
  useEffect(() => {
    fetchData()
  }, [])

  const handleEditButtonClick = (e) => {
    e.preventDefault()
    setIsEditMode(true)
  }

  const handleFieldChange = (field, value) => {
    setData((prevData) => ({
      ...prevData,
      [field]: value,
    }))
  }

  const validatePassword = (password) => {
    const hasMinimumLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasDigit = /\d/.test(password)
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(
      password,
    )

    if (
      hasMinimumLength &&
      hasUppercase &&
      hasLowercase &&
      hasDigit &&
      hasSpecialCharacter
    ) {
      return null
    }
    if (
      !hasMinimumLength &&
      hasUppercase &&
      hasLowercase &&
      hasDigit &&
      hasSpecialCharacter
    ) {
      return "Enter strong password atleast 8 character"
    }
    return "password should contain atleast one uppercase, lowercase letter, number and special character"
  }

  const handleUpdatePassword = async () => {
    try {
      const passwordValidationError = validatePassword(newPassword)
      if (passwordValidationError) {
        setPasswordError(passwordValidationError)
        return
      }

      const hashedPassword = bcrypt.hashSync(
        newPassword,
        parseInt(process.env.BCRYPT_SALT, 10),
      )
      await updateUser({
        name: data.name,
        role: data.role,
        phone: data.phone,
        password: hashedPassword,
        userEmail,
      })
      setIsPasswordEditMode(false)
      setNewPassword("")
      fetchData()
      toast.success("Password updated successfully")
    } catch (error) {
      toast.error("Error updating password")
    }
  }

  const handleUpdateDetails = async () => {
    if (
      !data.name ||
      data.name.trim() === "" ||
      !data.phone ||
      data.phone.trim() === ""
    ) {
      setSnackbarOpen(true)
      setIsEditMode(true)
    } else {
      try {
        if (
          /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
            data.phone,
          )
        ) {
          await updateUser({
            name: data.name,
            role: data.role,
            phone: data.phone,
            password: data.password,
            userEmail,
          })
          setData((prevData) => ({
            ...prevData,
            phone: data.phone,
          }))
          setIsEditMode(false)
          fetchData()
        } else {
          setSnackbarOpen(true)
        }
      } catch (error) {
        toast.error("Error updating user details")
      }
    }
  }

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      if (
        !data.name ||
        data.name.trim() === "" ||
        !data.phone ||
        data.phone.trim() === ""
      ) {
        setSnackbarOpen(true)
        return
      }
      await handleUpdateDetails()
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    const iName = file?.name
    if (!file) return

    setLoad(true)
    try {
      if (process.env.NEXT_PUBLIC_ENVIRONMENT !== "dev") {
        if (image && image.photo) {
          const imgName = image.imageName
          try {
            await fetch(`/api/delete?fileName=${encodeURIComponent(imgName)}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            })
          } catch (error) {
            toast.error("Error deleting image")
          }
        }

        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          toast.error("Failed to upload image")
        }
        const imagePath = await response.text()
        const trimmedImagePath = imagePath.trim()
        const sanitizedImagePath = trimmedImagePath.replace(/^"|"$/g, "")
        await updateProfile({ iName, imagePath: sanitizedImagePath, userEmail })
        setLoad(false)
        fetchData()
        setPhotoUpdate(true)
      } else if (file.size < 1024 * 1024) {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = async () => {
          await updateProfile({ imagePath: reader.result, userEmail })
          setLoad(false)
          fetchData()
          setPhotoUpdate(true)
        }
      }
    } catch (error) {
      toast.error("Error uploading image and updating profile")
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (snackbarOpen) {
        handleSnackbarClose()
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [snackbarOpen, handleSnackbarClose])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (snackbarOpen) {
        handleSnackbarClose()
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [snackbarOpen, handleSnackbarClose])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (snackbarOpen) {
        handleSnackbarClose()
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [snackbarOpen, handleSnackbarClose])

  return (
    <>
      <Modal
        isOpen={openm}
        onClose={handleCloseModal}
        size="2xl"
        className="dark:bg "
      >
        <ModalContent>
          <ModalBody>
            <div
              className="rounded-lg flex lg:flex-row w-full max-w-2xl max-h-screen overflow-y-auto relative dark:bg no-scrollbar"
              style={{ margin: -10, marginLeft: -24 }}
            >
              <div className="bg-gradient-to-r from-[#b9abdb] to-[#ede7f6] dark:bg-gradient-to-r from-800 to-900 pt-12 pl-6 pr-6 flex-grow max ">
                <div
                  className="mx-auto mt-8 w-16 h-16 relative cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <label
                    aria-label="Upload Profile Image"
                    htmlFor="profile-image"
                  >
                    <FiPlusSquare
                      className="absolute bottom-0 right-1 z-10 text-[#7754bd] bg-[#ede7f6] rounded-full"
                      style={{ fontSize: 16 }}
                    />
                    <input
                      type="file"
                      id="profile-image"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  {image && image.photo ? (
                    load ? (
                      <CircularProgress
                        style={{ color: "#683ab7" }}
                        size={70}
                        aria-label="Loading user profile image"
                      >
                        <Avatar
                          alt="User profile"
                          src={image.photo}
                          width={100}
                          height={100}
                          className="w-16 h-16"
                        />
                      </CircularProgress>
                    ) : (
                      <Avatar
                        alt="User profile"
                        src={image.photo}
                        width={100}
                        height={100}
                        className="w-16 h-16"
                      />
                    )
                  ) : load ? (
                    <CircularProgress
                      style={{ color: "#683ab7" }}
                      size={70}
                      aria-label="Loading user profile image"
                    >
                      <Avatar className="w-16 h-16">
                        {session?.user?.email.slice()[0].toUpperCase()}
                      </Avatar>
                    </CircularProgress>
                  ) : (
                    <Avatar className="w-16 h-16">
                      {session?.user?.email.slice()[0].toUpperCase()}
                    </Avatar>
                  )}
                </div>
                <div style={{ padding: "0.5vw" }}>
                  <h4 className="text-center ">
                    {isEditMode ? (
                      <Input
                        autoFocus
                        value={data.name}
                        onChange={(e) =>
                          handleFieldChange("name", e.target.value)
                        }
                        onBlur={(e) => {
                          if (
                            e.relatedTarget &&
                            e.relatedTarget.id === "phone"
                          ) {
                            return
                          }
                          if (
                            !data.name ||
                            data.name.trim() === "" ||
                            !data.phone ||
                            data.phone.trim() === ""
                          ) {
                            setSnackbarOpen(true)
                            setIsEditMode(true)
                            return
                          }
                          handleUpdateDetails()
                          setIsEditMode(false)
                        }}
                        style={{ width: "100px" }}
                      />
                    ) : (
                      <span>
                        {data.name &&
                        typeof data.name === "string" &&
                        data.name.length > 30
                          ? `${data.name.substring(0, 20)}...`
                          : data.name}
                      </span>
                    )}
                  </h4>
                </div>
                <h5
                  variant="subtitle2"
                  className="text-center"
                  sx={{
                    fontSize: "0.9rem",
                    color: "#683ab7",
                  }}
                >
                  <span>{data.role}</span>
                </h5>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "auto",
                  }}
                >
                  <button
                    type="button"
                    aria-label="edit profile"
                    className="block mx-auto mt-4 text-center dark:text-text"
                    onClick={(e) => handleEditButtonClick(e)}
                  >
                    <FaEdit className="h-4 w-4 mx-auto text-[#683ab7]" />
                  </button>
                </div>
              </div>

              <div className="w-full lg:w-2/3 pl-8 pr-1 pt-8 pb-8 relative">
                <h4
                  variant="h6"
                  component="h2"
                  className="mb-4 border-b border-[#683ab7] text-lg font-semibold"
                >
                  Information
                </h4>
                <div className="flex flex-col lg:flex-row justify-between mb-3 mr-2">
                  <div>
                    <h5 variant="subtitle1" className="text-sm font-semibold">
                      Email
                    </h5>
                    <h6
                      variant="body1"
                      className="text-gray-600 dark:text-text mr-2"
                      sx={{
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        maxWidth: "150px",
                      }}
                    >
                      {data.email}
                    </h6>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold mr-2">Phone</h5>
                    {isEditMode ? (
                      <div className="relative flex items-center mr-2">
                        <Input
                          id="phone"
                          value={data.phone}
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsEditMode(true)
                          }}
                          onBlur={(e) => {
                            if (
                              e.relatedTarget &&
                              e.relatedTarget.id === "name"
                            ) {
                              return
                            }
                            if (
                              !data.name ||
                              data.name.trim() === "" ||
                              !data.phone ||
                              data.phone.trim() === ""
                            ) {
                              setSnackbarOpen(true)
                              setIsEditMode(true)
                              return
                            }
                            handleUpdateDetails()
                            setIsEditMode(false)
                          }}
                          onChange={(e) => {
                            if (e.target.value.length < 15)
                              handleFieldChange("phone", e.target.value)
                          }}
                          placeholder="Enter phone"
                          style={{
                            fontSize: "0.9rem",
                            paddingRight: "1rem",
                          }}
                          className="text-base dark:text-text dark:border-white  justify-center text-center w-full max-w-140 relative flex items-center"
                        />
                        <div
                          style={{
                            position: "absolute",
                            right: "0.5rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                        >
                          {data.phone &&
                          /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
                            data.phone,
                          ) ? (
                            <MdCheckCircleOutline
                              style={{
                                color: "green",
                                fontSize: "1rem",
                              }}
                            />
                          ) : (
                            <MdHighlightOff
                              style={{
                                color: "red",
                                fontSize: "1rem",
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <h6>{data.phone}</h6>
                    )}
                    {!data.phone ||
                      (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
                        data.phone,
                      ) && (
                        <h6 className="text-red-500 text-xs ml-2">
                          Invalid phone
                        </h6>
                      ))}
                  </div>
                </div>
                <div
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    paddingBottom: "5%",
                  }}
                >
                  <h5
                    variant="subtitle1"
                    className="text-sm font-semibold pr-3"
                  >
                    Password
                  </h5>
                  {isPasswordEditMode ? (
                    <Input
                      type="password"
                      placeholder="Enter New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onBlur={handleUpdatePassword}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.target.blur()
                        }
                      }}
                      className="text-xs md:text-sm  border-black dark:border-white dark:text-text pl-0 pb-0 justify-center text-center w-full max-w-140 "
                    />
                  ) : (
                    <>
                      <h6
                        variant="body1"
                        className="text-gray-600 inline-block"
                        sx={{
                          marginLeft: "0.5rem",
                        }}
                      >
                        {currentPassword}
                      </h6>

                      <span
                        className="inline-block"
                        style={{ marginLeft: "10px" }}
                        onClick={() => handlePasswordEditButtonClick(true)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handlePasswordEditButtonClick(true)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <FaEdit className="text-[#683ab7]" />
                      </span>
                    </>
                  )}
                </div>
                {isPasswordEditMode && passwordError && (
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                      paddingBottom: "10px",
                    }}
                  >
                    {passwordError && (
                      <div
                        className=" text-red-500  rounded flex justify-between mt-1"
                        role="alert"
                      >
                        <span className="text-xs">{passwordError}</span>
                      </div>
                    )}
                  </div>
                )}

                <h6
                  variant="h6"
                  component="h2"
                  className="mb-4 border-b border-[#683ab7] text-lg font-semibold"
                >
                  Boards
                </h6>
                <div
                  className="flex flex-wrap no-scrollbar"
                  style={{
                    maxHeight: "200px",
                    minHeight: "110px",
                    overflowY: "scroll",
                    width: "100%",
                  }}
                >
                  {Array.isArray(label) &&
                    label.map((singleLabel, index) => (
                      <Chip
                        key={index}
                        className="m-1"
                        color="secondary"
                        style={{
                          borderRadius: "20px",
                          padding: "5px 10px",
                          fontSize: "14px",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          cursor: "pointer",
                        }}
                      >
                        {singleLabel.length > 15
                          ? `${singleLabel.substring(0, 20)}...`
                          : singleLabel}
                      </Chip>
                    ))}
                </div>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
      {snackbarOpen && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  text-black p-2 rounded-md shadow-lg">
          <p>Name/phone is not valid.</p>
        </div>
      )}
    </>
  )
}

ProfileModal.propTypes = {
  handleCloseModal: PropTypes.func.isRequired,
}
