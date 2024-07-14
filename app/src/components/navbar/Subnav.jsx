"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Checkbox,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Button,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react"
import {
  MdIncompleteCircle,
  MdOutlineKeyboardArrowRight,
  MdLabelOutline,
} from "react-icons/md"
import { FaFlag } from "react-icons/fa"
import {
  IoCheckmarkDoneCircleOutline,
  IoFilterOutline,
  IoCloseOutline,
  IoShareSocial,
} from "react-icons/io5"
import { CiUser } from "react-icons/ci"
import { GoClock } from "react-icons/go"
import { useSession } from "next-auth/react"
import { IoIosSearch, IoMdFlash } from "react-icons/io"

import { useParams, usePathname, useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
  EmailShareButton,
  EmailIcon,
  FacebookShareButton,
  FacebookIcon,
  TelegramShareButton,
  TelegramIcon,
  TwitterShareButton,
  TwitterIcon,
} from "next-share"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"
import { unreleasedCards } from "@/server/task"
import { releaseVersion, unreleaseVersion } from "@/server/version"

export default function Subnav() {
  const [isSmallViewport, setIsSmallViewport] = useState(false)
  const [selectedMember, setSelectedMember] = useState("")
  const {
    data,
    assignedUserNames,
    cardState,
    setCardState,
    setSearchState,
    filterState,
    setFilterState,
    setTableView,
    labels,
    setLabels,
    boardData,
  } = useGlobalSyncupContext()
  const pathname = usePathname()
  const org = useParams()
  const projectPages = ["/projectsetting", "/board"]
  const isInProjectPages = projectPages.includes(pathname)
  const homeserachBar =
    pathname.includes("/home") ||
    pathname.includes(`${org.organization}/board/${org.id}`)
  const router = useRouter()
  const [boardid, setboardid] = useState()
  useEffect(() => {
    if (boardData.length !== 0) {
      const firstBoard = boardData[0]
      const boardIdToUse = org.id !== undefined ? org.id : firstBoard.id
      setboardid(boardIdToUse)
    }
  }, [boardData])
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]))
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMemberKeys, setSelectMemberKeys] = React.useState(new Set([]))
  const [value, setValue] = React.useState(new Set([]))
  const popoverRef = useRef(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalOpen1, setModalOpen] = useState(false)
  const [releaseCards, setReleaseCards] = useState([])
  const [versionToRelease, setVersionToRelease] = useState([])
  const filterOptions = [
    "Keywords",
    "Members",
    "Cards assigned to Me",
    "DueDate",
    "Overdue",
    "Due to Next Day",
    "Due to Next Week",
    "Due to Next Month",
    "Marked as Completed",
    "Marked as Incompleted",
    "Labels",
    "selectmembers",
    "selectlabels",
    "priority",
  ]
  const [filteredOptions, setFilteredOptions] = useState(filterOptions)
  const priorities = [
    { value: "highest", label: "Highest", color: "red" },
    { value: "high", label: "High", color: "rgba(255, 0, 0, 0.5)" },
    { value: "medium", label: "Medium", color: "rgb(252, 220, 42)" },
    { value: "low", label: "Low", color: "rgba(0, 128, 0, 0.5)" },
    { value: "lowest", label: "Lowest", color: "green" },
  ]
  useEffect(() => {
    const uniqueLabels = new Set()

    Array.from(
      data
        .flatMap((column) =>
          column.cards.flatMap((card) =>
            card.label.map((label) => ({
              name: label.name,
              color: label.color,
            })),
          ),
        )
        .filter((label) => {
          const labelKey = `${label.name}-${label.color}`
          if (uniqueLabels.has(labelKey)) {
            return false
          }
          uniqueLabels.add(labelKey)
          return true
        })
        .sort(),
    )

    setLabels(labels)
  }, [])

  useEffect(() => {
    function handleResize() {
      setIsSmallViewport(window.innerWidth <= 617)
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleClickOutside = (event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  const handleKeyDown = (event) => {
    event.stopPropagation()
  }

  const handleTableViewClick = () => {
    setTableView((prevSelected) => !prevSelected)
  }

  const { data: session } = useSession()

  const handleSearchChange = (event) => {
    const searchQuery = event.target.value.toLowerCase()
    setSelectedMember("")

    const filteredOpts = filterOptions.filter((option) =>
      option.toLowerCase().includes(searchQuery),
    )
    setFilteredOptions(filteredOpts)
    setCardState(event.target.value)
  }

  const [searchResults, setSearchResults] = useState([])

  const onInputChange = (input) => {
    const trimmedTerm = input.trim().toLowerCase()
    const filteredResults = data
      .filter((item) => {
        const filteredCards = item.cards.filter((card) =>
          card.name.toLowerCase().includes(trimmedTerm),
        )
        return filteredCards.length > 0
      })
      .map((item) => ({
        ...item,
        cards: item.cards.filter((card) =>
          card.name.toLowerCase().includes(trimmedTerm),
        ),
      }))

    setSearchResults(filteredResults)
  }

  const handleSearchInputChange = (event) => {
    const newvalue = event?.target?.value || event
    if (newvalue.trim() === "") {
      setSearchResults([])
    } else {
      onInputChange(newvalue)
    }
  }

  const handleInputChange = (event) => {
    setSearchState(event.target.value)
  }
  const handleFilterChange = (event, userName) => {
    const { name, checked } = event.target
    if (name === "slabel") {
      if (checked) {
        const selectedLabels = labels.filter((item) =>
          selectedKeys.has(item.name),
        )
        setFilterState((prevFilters) => ({
          ...prevFilters,
          specificLabel:
            selectedLabels.length > 0 ? selectedLabels[0].name : "",
        }))
      } else {
        setFilterState((prevFilters) => ({
          ...prevFilters,
          specificLabel: "",
        }))
      }
    } else if (name === "isMarkedAsCompleted") {
      setFilterState((prevFilters) => ({
        ...prevFilters,
        isMarkedAsCompleted: checked,
      }))
    } else if (name === "isMarkedAsInCompleted") {
      setFilterState((prevFilters) => ({
        ...prevFilters,
        isMarkedAsInCompleted: checked,
      }))
    } else if (name === "smember") {
      setFilterState((prevFilters) => ({
        ...prevFilters,
        specificMember: checked ? userName : "",
      }))
    } else {
      setFilterState((prevFilters) => ({
        ...prevFilters,
        [name]: checked,
      }))
    }
    if (checked) {
      setCardState(null)
    } else {
      setFilteredOptions(filterOptions)
    }
  }
  const handleCheckboxChange = (event, userName) => {
    setSelectedMember(userName)
    handleFilterChange(event, userName)
  }
  const selectedValuee = React.useMemo(() => {
    const selectedLabels = labels.filter((item) => selectedKeys.has(item.name))
    return selectedLabels.map((label) => ({
      name: label.name,
      color: label.color,
    }))
  }, [selectedKeys, labels])
  const selectedMemberValuee = React.useMemo(() => {
    const selectMembers = assignedUserNames.filter((item) =>
      selectedMemberKeys.has(item.name),
    )
    return selectMembers.map((assignedUser) => ({
      name: assignedUser.name,
    }))
  }, [selectedMemberKeys, assignedUserNames])

  function handleLabelChange(labelKey) {
    const keysArray = Array.from(labelKey)
    setFilterState((prevFilters) => ({
      ...prevFilters,
      specificLabel: keysArray[0] !== "" ? keysArray[0] : "",
    }))
  }

  function handleMemberSpecificChange(MemberKeys) {
    const keysArray = Array.from(MemberKeys)
    setFilterState((prevFilters) => ({
      ...prevFilters,
      specificMember: keysArray[0] !== "" ? keysArray[0] : "",
    }))
  }
  const matchesFound = assignedUserNames.some(
    (user) =>
      user.name.toLowerCase().includes(cardState) ||
      user.name === selectedMember,
  )

  const handleButtonClick = () => {
    setIsOpen(!isOpen)
  }
  const handleClosefilter = () => {
    setIsOpen(false)
  }
  function handleSelectionChange(memberKeys) {
    const keysArray = Array.from(memberKeys)
    setValue(memberKeys)
    setFilterState((prevFilters) => ({
      ...prevFilters,
      priority: keysArray[0] !== "" ? keysArray[0] : "",
    }))
  }
  const board = useParams()
  const handleReleaseCheck = async () => {
    const firstBoard = boardData[0]
    const boardIdToUse =
      board.id !== undefined && board.id !== null ? board.id : firstBoard.id
    const id = await unreleasedCards(boardIdToUse)
    setReleaseCards(id)
    if (id.length === 0) {
      toast.error("You don't have cards to release.")
    } else {
      const released = await unreleaseVersion()
      setVersionToRelease(released)
      if (released) {
        setIsModalOpen(true)
      } else {
        toast.error("Please create version to release.")
      }
    }
  }
  const handleRelease = async () => {
    const released = await releaseVersion(releaseCards, versionToRelease.id)
    if (released) {
      toast.success("You have successfully released.")
    }
  }

  const handleReport = () => {
    router.push(`/${org.organization}/report`)
  }

  const handleReleasePage = () => {
    router.push(`/${org.organization}/releases`)
  }

  const handleOpenModal = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  return (
    <div className="flex flex-col mr-6">
      <div className="flex mb-4 mt-3 dark:bg">
        <div>
          <Dropdown
            aria-label="My Dropdown"
            shouldBlockScroll={false}
            className="dark:bg"
          >
            <DropdownTrigger>
              <Button variant="light" className="font-meduim text-xl">
                Board
                <MdOutlineKeyboardArrowRight size={100} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Action event example">
              <DropdownItem key="Table View" onClick={handleTableViewClick}>
                Table View
              </DropdownItem>
              <DropdownItem key="Report" onClick={handleReport}>
                Report
              </DropdownItem>
              <DropdownItem key="Releases" onClick={handleReleasePage}>
                Releases
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="flex gap-4 items-center ml-auto">
          {!isInProjectPages && (
            <Button
              className=" text-[#fefefe] bg-[#683ab7] dark:bg-700 dark:text-black"
              onClick={handleReleaseCheck}
            >
              <IoMdFlash size={25} />
              {!isSmallViewport && "Release"}
            </Button>
          )}
          {!isInProjectPages && (
            <Button
              className=" text-[#fefefe] bg-[#683ab7] dark:bg-700 dark:text-black"
              onPress={handleOpenModal}
            >
              <IoShareSocial size={25} />
              {!isSmallViewport && "Share"}
            </Button>
          )}
          <Modal
            isOpen={isModalOpen1}
            onOpenChange={handleCloseModal}
            isDismissable
            isKeyboardDismissDisabled={false}
          >
            <ModalContent>
              <>
                <ModalHeader className="text-[#7754bd]">
                  Share PTasks
                </ModalHeader>
                <div className="px-4 py-2 ml-2">
                  <p>Share using the buttons below.</p>
                </div>
                <ModalBody className="flex flex-row gap-4 items-center">
                  <WhatsappShareButton
                    url="https://ptasks.positsource.com/auth/login"
                    title="next-share is a social share buttons for your next React apps."
                    separator=":: "
                  >
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>
                  <LinkedinShareButton url="https://ptasks.positsource.com/auth/login">
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>
                  <EmailShareButton
                    url="https://ptasks.positsource.com/auth/login"
                    subject="Next Share"
                    body="body"
                  >
                    <EmailIcon size={32} round />
                  </EmailShareButton>
                  <FacebookShareButton
                    url="https://ptasks.positsource.com/auth/login"
                    quote="next-share is a social share buttons for your next React apps."
                    hashtag="#nextshare"
                  >
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>
                  <TelegramShareButton
                    url="https://ptasks.positsource.com/auth/login"
                    title="next-share is a social share buttons for your next React apps."
                  >
                    <TelegramIcon size={32} round />
                  </TelegramShareButton>
                  <TwitterShareButton
                    url="https://ptasks.positsource.com/auth/login"
                    title="next-share is a social share buttons for your next React apps."
                  >
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>
                </ModalBody>
                <ModalFooter />
              </>
            </ModalContent>
          </Modal>
        </div>
        {isModalOpen && (
          <Modal isOpen={isModalOpen}>
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">
                Release Confirmation
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to release{" "}
                  <b>{versionToRelease.name}</b> version?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="secondary"
                  variant="light"
                  onClick={() => {
                    setIsModalOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onClick={() => {
                    handleRelease()
                    setIsModalOpen(false)
                  }}
                >
                  Release
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </div>

      <div className="flex ">
        <div className="serachbar w-1/2 flex h-9 flex-col gap-2 max-w-[450px]">
          {homeserachBar ? (
            <Autocomplete
              placeholder="Type Search here..."
              className="h-12 ml-4 rounded-xl dark:bg-background dark:text"
              onInputChange={handleSearchInputChange}
              showScrollIndicators={false}
              onSelectionChange={(selectedKey) => {
                if (selectedKey !== null) {
                  router.push(
                    `/${org.organization}/board/${boardid}/${selectedKey}`,
                  )
                }
              }}
              startContent={
                <IoIosSearch
                  size={20}
                  className="text-black/50 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0"
                />
              }
            >
              {searchResults.length > 0 ? (
                searchResults.map((item) =>
                  item.cards.map((card) => (
                    <AutocompleteItem key={card.id}>
                      {card.name}
                    </AutocompleteItem>
                  )),
                )
              ) : (
                <AutocompleteItem>No results found</AutocompleteItem>
              )}
            </Autocomplete>
          ) : (
            <Input
              placeholder="Type Search here..."
              className="h-12 ml-4 rounded-xl dark:bg-background dark:text"
              value={cardState}
              onChange={handleInputChange}
              startContent={
                <IoIosSearch
                  size={20}
                  className="text-black/50 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0"
                />
              }
            />
          )}
        </div>

        <div className="align-content: center; ml-auto ">
          {!isSmallViewport && !isInProjectPages && (
            <>
              <div className="mr-0">
                <Button
                  color="secondary"
                  sx={{
                    display: "flex",
                    borderRadius: "8px",
                    p: 1,
                    backgroundColor: "#ede7f6",
                    font: "bold",
                  }}
                  className="dark:bg-700 dark:text-black"
                  onClick={handleButtonClick}
                  variant="light"
                >
                  <IoFilterOutline size={20} />
                  Filter
                </Button>
              </div>
              {isOpen && (
                <div
                  ref={popoverRef}
                  className="absolute z-50 inline-block  w-full max-w-md text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-100 dark:text-gray-400 dark:border-gray-600  dark:bg"
                  style={{ marginLeft: "-331px", overflowY: "auto" }}
                >
                  <div className=" flex px-3 py-2  rounded-t-lg  mt-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Filter
                    </h3>
                    <section className="flex-grow flex justify-end mt-[-12px]">
                      <Button
                        isIconOnly
                        variant="light"
                        onClick={handleClosefilter}
                      >
                        <IoCloseOutline size={23} />
                      </Button>
                    </section>
                  </div>
                  <div className="popover-scroll-container max-h-[62vh] lg:max-h-[62vh] md:max-h-[50vh] sm:max-h-[47vh] xs:max-h-[38vh] overflow-y-auto no-scrollbar">
                    <div className="px-3 py-2">
                      <div className="mb-4">
                        <div className="flex flex-col gap-1">
                          <span>Keywords</span>
                          <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                            <Input
                              size="lg"
                              placeholder="Enter the keywords.."
                              onKeyDown={handleKeyDown}
                              onChange={handleSearchChange}
                              value={cardState}
                            />
                          </div>
                          <div className="mt-1">
                            <small className="text-gray-500">
                              Search Cards, Members, Labels...
                            </small>
                          </div>
                        </div>
                      </div>
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "priority") {
                          return (
                            <div key={index} style={{ marginBottom: "10px" }}>
                              <span>Priority</span>
                              <Select
                                aria-label="My Select"
                                placeholder="Select an priority"
                                className="max-w"
                                size="md"
                                selectedKeys={value}
                                onSelectionChange={(newSelection) =>
                                  handleSelectionChange(newSelection)
                                }
                              >
                                {priorities.map((priority) => (
                                  <SelectItem
                                    startContent={
                                      <FaFlag
                                        color={priority.color}
                                        className="w-4 h-4 mr-2"
                                      />
                                    }
                                    key={priority.value}
                                    value={priority.value}
                                  >
                                    {priority.label}
                                  </SelectItem>
                                ))}
                              </Select>
                            </div>
                          )
                        }
                        return null
                      })}{" "}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "members") {
                          return (
                            <div key={index} className="mb-4">
                              <div className="flex flex-col gap-1">
                                <span className="mb-2 ">Members</span>
                                <Checkbox
                                  color="secondary"
                                  checked={filterState.member}
                                  value={filterState.member}
                                  isSelected={filterState.member}
                                  onChange={handleFilterChange}
                                  name="member"
                                >
                                  <div className="flex items-center">
                                    <CiUser size={20} />
                                    <span className="ml-2">Member</span>
                                  </div>
                                </Checkbox>
                              </div>
                            </div>
                          )
                        }
                        return null
                      })}{" "}
                      {cardState || selectedMember ? (
                        <div className="flex flex-col gap-1">
                          {matchesFound && (
                            <span className="mb-2">Members</span>
                          )}
                          {assignedUserNames.length === 0 ? (
                            <div />
                          ) : (
                            assignedUserNames.map(
                              (user) =>
                                (user.name.toLowerCase().includes(cardState) ||
                                  user.name === selectedMember) && (
                                  <Checkbox
                                    color="secondary"
                                    key={user.name}
                                    checked={
                                      filterState.specificMember === user.name
                                    }
                                    isSelected={
                                      filterState.specificMember === user.name
                                    }
                                    onChange={(event) =>
                                      handleCheckboxChange(event, user.name)
                                    }
                                    name="smember"
                                    style={{ marginBottom: "4px" }}
                                  >
                                    {user.name}
                                  </Checkbox>
                                ),
                            )
                          )}
                        </div>
                      ) : null}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "cards assigned to me") {
                          return (
                            <div key={index} className="mb-4">
                              <Checkbox
                                color="secondary"
                                checked={filterState.assignedToMe}
                                isSelected={filterState.assignedToMe}
                                onChange={handleFilterChange}
                                name="assignedToMe"
                              >
                                <div className="flex items-center">
                                  <div
                                    className="w-5 h-5 mr-2 rounded-full border border-gray-700"
                                    style={{
                                      backgroundColor: "#DB862B",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {session?.user?.name
                                      .slice(0, 1)
                                      .toUpperCase()}{" "}
                                  </div>
                                  Cards Assigned to me
                                </div>
                              </Checkbox>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (
                          option.toLowerCase() === "selectmembers" &&
                          !cardState
                        ) {
                          return (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Dropdown
                                aria-label="My Dropdown"
                                className="w-full"
                              >
                                <DropdownTrigger>
                                  <Button className="w-full">
                                    {selectedMemberValuee.length > 0
                                      ? selectedMemberValuee[0].name
                                      : "Select a Member"}
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  className="w-96 max-h-[173px] overflow-y-auto no-scrollbar"
                                  aria-label="Multiple selection example"
                                  variant="flat"
                                  selectionMode="single"
                                  selectedKeys={selectedMemberKeys}
                                  onSelectionChange={(member) => {
                                    setSelectMemberKeys(member)
                                    handleMemberSpecificChange(member)
                                  }}
                                >
                                  {assignedUserNames.map((item) => (
                                    <DropdownItem
                                      className="w-full"
                                      key={item.name}
                                      value={item.name}
                                    >
                                      {item.name}
                                    </DropdownItem>
                                  ))}
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "overdue") {
                          return (
                            <div key={index} className="mb-4">
                              <div className="flex flex-col gap-1">
                                <span className="mb-2 ">DueDate</span>
                                <Checkbox
                                  color="secondary"
                                  checked={filterState.overdue}
                                  onChange={handleFilterChange}
                                  isSelected={filterState.overdue}
                                  name="overdue"
                                >
                                  <div className="flex items-center">
                                    <GoClock
                                      size={20}
                                      color="white"
                                      style={{
                                        backgroundColor: "#9e2714",
                                        borderRadius: "50%",
                                      }}
                                    />

                                    <span className="ml-2">Overdue</span>
                                  </div>
                                </Checkbox>
                              </div>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "due to next day") {
                          return (
                            <div key={index} className="mb-4">
                              <Checkbox
                                color="secondary"
                                checked={filterState.dueNextDay}
                                onChange={handleFilterChange}
                                isSelected={filterState.dueNextDay}
                                name="dueNextDay"
                              >
                                <div className="flex items-center">
                                  <GoClock
                                    size={20}
                                    color="white"
                                    style={{
                                      backgroundColor: "#f0d87a",
                                      borderRadius: "50%",
                                    }}
                                  />

                                  <span className="ml-2">Due to Next Day</span>
                                </div>
                              </Checkbox>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "due to next week") {
                          return (
                            <div key={index} className="mb-4">
                              <Checkbox
                                color="secondary"
                                checked={filterState.dueNextWeek}
                                onChange={handleFilterChange}
                                isSelected={filterState.dueNextWeek}
                                name="dueNextWeek"
                              >
                                <div className="flex items-center">
                                  <GoClock
                                    size={20}
                                    color="black"
                                    style={{
                                      backgroundColor: "#e8e8e8",
                                      borderRadius: "50%",
                                    }}
                                  />

                                  <span className="ml-2">Due to Next Week</span>
                                </div>
                              </Checkbox>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "due to next month") {
                          return (
                            <div key={index} className="mb-4">
                              <Checkbox
                                color="secondary"
                                checked={filterState.dueNextMonth}
                                isSelected={filterState.dueNextMonth}
                                onChange={handleFilterChange}
                                name="dueNextMonth"
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <GoClock
                                    size={20}
                                    color="black"
                                    style={{
                                      backgroundColor: "#e8e8e8",
                                      borderRadius: "50%",
                                    }}
                                  />
                                  <span style={{ marginLeft: "8px" }}>
                                    Due to Next Month
                                  </span>
                                </div>
                              </Checkbox>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "marked as completed") {
                          return (
                            <div key={index} className="mb-4">
                              <Checkbox
                                color="secondary"
                                checked={filterState.isMarkedAsCompleted}
                                isSelected={filterState.isMarkedAsCompleted}
                                onChange={handleFilterChange}
                                name="isMarkedAsCompleted"
                              >
                                <div className="flex items-center">
                                  <IoCheckmarkDoneCircleOutline size={23} />
                                  <span className="ml-2">
                                    {" "}
                                    Marked as Completed
                                  </span>
                                </div>
                              </Checkbox>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "marked as incompleted") {
                          return (
                            <div key={index} className="mb-4">
                              <Checkbox
                                color="secondary"
                                checked={filterState.isMarkedAsInCompleted}
                                isSelected={filterState.isMarkedAsInCompleted}
                                onChange={handleFilterChange}
                                name="isMarkedAsInCompleted"
                              >
                                <div className="flex items-center">
                                  <MdIncompleteCircle
                                    size={20}
                                    color="#e8e8e8"
                                  />
                                  <span className="ml-2">
                                    {" "}
                                    Marked as Incompleted
                                  </span>
                                </div>
                              </Checkbox>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "labels") {
                          return (
                            <div key={index} className="mb-4">
                              <div className="flex flex-col gap-1">
                                <span className="mb-2 ">Labels</span>
                                <Checkbox
                                  color="secondary"
                                  checked={filterState.label}
                                  isSelected={filterState.label}
                                  onChange={handleFilterChange}
                                  name="label"
                                >
                                  {" "}
                                  <div className="flex items-center ">
                                    <MdLabelOutline size={20} />
                                    <span className="ml-2">Label</span>
                                  </div>
                                </Checkbox>
                              </div>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "selectlabels") {
                          return (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Dropdown aria-label="My Dropdown">
                                <DropdownTrigger>
                                  <Button
                                    variant="flat"
                                    className=" w-full"
                                    style={{
                                      backgroundColor:
                                        selectedValuee.length > 0
                                          ? selectedValuee[0].color
                                          : "",
                                    }}
                                  >
                                    {selectedValuee.length > 0
                                      ? selectedValuee[0].name
                                      : "Select a Label"}
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  className="w-96 max-h-[173px] overflow-y-auto no-scrollbar"
                                  aria-label="Multiple selection example"
                                  closeOnSelect={false}
                                  selectionMode="single"
                                  selectedKeys={selectedKeys}
                                  onSelectionChange={(Keys) => {
                                    setSelectedKeys(Keys)
                                    handleLabelChange(Keys)
                                  }}
                                >
                                  {labels.map((item) => (
                                    <DropdownItem
                                      className="w-full"
                                      key={item.name}
                                      style={{
                                        backgroundColor: item.color,
                                        outline: "none",
                                      }}
                                      value={item.name}
                                    >
                                      {item.name}
                                    </DropdownItem>
                                  ))}
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {isSmallViewport && !isInProjectPages && (
            <>
              <div className="mr-0">
                <Button
                  sx={{
                    display: "flex",
                    borderRadius: "8px",
                    p: 1,
                    backgroundColor: "#ede7f6",
                    font: "bold",
                  }}
                  onClick={handleButtonClick}
                  variant="light"
                >
                  <IoFilterOutline size={20} />
                </Button>
              </div>
              {isOpen && (
                <div
                  ref={popoverRef}
                  className="absolute z-50 inline-block  w-full max-w-md text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-100 dark:text-gray-400 dark:border-gray-600  dark:bg"
                  style={{ marginLeft: "-280px", overflowY: "auto" }}
                >
                  <div className=" flex px-3 py-2  rounded-t-lg  mt-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Filter
                    </h3>
                    <section className="flex-grow flex justify-end mt-[-12px]">
                      <Button
                        isIconOnly
                        variant="light"
                        onClick={handleClosefilter}
                      >
                        <IoCloseOutline size={23} />
                      </Button>
                    </section>
                  </div>
                  <div className="popover-scroll-container max-h-[62vh] overflow-y-auto">
                    <div className="px-3 py-2">
                      <div className="mb-4">
                        <div className="flex flex-col gap-1">
                          <span>Keywords</span>
                          <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                            <Input
                              size="lg"
                              placeholder="Enter the keywords.."
                              onKeyDown={handleKeyDown}
                              onChange={handleSearchChange}
                              value={cardState}
                            />
                          </div>
                          <div className="mt-1">
                            <small className="text-gray-500">
                              Search Cards, Members, Labels...
                            </small>
                          </div>
                        </div>
                      </div>
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "priority") {
                          return (
                            <div key={index} style={{ marginBottom: "10px" }}>
                              <span>Priority</span>
                              <Select
                                aria-label="My Select"
                                placeholder="Select an priority"
                                className="max-w"
                                size="md"
                                selectedKeys={value}
                                onSelectionChange={(newSelection) =>
                                  handleSelectionChange(newSelection)
                                }
                              >
                                {priorities.map((priority) => (
                                  <SelectItem
                                    startContent={
                                      <FaFlag
                                        color={priority.color}
                                        className="w-4 h-4 mr-2"
                                      />
                                    }
                                    key={priority.value}
                                    value={priority.value}
                                  >
                                    {priority.label}
                                  </SelectItem>
                                ))}
                              </Select>
                            </div>
                          )
                        }
                        return null
                      })}{" "}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "members") {
                          return (
                            <div key={index} className="mb-4">
                              <div className="flex flex-col gap-1">
                                <span className="mb-2 ">Members</span>
                                <Checkbox
                                  color="secondary"
                                  checked={filterState.member}
                                  value={filterState.member}
                                  isSelected={filterState.member}
                                  onChange={handleFilterChange}
                                  name="member"
                                >
                                  <div className="flex items-center">
                                    <CiUser size={20} />
                                    <span className="ml-2">Member</span>
                                  </div>
                                </Checkbox>
                              </div>
                            </div>
                          )
                        }
                        return null
                      })}{" "}
                      {cardState || selectedMember ? (
                        <div className="flex flex-col gap-1">
                          {matchesFound && (
                            <span className="mb-2">Members</span>
                          )}
                          {assignedUserNames.length === 0 ? (
                            <div />
                          ) : (
                            assignedUserNames.map(
                              (user) =>
                                (user.name.toLowerCase().includes(cardState) ||
                                  user.name === selectedMember) && (
                                  <Checkbox
                                    color="secondary"
                                    key={user.name}
                                    checked={
                                      filterState.specificMember === user.name
                                    }
                                    isSelected={
                                      filterState.specificMember === user.name
                                    }
                                    onChange={(event) =>
                                      handleCheckboxChange(event, user.name)
                                    }
                                    name="smember"
                                    style={{ marginBottom: "4px" }}
                                  >
                                    {user.name}
                                  </Checkbox>
                                ),
                            )
                          )}
                        </div>
                      ) : null}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "cards assigned to me") {
                          return (
                            <div key={index} className="mb-4">
                              <Checkbox
                                color="secondary"
                                checked={filterState.assignedToMe}
                                isSelected={filterState.assignedToMe}
                                onChange={handleFilterChange}
                                name="assignedToMe"
                              >
                                <div className="flex items-center">
                                  <div
                                    className="w-5 h-5 mr-2 rounded-full border border-gray-700"
                                    style={{
                                      backgroundColor: "#DB862B",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {session?.user?.name
                                      .slice(0, 1)
                                      .toUpperCase()}{" "}
                                  </div>
                                  Cards Assigned to me
                                </div>
                              </Checkbox>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (
                          option.toLowerCase() === "selectmembers" &&
                          !cardState
                        ) {
                          return (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Dropdown
                                aria-label="My Dropdown"
                                shouldBlockScroll={false}
                                className="w-full"
                              >
                                <DropdownTrigger>
                                  <Button
                                    style={{ backgroundColor: "#F7F7F7" }}
                                    className="w-full"
                                  >
                                    {selectedMemberValuee.length > 0
                                      ? selectedMemberValuee[0].name
                                      : "Select a Member"}
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  className="w-96 max-h-[173px] overflow-y-auto no-scrollbar"
                                  aria-label="Multiple selection example"
                                  variant="flat"
                                  closeOnSelect={false}
                                  selectionMode="single"
                                  selectedKeys={selectedMemberKeys}
                                  onSelectionChange={(selectedMembers) => {
                                    setSelectMemberKeys(selectedMembers)
                                    handleMemberSpecificChange(selectedMembers)
                                  }}
                                >
                                  {assignedUserNames.map((item) => (
                                    <DropdownItem
                                      className="w-full"
                                      key={item.name}
                                      value={item.name}
                                    >
                                      {item.name}
                                    </DropdownItem>
                                  ))}
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "overdue") {
                          return (
                            <div key={index} className="mb-4">
                              <div className="flex flex-col gap-1">
                                <span className="mb-2 ">DueDate</span>
                                <Checkbox
                                  color="secondary"
                                  checked={filterState.overdue}
                                  onChange={handleFilterChange}
                                  isSelected={filterState.overdue}
                                  name="overdue"
                                >
                                  <div className="flex items-center">
                                    <GoClock
                                      size={20}
                                      color="white"
                                      style={{
                                        backgroundColor: "#9e2714",
                                        borderRadius: "50%",
                                      }}
                                    />

                                    <span className="ml-2">Overdue</span>
                                  </div>
                                </Checkbox>
                              </div>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "due to next day") {
                          return (
                            <div key={index} className="mb-4">
                              <Checkbox
                                color="secondary"
                                checked={filterState.dueNextDay}
                                onChange={handleFilterChange}
                                isSelected={filterState.dueNextDay}
                                name="dueNextDay"
                              >
                                <div className="flex items-center">
                                  <GoClock
                                    size={20}
                                    color="white"
                                    style={{
                                      backgroundColor: "#f0d87a",
                                      borderRadius: "50%",
                                    }}
                                  />

                                  <span className="ml-2">Due to Next Day</span>
                                </div>
                              </Checkbox>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "due to next week") {
                          return (
                            <div key={index} className="mb-4">
                              <Checkbox
                                color="secondary"
                                checked={filterState.dueNextWeek}
                                onChange={handleFilterChange}
                                isSelected={filterState.dueNextWeek}
                                name="dueNextWeek"
                              >
                                <div className="flex items-center">
                                  <GoClock
                                    size={20}
                                    color="black"
                                    style={{
                                      backgroundColor: "#e8e8e8",
                                      borderRadius: "50%",
                                    }}
                                  />

                                  <span className="ml-2">Due to Next Week</span>
                                </div>
                              </Checkbox>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "due to next month") {
                          return (
                            <div key={index} className="mb-4">
                              <Checkbox
                                color="secondary"
                                checked={filterState.dueNextMonth}
                                isSelected={filterState.dueNextMonth}
                                onChange={handleFilterChange}
                                name="dueNextMonth"
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <GoClock
                                    size={20}
                                    color="black"
                                    style={{
                                      backgroundColor: "#e8e8e8",
                                      borderRadius: "50%",
                                    }}
                                  />

                                  <span style={{ marginLeft: "8px" }}>
                                    Due to Next Month
                                  </span>
                                </div>
                              </Checkbox>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "marked as completed") {
                          return (
                            <div key={index} className="mb-4">
                              <Checkbox
                                color="secondary"
                                checked={filterState.isMarkedAsCompleted}
                                isSelected={filterState.isMarkedAsCompleted}
                                onChange={handleFilterChange}
                                name="isMarkedAsCompleted"
                              >
                                <div className="flex items-center">
                                  <IoCheckmarkDoneCircleOutline size={23} />
                                  <span className="ml-2">
                                    {" "}
                                    Marked as Completed
                                  </span>
                                </div>
                              </Checkbox>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "marked as incompleted") {
                          return (
                            <div key={index} className="mb-4">
                              <Checkbox
                                color="secondary"
                                checked={filterState.isMarkedAsInCompleted}
                                isSelected={filterState.isMarkedAsInCompleted}
                                onChange={handleFilterChange}
                                name="isMarkedAsInCompleted"
                              >
                                <div className="flex items-center">
                                  <MdIncompleteCircle
                                    size={20}
                                    color="#e8e8e8"
                                  />
                                  <span className="ml-2">
                                    {" "}
                                    Marked as Incompleted
                                  </span>
                                </div>
                              </Checkbox>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "labels") {
                          return (
                            <div key={index} className="mb-4">
                              <div className="flex flex-col gap-1">
                                <span className="mb-2 ">Labels</span>
                                <Checkbox
                                  color="secondary"
                                  checked={filterState.label}
                                  isSelected={filterState.label}
                                  onChange={handleFilterChange}
                                  name="label"
                                >
                                  {" "}
                                  <div className="flex items-center ">
                                    <MdLabelOutline size={20} />
                                    <span className="ml-2">Label</span>
                                  </div>
                                </Checkbox>
                              </div>
                            </div>
                          )
                        }
                        return null
                      })}
                      {filteredOptions.map((option, index) => {
                        if (option.toLowerCase() === "selectlabels") {
                          return (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Dropdown aria-label="My Dropdown">
                                <DropdownTrigger>
                                  <Button
                                    className=" w-full"
                                    style={{
                                      backgroundColor:
                                        selectedValuee.length > 0
                                          ? selectedValuee[0].color
                                          : "",
                                    }}
                                  >
                                    {selectedValuee.length > 0
                                      ? selectedValuee[0].name
                                      : "Select a Label"}
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                  className="w-96 max-h-[173px] overflow-y-auto no-scrollbar"
                                  aria-label="Multiple selection example"
                                  variant="flat"
                                  selectionMode="single"
                                  selectedKeys={selectedKeys}
                                  onSelectionChange={(selectedKey) => {
                                    setSelectedKeys(selectedKey)
                                    handleLabelChange(selectedKey)
                                  }}
                                >
                                  {labels.map((item) => (
                                    <DropdownItem
                                      className="w-full"
                                      key={item.name}
                                      style={{
                                        backgroundColor: item.color,
                                        outline: "none",
                                      }}
                                      value={item.name}
                                    >
                                      {item.name}
                                    </DropdownItem>
                                  ))}
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
