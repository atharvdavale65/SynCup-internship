import React, { useEffect, useState } from "react"
import { Select, SelectItem, Checkbox } from "@nextui-org/react"
import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"
import { FaExclamationTriangle } from "react-icons/fa"
import toast from "react-hot-toast"
import { useSession } from "next-auth/react"
import GetSyncupData from "@/server/GetSyncupData"
import { useGlobalSyncupContext } from "@/src/context/SyncUpStore"

function Charts() {
  const { data: session } = useSession()
  const [first, setfirst] = useState("")
  const { boardData } = useGlobalSyncupContext()
  const [categories, setCategories] = useState([])
  const [totalCompletedTasks, setTotalCompletedTasks] = useState(0)
  const [totalIncompleteTasks, setTotalIncompleteTasks] = useState(0)
  const [totalOverdueTasks, setTotalOverdueTasks] = useState(0)
  const [monthlyTaskData, setMonthlyTaskData] = useState([])
  const [selectedCategories, setSelectedCategories] = useState({
    completed: true,
    incomplete: true,
    overdue: true,
  })

  const fetchCategories = async (boardId) => {
    try {
      const tasks = await GetSyncupData(boardId)
      const categoriesMap = {}
      let totalCompleted = 0
      let totalIncomplete = 0
      let totalOverdue = 0

      tasks.forEach((task) => {
        const { title, cards } = task
        if (!categoriesMap[title]) {
          categoriesMap[title] = {
            name: title,
            completed: 0,
            incomplete: 0,
            overdue: 0,
          }
        }
        cards.forEach((card) => {
          const { isCompleted, dueDate } = card
          if (isCompleted) {
            categoriesMap[title].completed =
              (categoriesMap[title].completed || 0) + 1
            totalCompleted = (totalCompleted || 0) + 1
          } else {
            categoriesMap[title].incomplete =
              (categoriesMap[title].incomplete || 0) + 1
            totalIncomplete = (totalIncomplete || 0) + 1
            if (
              dueDate &&
              new Date(dueDate).setHours(0, 0, 0, 0) <
                new Date().setHours(0, 0, 0, 0)
            ) {
              categoriesMap[title].overdue =
                (categoriesMap[title].overdue || 0) + 1
              totalOverdue = (totalOverdue || 0) + 1
            }
          }
        })
      })
      const uniqueCategories = Object.values(categoriesMap)
      setCategories(uniqueCategories)
      setTotalCompletedTasks(totalCompleted)
      setTotalIncompleteTasks(totalIncomplete)
      setTotalOverdueTasks(totalOverdue)
    } catch (error) {
      toast.error("Error fetching categories:")
    }
  }
  const fetchMonthlyTaskData = async (boardId) => {
    try {
      const tasks = await GetSyncupData(boardId)
      const categoriesMap = {}

      tasks.forEach((task) => {
        const { cards } = task
        cards.forEach((card) => {
          const { isCompleted, dueDate } = card
          if (dueDate) {
            const month = new Date(dueDate).toLocaleString("en-US", {
              month: "short",
            })
            if (!categoriesMap[month]) {
              categoriesMap[month] = {
                month,
                completed: 0,
                incomplete: 0,
                overdue: 0,
              }
            }
            if (isCompleted) {
              categoriesMap[month].completed =
                (categoriesMap[month].completed || 0) + 1
            } else {
              categoriesMap[month].incomplete =
                (categoriesMap[month].incomplete || 0) + 1
              if (
                new Date(dueDate).setHours(0, 0, 0, 0) <
                new Date().setHours(0, 0, 0, 0)
              ) {
                categoriesMap[month].overdue =
                  (categoriesMap[month].overdue || 0) + 1
              }
            }
          }
        })
      })
      const monthlyData = Object.values(categoriesMap)
      setMonthlyTaskData(monthlyData)
    } catch (error) {
      toast.error("Error fetching monthly task data:")
    }
  }
  const handleBoardChange = async (event) => {
    const boardId = event.target.value
    fetchCategories(boardId)
    fetchMonthlyTaskData(boardId)
    setfirst([boardId.toString()])
  }
  useEffect(() => {
    const fetchBoards = async () => {
      if (boardData.length === 0) return
      const sortedBoards = boardData
      if (sortedBoards.length > 0) {
        const firstBoardID = sortedBoards[0].id
        const a = firstBoardID.toString()
        setfirst([a])
        fetchMonthlyTaskData(a)
        fetchCategories(a)
      }
    }
    fetchBoards()
  }, [session])
  const pieChartData = [
    { name: "Completed", value: totalCompletedTasks },
    { name: "Incomplete", value: totalIncompleteTasks },
    { name: "Overdue", value: totalOverdueTasks },
  ]
  const colors = ["#82ca9d", "#FA8072", "#FF0000"]

  const handleCategoryToggle = (category) => {
    setSelectedCategories({
      ...selectedCategories,
      [category]: !selectedCategories[category],
    })
  }

  return (
    <div>
      <div className="flex justify-between">
        <Select
          label="Select Board"
          className="max-w-52 ml-3 mt-3"
          selectedKeys={first}
          onChange={handleBoardChange}
        >
          {boardData.map((board) => (
            <SelectItem key={board.id} value={board.id}>
              {board.name}
            </SelectItem>
          ))}
        </Select>
        <div className="mt-4 mr-4">
          <Checkbox
            defaultSelected
            color="success"
            onChange={() => handleCategoryToggle("completed")}
            className="mr-1"
          >
            Completed
          </Checkbox>
          <Checkbox
            defaultSelected
            color="secondary"
            onChange={() => handleCategoryToggle("incomplete")}
            className="mr-1"
          >
            Incompleted
          </Checkbox>
          <Checkbox
            defaultSelected
            color="danger"
            onChange={() => handleCategoryToggle("overdue")}
          >
            Overdue
          </Checkbox>
        </div>
      </div>
      <div>
        <section>
          <div className="flex flex-wrap gap-2 justify-center m-4 md:m-4">
            <div className="flex-1 px-2 py-2 justify-between w-full md:w-1/4 dark:bg-gray-700 bg-white shadow rounded h-fit">
              <div className="">
                <h1 className="text-3xl text-center">{totalCompletedTasks}</h1>
                <p className="text-[#7754bd] font-bold text-center dark:text-text">
                  Completed Tasks
                </p>
              </div>
            </div>
            <div className="flex-1 px-2 py-2 justify-center w-full md:w-1/4 dark:bg-gray-700 bg-white shadow rounded h-fit">
              <div className="">
                <h1 className="text-3xl text-center">{totalIncompleteTasks}</h1>
                <p className="text-[#7754bd] font-bold text-center dark:text-text">
                  Incomplete Tasks
                </p>
              </div>
            </div>
            <div className="flex-1 px-2 py-2 justify-center w-full md:w-1/4 dark:bg-gray-700 bg-white shadow rounded h-fit">
              <div className="">
                <h1 className="text-3xl text-center">{totalOverdueTasks}</h1>
                <p className="text-[#7754bd] font-bold text-center dark:text-text">
                  Overdue Tasks
                </p>
              </div>
            </div>
            <div className="flex-1 px-2 py-2 justify-center w-full md:w-1/4 dark:bg-gray-700 bg-white shadow rounded h-fit">
              <div className="">
                <h1 className="text-3xl text-center">
                  {totalCompletedTasks + totalIncompleteTasks}
                </h1>
                <p className="text-[#7754bd] font-bold text-center dark:text-text">
                  Total Tasks
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="max-h-[50vh] lg:max-h-[68vh] md:max-h-[60vh] sm:max-h-[55vh] overflow-auto no-scrollbar">
        <section className="flex flex-col md:flex-row my-4 px-4 gap-3">
          {totalCompletedTasks === 0 &&
          totalIncompleteTasks === 0 &&
          totalOverdueTasks === 0 ? (
            <div className="flex justify-center items-center w-full md:w-1/2 h-96 dark:bg-gray-700 bg-white rounded">
              <span className="text-[#7754bd] font-bold text-3xl mr-2">
                <FaExclamationTriangle />
              </span>
              <h1 className="text-[#7754bd]">No Data</h1>
            </div>
          ) : !selectedCategories.completed &&
            !selectedCategories.incomplete &&
            !selectedCategories.overdue ? (
            <div className="flex justify-center items-center w-full md:w-1/2 h-96 dark:bg-gray-700 bg-white rounded">
              <h1 className="text-[#7754bd]">
                Please select at least one category
              </h1>
            </div>
          ) : (
            <div className="w-full md:w-1/2 h-96 dark:bg-gray-700 bg-white rounded">
              <h1 className="dark:text-white text-[#7754bd] text-left p-4">
                Monthly Task Completion Overview
              </h1>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart
                  width={730}
                  height={250}
                  data={monthlyTaskData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FA8072" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FA8072" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF0000" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FF0000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  {selectedCategories.completed && (
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#82ca9d"
                      fillOpacity={1}
                      fill="url(#colorUv)"
                    />
                  )}
                  {selectedCategories.incomplete && (
                    <Area
                      type="monotone"
                      dataKey="incomplete"
                      stroke="#FA8072"
                      fillOpacity={1}
                      fill="url(#colorPv)"
                    />
                  )}
                  {selectedCategories.overdue && (
                    <Area
                      type="monotone"
                      dataKey="overdue"
                      stroke="#FF0000"
                      fillOpacity={1}
                      fill="url(#colorOv)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {totalCompletedTasks === 0 &&
          totalIncompleteTasks === 0 &&
          totalOverdueTasks === 0 ? (
            <div className="flex justify-center items-center w-full md:w-1/2 h-96 dark:bg-gray-700 bg-white rounded">
              <span className="text-[#7754bd] font-bold text-3xl mr-2">
                <FaExclamationTriangle />
              </span>
              <h1 className="text-[#7754bd]">No Data</h1>
            </div>
          ) : !selectedCategories.completed &&
            !selectedCategories.incomplete &&
            !selectedCategories.overdue ? (
            <div className="flex justify-center items-center w-full md:w-1/2 h-96 dark:bg-gray-700 bg-white rounded">
              <h1 className="text-[#7754bd]">
                Please select at least one category
              </h1>
            </div>
          ) : (
            <div className="w-full md:w-1/2 h-96 dark:bg-gray-700 bg-white rounded">
              <h1 className="dark:text-white text-[#7754bd] text-left p-4">
                Category Progress Comparison
              </h1>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart
                  width={730}
                  height={250}
                  data={categories}
                  barCategoryGap={15}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedCategories.completed && (
                    <Bar dataKey="completed" fill="#82ca9d" />
                  )}
                  {selectedCategories.incomplete && (
                    <Bar dataKey="incomplete" fill="#FA8072" />
                  )}
                  {selectedCategories.overdue && (
                    <Bar dataKey="overdue" fill="#FF0000" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
        <section className="flex flex-col md:flex-row my-4 px-4 gap-2">
          {totalCompletedTasks === 0 &&
          totalIncompleteTasks === 0 &&
          totalOverdueTasks === 0 ? (
            <div className="flex justify-center items-center w-full md:w-1/2 h-96 dark:bg-gray-700 bg-white rounded">
              <span className="text-[#7754bd] font-bold text-3xl mr-2">
                <FaExclamationTriangle />
              </span>
              <h1 className="text-[#7754bd]">No Data</h1>
            </div>
          ) : !selectedCategories.completed &&
            !selectedCategories.incomplete &&
            !selectedCategories.overdue ? (
            <div className="flex justify-center items-center w-full md:w-1/2 h-96 dark:bg-gray-700 bg-white rounded">
              <h1 className="text-[#7754bd]">
                Please select at least one category
              </h1>
            </div>
          ) : (
            <div className="w-full md:w-1/2 h-96 dark:bg-gray-700 bg-white rounded">
              <h1 className="dark:text-white text-[#7754bd] text-left p-4">
                Task Status Overview
              </h1>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart width={730} height={250}>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    fill="#8884d8"
                    label
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {totalCompletedTasks === 0 &&
          totalIncompleteTasks === 0 &&
          totalOverdueTasks === 0 ? (
            <div className="flex justify-center items-center w-full md:w-1/2 h-96 dark:bg-gray-700 bg-white rounded">
              <span className="text-[#7754bd] font-bold text-3xl mr-2">
                <FaExclamationTriangle />
              </span>
              <h1 className="text-[#7754bd]">No Data</h1>
            </div>
          ) : !selectedCategories.completed &&
            !selectedCategories.incomplete &&
            !selectedCategories.overdue ? (
            <div className="flex justify-center items-center w-full md:w-1/2 h-96 dark:bg-gray-700 bg-white rounded">
              <h1 className="text-[#7754bd]">
                Please select at least one category
              </h1>
            </div>
          ) : (
            <div className="w-full md:w-1/2 h-96 dark:bg-gray-700 bg-white rounded">
              <h1 className="dark:text-white text-[#7754bd] text-left p-4">
                Category Task Progression Analysis
              </h1>
              <ResponsiveContainer width="100%" height="80%">
                <LineChart
                  width={730}
                  height={250}
                  data={categories}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedCategories.completed && (
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#82ca9d"
                    />
                  )}
                  {selectedCategories.incomplete && (
                    <Line
                      type="monotone"
                      dataKey="incomplete"
                      stroke="#FA8072"
                    />
                  )}
                  {selectedCategories.overdue && (
                    <Line type="monotone" dataKey="overdue" stroke="#FF0000" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
export default Charts
