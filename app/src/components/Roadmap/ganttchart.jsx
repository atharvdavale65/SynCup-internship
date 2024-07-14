"use client"

import React, { useEffect, useRef, useState } from "react"
import Gantt from "frappe-gantt"
import PropTypes from "prop-types"
import GetSyncupData from "@/server/GetSyncupData"

function GanttChart({ selectedBoardId }) {
  const ganttContainer = useRef(null)
  const ganttInstance = useRef(null)
  const [roadmapData, setRoadmapData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const updatedData = await GetSyncupData(selectedBoardId)
        setRoadmapData(updatedData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [selectedBoardId])
  const getFormattedDate = (date) => {
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10)
    }
    return ""
  }

  useEffect(() => {
    if (!ganttContainer.current || !roadmapData.length) return

    const mappedCards = roadmapData.reduce((allCards, task) => {
      return allCards.concat(
        task.cards.map((card) => ({
          id: card.id.toString(),
          name: card.name,
          start: getFormattedDate(card.createdAt),
          end: getFormattedDate(card.dueDate),
          progress: card.isCompleted ? 100 : 0,
          dependencies: card.dependencies || "",
          custom_class: `gantt-task-${card.id}`,
          color: card.taskColor,
        })),
      )
    }, [])

    const gantt = new Gantt(ganttContainer.current, mappedCards)
    gantt.change_view_mode("Week")
    mappedCards.forEach((card) => {
      const taskElement = document.querySelector(`.gantt-task-${card.id} .bar`)
      if (taskElement) {
        taskElement.style.fill = card.color || "#7754bd"
      }
    })
    ganttInstance.current = gantt
  }, [roadmapData])

  return <div ref={ganttContainer} />
}

export default GanttChart

GanttChart.propTypes = {
  selectedBoardId: PropTypes.number.isRequired,
}
