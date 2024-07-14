"use server"

import prisma from "@/src/lib/prisma"

export const createAttachment = async ({ updateId, path, name }) => {
  await prisma.attachment.create({
    data: {
      file: path,
      name,
      card: {
        connect: { id: updateId },
      },
    },
  })
}

export const allAttachment = async ({ updateId }) => {
  const attachment = await prisma.attachment.findMany({
    where: {
      cardId: updateId,
    },
  })
  return attachment
}

export const handleDeleteAttachment = async ({ id }) => {
  await prisma.attachment.delete({
    where: {
      id,
    },
  })
}
