"use server"

import prisma from "@/src/lib/prisma"
import createNotification from "./NotificationCreating"
import { NotificationEventType } from "@/src/components/notification/eventMapper"

export const createTitle = async ({ title }, id, boarduser, username) => {
  if (title.trim() !== "") {
    await prisma.Card.create({
      data: {
        name: title,
        taskId: id,
      },
    })
    await createNotification(
      username,
      NotificationEventType.CARD_CREATED,
      title,
      [boarduser],
    )
  }
}

export const updateCard = async ({ description, label, updateId }) => {
  await prisma.Card.update({
    where: {
      id: parseInt(updateId, 10),
    },
    data: {
      description,
      label,
    },
  })
}
export const deleteTask = async (taskId, boarduser, username) => {
  const card = await prisma.card.findUnique({
    where: {
      id: parseInt(taskId, 10),
    },
    select: {
      name: true,
    },
  })

  await prisma.Card.delete({
    where: {
      id: taskId,
    },
  })
  await createNotification(
    username,
    NotificationEventType.CARD_DELETED,
    card.name,
    [boarduser],
  )
}

export const updateCardTitle = async ({ updateId, name }) => {
  await prisma.Card.update({
    where: {
      id: parseInt(updateId, 10),
    },
    data: {
      name,
    },
  })
}

export const updateInfo = async ({ updateId, description }) => {
  await prisma.card.update({
    where: {
      id: updateId,
    },
    data: {
      description,
    },
  })
}

export const updateUser = async ({ selectedUserId, updateId }) => {
  await prisma.card.update({
    where: {
      id: updateId,
    },
    data: {
      assignedUsers: selectedUserId
        ? {
            connect: selectedUserId.map((id) => ({ id })),
          }
        : [],
    },
  })
}
export const unassignUser = async ({ selectedUserId, updateId }) => {
  const userId = selectedUserId
  await prisma.card.update({
    where: {
      id: updateId,
    },
    data: {
      assignedUsers: {
        disconnect: selectedUserId ? [{ id: userId }] : [],
      },
    },
  })
}

export const cardUsers = async ({ updateId }) => {
  try {
    if (updateId) {
      const card = await prisma.card.findUnique({
        where: {
          id: updateId,
        },
        include: {
          assignedUsers: true,
        },
      })
      return card?.assignedUsers
    }
  } catch (error) {
    return error
  }
  return null
}

export const cardData = async ({ updateId }) => {
  const card = await prisma.card.findUnique({
    where: {
      id: updateId,
    },
    include: {
      assignedUsers: true,
      label: true,
      task: true,
      comments: true,
      attachments: true,
    },
  })
  return card
}

export const updateDates = async ({ updateId, startValue, endValue }) => {
  await prisma.card.update({
    where: {
      id: updateId,
    },
    data: {
      createdAt: new Date(startValue),
      dueDate: new Date(endValue),
    },
  })
}
export const checkCompleted = async ({ updateId, isChecked }) => {
  if (updateId) {
    await prisma.card.update({
      where: {
        id: updateId,
      },
      data: {
        isCompleted: isChecked,
      },
    })
  }
}

export const updateCardPriority = async ({ updateId, priority }) => {
  const updatedCard = await prisma.card.update({
    where: {
      id: updateId,
    },
    data: {
      priority,
    },
  })

  return updatedCard
}

export const cardPriority = async ({ updateId }) => {
  const priority = await prisma.card.findUnique({
    where: {
      id: updateId,
    },
  })

  return priority
}
export const unreleasedCards = async (boardId) => {
  try {
    const id = parseInt(boardId, 10)
    const tasks = await prisma.task.findMany({
      where: {
        boardId: id,
        category: "Done",
        cards: {
          some: {
            release: "UNRELEASED",
          },
        },
      },
      include: {
        cards: {
          where: {
            release: "UNRELEASED",
          },
        },
      },
    })
    const cardIds = tasks.flatMap((task) => task.cards.map((card) => card.id))
    return cardIds
  } catch (error) {
    return error
  }
}
