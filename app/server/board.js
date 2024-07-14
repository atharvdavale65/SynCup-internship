"use server"

import prisma from "@/src/lib/prisma"
import createNotification from "./NotificationCreating"
import { NotificationEventType } from "@/src/components/notification/eventMapper"

export const getAllboards = async (email, organizationName) => {
  const boards = await prisma.board.findMany({
    relationLoadStrategy: "join",
    where: {
      OR: [
        {
          users: {
            some: {
              email,
            },
          },
        },
        {
          visibility: "PUBLIC",
        },
      ],
      organization: {
        name: organizationName,
      },
    },
    include: {
      users: true,
      tasks: true,
      labels: true,
    },
  })
  return boards
}
export const createboard = async (
  boardName,
  visibility,
  selectedBackground,
  selectedUsers,
  organisations,
  username,
) => {
  const uniqueSelectedUsers = Array.from(
    new Set(selectedUsers.filter((id) => id !== undefined && id !== null)),
  ).map((id) => ({ id: parseInt(id, 10) }))
  const newBoard = await prisma.board.create({
    data: {
      name: boardName,
      visibility,
      background: selectedBackground,
      users: {
        connect: uniqueSelectedUsers,
      },
      organization: {
        connect: { name: organisations },
      },
    },
  })
  await createNotification(
    username,
    NotificationEventType.BOARD_CREATED,
    boardName,
    [selectedUsers],
  )
  return newBoard.id
}
export const getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  })
  return user?.id
}
export async function updateBoard(
  boardId,
  name,
  background,
  visibility,
  selectedUsers,
  usertounassign,
  selecteduser,
  username,
) {
  const selectedUserIds = selectedUsers.map((user) => parseInt(user.id, 10))
  const usersToUnassignIds =
    selectedUserIds.length === 0
      ? []
      : usertounassign.map((user) => parseInt(user.id, 10))
  const updatedBoard = await prisma.board.update({
    where: { id: boardId },
    data: {
      ...(name && { name }),
      ...(background && { background }),
      ...(visibility && { visibility }),
      users: {
        connect:
          visibility === "PUBLIC"
            ? selecteduser.map((user) => ({ id: user }))
            : selectedUserIds.map((id) => ({ id })),
        disconnect:
          visibility === "PUBLIC"
            ? []
            : usersToUnassignIds.map((id) => ({ id })),
      },
    },
  })
  await createNotification(
    username,
    NotificationEventType.BOARD_UPDATED,
    name,
    [selecteduser],
  )
  return updatedBoard
}
export async function deleteBoard(boardId, boardname, boarduser, username) {
  const board = await prisma.board.findUnique({
    relationLoadStrategy: "join",
    where: {
      id: boardId,
    },
    include: {
      tasks: {
        include: {
          cards: true,
        },
      },
      labels: true,
    },
  })
  await createNotification(
    username,
    NotificationEventType.BOARD_DELETED,
    boardname,
    [boarduser.map((user) => user.id)],
  )
  const cardDeletionPromises = board.tasks.flatMap((task) =>
    task.cards.map((card) =>
      prisma.card.delete({
        where: {
          id: card.id,
        },
      }),
    ),
  )
  await Promise.all(cardDeletionPromises)
  const taskDeletionPromises = board.tasks.map((task) =>
    prisma.task.delete({
      where: {
        id: task.id,
      },
    }),
  )
  await Promise.all(taskDeletionPromises)
  const labelDeletionPromises = board.labels.map((label) =>
    prisma.label.delete({
      where: {
        id: label.id,
      },
    }),
  )
  await Promise.all(labelDeletionPromises)
  const deletedBoard = await prisma.board.delete({
    where: {
      id: boardId,
    },
  })
  return deletedBoard
}
export const getAllUsers = async (name) => {
  try {
    const user = await prisma.Organization.findMany({
      where: {
        name,
      },
      include: {
        users: true,
      },
    })
    return user.map((item) => item.users).flat()
  } catch (error) {
    return error
  } finally {
    await prisma.$disconnect()
  }
}
export async function fetchBoardName(boardId) {
  try {
    const board = await prisma.board.findUnique({
      where: {
        id: parseInt(boardId.id, 10),
      },
      select: {
        name: true,
      },
    })
    return board.name
  } catch (error) {
    return error
  }
}
export async function fetchBoarduser(boardId) {
  try {
    const board = await prisma.board.findUnique({
      where: {
        id: parseInt(boardId, 10),
      },
      select: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
    return board?.users.map((user) => ({
      name: user.name,
      email: user.email,
      id: user.id,
    }))
  } catch (error) {
    return error
  }
}

export const connectUserToPublicBoards = async (newUserId, boardData) => {
  const publicBoards = boardData.filter(
    (board) => board.visibility === "PUBLIC",
  )

  const updatePromises = publicBoards.map(async (board) => {
    await prisma.board.update({
      where: { id: board.id },
      data: {
        users: {
          connect: { id: newUserId },
        },
      },
    })
  })

  await Promise.all(updatePromises)
}
