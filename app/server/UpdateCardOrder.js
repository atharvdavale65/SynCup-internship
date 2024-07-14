"use server"

import prisma from "@/src/lib/prisma"

export const updateCardPositionInDB = async (
  cardId,
  newTaskId,
  newPosition,
) => {
  const existingCardsCount = await prisma.card.count({
    where: { taskId: newTaskId },
  })
  const correctedPosition = Math.min(newPosition, existingCardsCount)
  await prisma.Card.update({
    where: { id: cardId },
    data: {
      taskId: newTaskId,
      order: correctedPosition,
    },
  })
  const task = await prisma.task.findUnique({
    where: { id: newTaskId },
    select: { category: true },
  })

  if (task.category === "Done") {
    await prisma.card.update({
      where: { id: cardId },
      data: {
        status: "archived",
      },
    })
  }
}

export const moveCardToList = async (cardId, fromListId, toListId) => {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
  })

  await updateCardPositionInDB(cardId, toListId, card.order)
}
