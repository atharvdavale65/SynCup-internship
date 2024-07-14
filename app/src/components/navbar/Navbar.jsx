"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Navbar,
  NavbarContent,
  Button,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  User as NextUIUser,
  Badge,
  Select,
  SelectItem,
} from "@nextui-org/react"
import { BiRotateLeft } from "react-icons/bi"
import { FaQuestion } from "react-icons/fa6"
import { LuBell } from "react-icons/lu"
import { MdOutlineLogout } from "react-icons/md"
import { useSession, signOut } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"

import Link from "next/link"

import CreateOrganization from "../CreateOrganization"
import ThemeSwitcher from "../ThemeSwitcher"

import ProfileModal from "./ProfileModal"
import NotificationModal from "../notification/Notification"
import appConfig from "@/app.config"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"

export default function App() {
  const notificationIconRef = useRef()
  const orgname = useParams()
  const { data: session, status } = useSession()
  const [animationStarted, setAnimationStarted] = useState(false)
  const [openNotificationModal, setOpenNotificationModal] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orgOpenModal, setOrgOpenModal] = useState(false)
  const router = useRouter()
  const [isSmallScreen, setIsScreenSmall] = useState(false)
  const { notifications } = useGlobalSyncupContext()
  const { organizationname, userInfo } = useGlobalSyncupContext()

  useEffect(() => {
    setAnimationStarted(true)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsScreenSmall(window.innerWidth < 600)
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleOrgCloseModal = () => {
    setOrgOpenModal(false)
  }

  useEffect(() => {
    if (status !== "loading" && !session?.user?.email.length) {
      router.push("/auth/login")
    }
  }, [status])

  const handleOpenNotificationModal = () => {
    setOpenNotificationModal(true)
  }

  const handleCloseNotificationModal = () => {
    setOpenNotificationModal(false)
  }

  const handleMenuItemClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleLogout = async () => {
    await signOut()
  }
  const handleCardRowClick = (selectedorganization) => {
    const organizatioName = Array.from(selectedorganization)
    if (organizatioName.length === 0) {
      return
    }
    router.push(`/${organizatioName[0]}/board`)
  }

  const handleHelpSupport = () => {
    router.push(`/${orgname.organization}/helpsupport`)
  }
  return (
    <Navbar maxWidth="full">
      <div className="flex justify-between items-center">
        <Link
          href={`/${orgname.organization}/home`}
          className="flex justify-center items-center"
        >
          <BiRotateLeft
            style={{
              transform: animationStarted ? "rotate(0deg)" : "rotate(-60deg)",
              color: "#7754bd",
              fontSize: "2.5rem",
              transition: "transform 1s ease",
              marginRight: "8px",
            }}
          />
          <p className="mr-5 hidden md:flex font-sans font-medium text-2xl">
            {appConfig.PROJECT_NAME}
          </p>
        </Link>
      </div>

      <NavbarContent as="div" justify="end">
        <Select
          disallowEmptySelection
          placeholder="Select workspace"
          className="max-w-xs"
          aria-label="organization"
          size="sm"
          selectedKeys={[orgname.organization]}
          onSelectionChange={handleCardRowClick}
          color="secondary"
        >
          {organizationname.map((org) => (
            <SelectItem key={org.name} value={org.name} color="secondary">
              {org.name}
            </SelectItem>
          ))}
        </Select>
        <div className="flex gap-1 items-center">
          {!isSmallScreen && (
            <>
              <ThemeSwitcher />
              <Button
                isIconOnly
                className="text-[#7754bd] bg-[#ede7f6] hover:bg-[#683ab7] hover:text-white dark:bg-700 dark:text"
                size="md"
                onClick={handleHelpSupport}
                title="help&Support"
              >
                <FaQuestion className="text-xl" />
              </Button>
            </>
          )}
          {notifications > 0 ? (
            <Badge content={notifications} color="danger">
              <Button
                isIconOnly
                className="text-[#7754bd] bg-[#ede7f6] hover:bg-[#683ab7] hover:text-white dark:bg-700 dark:text"
                size="md"
                ref={notificationIconRef}
                onClick={handleOpenNotificationModal}
                title="Notification"
              >
                <LuBell className="text-xl" />
              </Button>
            </Badge>
          ) : (
            <Button
              isIconOnly
              className="text-[#7754bd] bg-[#ede7f6] hover:bg-[#683ab7] hover:text-white dark:bg-700 dark:text"
              size="md"
              ref={notificationIconRef}
              onClick={handleOpenNotificationModal}
            >
              <LuBell className="text-xl" />
            </Button>
          )}
        </div>
        {isSmallScreen && (
          <div>
            <ThemeSwitcher />
          </div>
        )}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            {userInfo && userInfo.photo ? (
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                size="sm"
                src={userInfo.photo}
              />
            ) : (
              <Avatar
                isBordered
                as="button"
                className="transition-transform text-xl dark:bg-700 dark:text"
                name={session?.user?.email.slice()[0].toUpperCase()}
                size="sm"
              />
            )}
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Profile Actions"
            variant="flat"
            color="secondary"
          >
            <DropdownItem
              key="profile"
              className="h-14 gap-2"
              textValue="Profile"
            >
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">{session?.user?.email}</p>
            </DropdownItem>
            <DropdownItem
              key="settings"
              onClick={handleMenuItemClick}
              textValue="Settings"
            >
              {userInfo && userInfo.photo ? (
                <NextUIUser
                  name="Profile"
                  avatarProps={{
                    src: userInfo.photo,
                    size: "sm",
                  }}
                />
              ) : (
                <NextUIUser
                  name="Profile"
                  avatarProps={{
                    name: session?.user?.email.slice()[0].toUpperCase(),
                    size: "sm",
                  }}
                />
              )}
            </DropdownItem>
            {isSmallScreen && (
              <DropdownItem
                key="help_and_feedback"
                onClick={handleHelpSupport}
                textValue="Help & Support"
              >
                <div className="flex gap-1 items-center">
                  <FaQuestion className="ml-1 text-2xl" />
                  <span className="ml-2">Help & Support</span>
                </div>
              </DropdownItem>
            )}
            <DropdownItem
              key="logout"
              color="danger"
              onClick={handleLogout}
              textValue="Help & Support"
            >
              <div className="flex gap-1 items-center">
                <MdOutlineLogout className="ml-1 text-2xl" />
                <span className="ml-2">Logout</span>
              </div>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
      {isModalOpen && (
        <ProfileModal handleCloseModal={handleCloseModal} opens={isModalOpen} />
      )}
      <NotificationModal
        open={openNotificationModal}
        handleClose={handleCloseNotificationModal}
        anchorEl={notificationIconRef.current}
      />
      <CreateOrganization
        isOpen={orgOpenModal}
        handleOrgCloseModal={handleOrgCloseModal}
      />
    </Navbar>
  )
}
