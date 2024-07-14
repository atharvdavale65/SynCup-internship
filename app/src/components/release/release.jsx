import React, { useEffect, useState } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Progress,
  Chip,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
  DateRangePicker,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
} from "@nextui-org/react"
import dayjs from "dayjs"
import { parseDate } from "@internationalized/date"
import toast from "react-hot-toast"
import { IoIosSearch } from "react-icons/io"
import { MdOutlineKeyboardArrowRight } from "react-icons/md"
import { useParams, useRouter } from "next/navigation"
import DonePage from "./DonePage"
import { createVersion, versionData } from "@/server/version"

export default function ReleasesUI() {
  const [description, setDescription] = useState("")
  const [versionName, setVersionName] = useState("")
  const router = useRouter()
  const { organization } = useParams()
  const minDate = dayjs(new Date()).format("YYYY-MM-DD")
  const [startDate, setStartDate] = useState(minDate)
  const [endDate, setEndDate] = useState(minDate)
  const [allVersions, setAllVersions] = useState([])
  const [isVersionCreated, setIsVersionCreated] = useState(false)
  const [filterStatus, setFilterStatus] = useState(null)
  const [selectedKeys, setSelectedKeys] = useState(new Set(["text"]))
  const [searchInput, setSearchInput] = useState("")
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [isPopover, setIsPopover] = useState(false)
  const [page, setPage] = useState(1)
  const rowsPerPage = 5

  const handleVersionClick = (versionId) => {
    router.push(`/${organization}/releases/${versionId}`)
  }

  const handleStatusFilter = (status) => {
    setFilterStatus(status)
  }

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value)
  }

  const versionHandler = async () => {
    const unreleasedVersion = allVersions.find(
      (versionStatus) => versionStatus.status === "UNRELEASED",
    )
    if (!unreleasedVersion) {
      await createVersion(versionName, description, startDate, endDate)
      setIsVersionCreated(true)
    } else {
      toast.error("An unreleased version already exists.")
    }
  }

  const handleDateChange = (dateRange) => {
    setStartDate(dateRange.start.toString())
    setEndDate(dateRange.end.toString())
  }

  useEffect(() => {
    const fetchVersionData = async () => {
      const versionDataResult = await versionData()
      setAllVersions(versionDataResult)
    }
    fetchVersionData()
    setIsVersionCreated(false)
  }, [isVersionCreated])

  const startIndex = (page - 1) * rowsPerPage
  const endIndex = page * rowsPerPage
  const paginatedallVersions = allVersions.slice(startIndex, endIndex)
  const totalPages = Math.ceil(allVersions.length / rowsPerPage)

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber)
  }

  return (
    <>
      <div className="flex">
        <div className="searchbar w-1/2 flex h-9 flex-col gap-2 max-w-[450px]">
          <Input
            placeholder="Type Search here..."
            className="h-12 ml-4 mt-5 rounded-xl dark:bg-background dark:text"
            startContent={
              <IoIosSearch
                size={20}
                className="text-black/50 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0"
              />
            }
            value={searchInput}
            onChange={handleSearchInputChange}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <div className="flex">
          <div className="ml-6 mt-4 mr-2 mb-1">
            <Dropdown
              aria-label="My Dropdown"
              shouldBlockScroll={false}
              className="dark:bg"
            >
              <DropdownTrigger>
                <Button variant="light" className="font-medium text-sm">
                  All Statuses
                  <MdOutlineKeyboardArrowRight size={20} color="#555" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Action event example"
                selectionMode="single"
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
              >
                <DropdownItem
                  key="Released"
                  className="px-2 py-1"
                  onClick={() => handleStatusFilter("Released")}
                >
                  Released
                </DropdownItem>
                <DropdownItem
                  key="Unreleased"
                  className="px-2 py-1"
                  onClick={() => handleStatusFilter("Unreleased")}
                >
                  Unreleased
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <Popover
            showArrow
            offset={10}
            placement="bottom"
            isOpen={isPopover}
            onOpenChange={setIsPopover}
          >
            <PopoverTrigger>
              <Button
                color="secondary"
                variant="bordered"
                style={{ marginTop: "20px" }}
                className="mr-5"
                size="sm"
              >
                Create version
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Input
                    id="version-input"
                    placeholder="Enter the version name"
                    onChange={(e) => setVersionName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-col">
                  <DateRangePicker
                    id="date-range-picker"
                    label="Release date range"
                    onChange={handleDateChange}
                    defaultValue={{
                      start: parseDate(minDate),
                      end: parseDate(minDate),
                    }}
                    minValue={parseDate(minDate)}
                    validationBehavior="native"
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-col">
                  <Textarea
                    id="description-input"
                    placeholder="Enter the description"
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={() => {
                    versionHandler()
                    setIsPopover(false)
                  }}
                  className="block mx-auto text-[#fefefe] bg-[#683ab7] dark:bg-700 dark:text-black "
                >
                  Publish
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div style={{ width: "97%" }} className="mt-4 mr-5">
          <Table isStriped aria-label="Example static collection table">
            <TableHeader>
              <TableColumn style={{ width: "12%" }}>Version</TableColumn>
              <TableColumn style={{ width: "12%" }}>Status</TableColumn>
              <TableColumn style={{ width: "25%" }}>Progress</TableColumn>
              <TableColumn style={{ width: "12%" }}>Start date</TableColumn>
              <TableColumn style={{ width: "12%" }}>Release date</TableColumn>
              <TableColumn style={{ width: "12%" }}>Description</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedallVersions && paginatedallVersions.length > 0 ? (
                paginatedallVersions
                  .filter((version) => {
                    if (!filterStatus) return true
                    return version.status === filterStatus.toUpperCase()
                  })
                  .filter((version) => {
                    if (!searchInput) return true
                    return version.name
                      .toLowerCase()
                      .includes(searchInput.toLowerCase())
                  })
                  .map((currentVersion) => (
                    <TableRow key={currentVersion.id}>
                      <TableCell
                        style={{ color: "blue", cursor: "pointer" }}
                        onClick={() => handleVersionClick(currentVersion.id)}
                      >
                        {currentVersion.name}
                      </TableCell>
                      <TableCell>
                        <Chip
                          radius="sm"
                          variant="flat"
                          size="sm"
                          color={
                            currentVersion.status === "RELEASED"
                              ? "success"
                              : "danger"
                          }
                        >
                          {currentVersion.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Progress
                          aria-label="Loading..."
                          value={60}
                          className="max-w-md"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(currentVersion.startDate).toLocaleDateString(
                          undefined,
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(
                          currentVersion.releaseDate,
                        ).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{currentVersion.description}</TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No version is available. Please create a new version.
                  </TableCell>
                  <TableCell className="hidden" />
                  <TableCell className="hidden" />
                  <TableCell className="hidden" />
                  <TableCell className="hidden" />
                  <TableCell className="hidden" />
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages >= 1 && (
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
          )}
        </div>
      </div>
      {selectedVersion && (
        <DonePage
          version={selectedVersion}
          onClose={() => setSelectedVersion(null)}
        />
      )}
    </>
  )
}
