"use client"

import React, {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react"
import PropTypes from "prop-types"

import {
  SyncupData,
  useSyncupFilter,
  FilterState,
  LabelData,
  BoardData,
  UserData,
  AllUserData,
} from "./useSyncupFilters"

interface ContextProps {
  tableupdate: boolean
  setTableUpdate: Dispatch<SetStateAction<boolean>>
  setData: (value: SyncupData[]) => void
  setLabels: (value: LabelData[]) => void
  setAllUserData: (value: AllUserData[]) => void
  setBoardData: (value: BoardData[]) => void
  data: SyncupData[]
  labels: LabelData[]
  allUserData: AllUserData[]
  boardData: BoardData[]
  cardState: string
  TableView: boolean
  setTableView: Dispatch<SetStateAction<boolean>>
  searchState: string
  userUpdate: boolean
  load: boolean
  defaultload: boolean
  categoryLoad: boolean
  updateboard: boolean
  setCategoryLoad: Dispatch<SetStateAction<boolean>>
  setLoad: Dispatch<SetStateAction<boolean>>
  setUserUpdate: Dispatch<SetStateAction<boolean>>
  setCardState: Dispatch<SetStateAction<string>>
  setSearchState: Dispatch<SetStateAction<string>>
  setFilterState: Dispatch<SetStateAction<FilterState>>
  filterState: FilterState
  userInfo: UserData
  setUserInfo: (value: UserData) => void
  assignedUserNames: string[]
  setAssignedUserNames: Dispatch<SetStateAction<string[]>>
  setDefaultLoad: Dispatch<SetStateAction<boolean>>
  setudpateboard: Dispatch<SetStateAction<boolean>>
  notifications: number
  setnotifications: Dispatch<SetStateAction<number>>
  createnotification: boolean
  setcreatenotification: Dispatch<SetStateAction<boolean>>
  setUpdateOrg: Dispatch<SetStateAction<boolean>>
  updateOrg: boolean
  update: boolean
  setupdate: (update: boolean) => void
  organizationname: string[]
  setOrganizationname: Dispatch<SetStateAction<string[]>>
  photoupdate: boolean
  setPhotoUpdate: Dispatch<SetStateAction<boolean>>
  labelupdate: boolean
  setLabelUpdate: Dispatch<SetStateAction<boolean>>
}

const SyncupGlobalContext = createContext<ContextProps>({
  notifications: 0,
  setnotifications: (): number => 0,
  createnotification: true,
  setcreatenotification: (): boolean => true,
  setLoad: (): boolean => false,
  setUserUpdate: (): boolean => false,
  tableupdate: false,
  setTableUpdate: (): boolean => false,
  defaultload: false,
  setDefaultLoad: (): boolean => false,
  updateboard: false,
  setudpateboard: (): boolean => false,
  updateOrg: false,
  setUpdateOrg: (): boolean => false,
  labels: [],
  allUserData: [],
  boardData: [],
  load: false,
  userUpdate: false,
  TableView: false,
  setTableView: (): boolean => false,
  update: false,
  setupdate: (): boolean => false,
  setCategoryLoad: (): boolean => false,
  categoryLoad: false,
  setData: () => [],
  setLabels: () => [],
  setAllUserData: () => [],
  setBoardData: () => [],
  data: [],
  cardState: "",
  searchState: "",
  setSearchState: (): string => "",
  setCardState: (): string => "",
  setFilterState: (): string => "",
  assignedUserNames: [],
  setAssignedUserNames: (): string[] => [],
  organizationname: [],
  setOrganizationname: (): string[] => [],
  photoupdate: false,
  setPhotoUpdate: (): boolean => false,
  labelupdate: false,
  setLabelUpdate: (): boolean => false,
  userInfo: {
    id: 0,
    email: "",
    name: "",
    role: "User",
    photo: "",
  },
  setUserInfo: () => {},
  filterState: {
    due: false,
    dueDate: false,
    overdue: false,
    dueNextDay: false,
    dueNextWeek: false,
    dueNextMonth: false,
    label: "",
    specificLabel: "",
    member: false,
    assignedToMe: false,
    isMarkedAsCompleted: false,
    isMarkedAsInCompleted: false,
    specificMember: "",
    priority: "",
  },
})

export function SyncupGlobalContextProvider({ children }) {
  const {
    tableupdate,
    setTableUpdate,
    cardState,
    searchState,
    labels,
    allUserData,
    setCardState,
    setSearchState,
    filterState,
    setFilterState,
    TableView,
    setTableView,
    data,
    setData,
    setLabels,
    setAllUserData,
    setBoardData,
    setLoad,
    load,
    setUserUpdate,
    userUpdate,
    categoryLoad,
    defaultload,
    setDefaultLoad,
    updateboard,
    setudpateboard,
    updateOrg,
    setUpdateOrg,
    setCategoryLoad,
    boardData,
    userInfo,
    setUserInfo,
    assignedUserNames,
    setAssignedUserNames,
    notifications,
    setnotifications,
    createnotification,
    setcreatenotification,
    update,
    setupdate,
    organizationname,
    setOrganizationname,
    photoupdate,
    setPhotoUpdate,
    labelupdate,
    setLabelUpdate,
  } = useSyncupFilter()
  const contextValue = useMemo(
    () => ({
      tableupdate,
      setTableUpdate,
      data,
      labels,
      allUserData,
      boardData,
      setBoardData,
      setData,
      setLabels,
      setAllUserData,
      load,
      setLoad,
      userUpdate,
      setUserUpdate,
      TableView,
      setTableView,
      categoryLoad,
      setCategoryLoad,
      cardState,
      searchState,
      setCardState,
      filterState,
      setFilterState,
      setSearchState,
      userInfo,
      setUserInfo,
      assignedUserNames,
      setAssignedUserNames,
      defaultload,
      setDefaultLoad,
      updateboard,
      setudpateboard,
      notifications,
      setnotifications,
      createnotification,
      setcreatenotification,
      updateOrg,
      setUpdateOrg,
      update,
      setupdate,
      organizationname,
      setOrganizationname,
      photoupdate,
      setPhotoUpdate,
      labelupdate,
      setLabelUpdate,
    }),
    [
      tableupdate,
      setTableUpdate,
      data,
      labels,
      allUserData,
      boardData,
      cardState,
      searchState,
      setCardState,
      setSearchState,
      filterState,
      setFilterState,
      TableView,
      setTableView,
      categoryLoad,
      setCategoryLoad,
      load,
      userUpdate,
      setUserUpdate,
      userInfo,
      setUserInfo,
      assignedUserNames,
      setAssignedUserNames,
      defaultload,
      setDefaultLoad,
      updateboard,
      setudpateboard,
      notifications,
      setnotifications,
      createnotification,
      setcreatenotification,
      updateOrg,
      setUpdateOrg,
      update,
      setupdate,
      organizationname,
      setOrganizationname,
      photoupdate,
      setPhotoUpdate,
      labelupdate,
      setLabelUpdate,
    ],
  )

  return (
    <SyncupGlobalContext.Provider value={contextValue}>
      {children}
    </SyncupGlobalContext.Provider>
  )
}

SyncupGlobalContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useGlobalSyncupContext = () => useContext(SyncupGlobalContext)
