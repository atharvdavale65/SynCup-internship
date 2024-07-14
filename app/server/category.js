"use server"

import prisma from "@/src/lib/prisma"
import createNotification from "./NotificationCreating"
import { NotificationEventType } from "@/src/components/notification/eventMapper"

export const createTask = async (
  category,
  boardId,
  color,
  boarduser,
  username,
) => {
  await prisma.task.create({
    data: {
      category,
      boardId: parseInt(boardId, 10),
      color,
    },
  })
  await createNotification(
    username,
    NotificationEventType.CATEGORY_CREATED,
    category,
    [boarduser],
  )
}

export const showAllData = async (boardId) => {
  const tasks = await prisma.task.findMany({
    where: {
      boardId: parseInt(boardId, 10),
    },
    orderBy: {
      order: "asc",
    },
  })
  return tasks
}
export const createcategory = async (category, boardid, color) => {
  await prisma.task.create({
    data: {
      category,
      boardId: boardid,
      color,
    },
  })
}

export const updateCategory = async (category, taskid, color) => {
  await prisma.task.update({
    where: {
      id: parseInt(taskid, 10),
    },
    data: {
      category,
      color,
    },
  })
}

export const deleteCategory = async (taskId) => {
  const cardsToDelete = await prisma.card.findMany({
    where: {
      taskId: parseInt(taskId, 10),
    },
  })
  await Promise.all(
    cardsToDelete.map(async (card) => {
      await prisma.card.delete({
        where: {
          id: card.id,
        },
      })
    }),
  )
  await prisma.task.delete({
    where: {
      id: parseInt(taskId, 10),
    },
  })
}

export const editCategory = async (category, taskid) => {
  await prisma.task.update({
    where: {
      id: parseInt(taskid, 10),
    },
    data: {
      category,
    },
  })
}
