"use server"

import prisma from "@/src/lib/prisma"

export const createVersion = async (
  name,
  description,
  startValue,
  endValue,
) => {
  await prisma.Version.create({
    data: {
      name,
      description,
      startDate: new Date(startValue),
      releaseDate: new Date(endValue),
    },
  })
}

export const releaseVersion = async (cardId, releaseId) => {
  await prisma.version.update({
    where: {
      id: releaseId,
    },
    data: {
      status: "RELEASED",
    },
  })

  await prisma.card.updateMany({
    where: {
      id: {
        in: cardId,
      },
    },
    data: {
      release: "RELEASED",
      versionId: releaseId,
    },
  })

  return true
}

export const versionData = async () => {
  const version = await prisma.version.findMany({})
  return version
}

export const unreleaseVersion = async () => {
  const unreleasedVersion = await prisma.version.findFirst({
    where: {
      status: "UNRELEASED",
    },
  })
  return unreleasedVersion
}

export const getCardsByVersionId = async (versionId, boardId) => {
  const id = parseInt(versionId, 10)
  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
    },
    include: {
      tasks: true,
    },
  })

  if (!board) {
    throw new Error("Board not found")
  }

  const taskIds = board.tasks.map((task) => task.id)
  if (taskIds.length === 0) {
    throw new Error("No tasks found in the board")
  }

  const cards = await prisma.card.findMany({
    where: {
      versionId: id,
      taskId: {
        in: taskIds,
      },
    },
  })
  if (!cards) {
    throw new Error("Cards not found for the given version and board")
  }
  return cards
}
