"use server"

import prisma from "@/src/lib/prisma"

export const createLabel = async (name, color, boardId) => {
  try {
    const label = await prisma.label.create({
      data: {
        name,
        color,
        boardId,
      },
    })
    return label
  } catch (error) {
    throw new Error(`Error creating label: ${error.message}`)
  }
}

export const getLabels = async (boardId) => {
  try {
    const labels = await prisma.label.findMany({
      where: {
        boardId,
      },
      orderBy: {
        id: "asc",
      },
    })
    return labels
  } catch (error) {
    throw new Error(`Error fetching labels: ${error.message}`)
  }
}

export const updateLabel = async (id, name, color) => {
  try {
    const label = await prisma.label.update({
      where: {
        id,
      },
      data: {
        name,
        color,
      },
    })
    return label
  } catch (error) {
    throw new Error(`Error updating label: ${error.message}`)
  }
}

export const deleteLabel = async (id) => {
  try {
    const label = await prisma.label.delete({
      where: {
        id,
      },
    })
    return label
  } catch (error) {
    throw new Error(`Error deleting label: ${error.message}`)
  }
}
export const assignLabelToCard = async (cardId, labelId) => {
  try {
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        label: {
          connect: { id: labelId },
        },
      },
    })
    return updatedCard
  } catch (error) {
    throw new Error(`Error assigning label to card: ${error.message}`)
  }
}
export const unassignLabelFromCard = async (cardId, labelId) => {
  try {
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        label: {
          disconnect: { id: labelId },
        },
      },
    })
    return updatedCard
  } catch (error) {
    throw new Error(`Error unassigning label from card: ${error.message}`)
  }
}
