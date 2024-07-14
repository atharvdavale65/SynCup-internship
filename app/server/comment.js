"use server"

import prisma from "@/src/lib/prisma"

export const createComment = async ({ updateId, comment, userEmail }) => {
  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  })

  if (!user) {
    throw new Error(`User with email ${userEmail} not found`)
  }
  await prisma.comment.create({
    data: {
      description: comment,
      card: {
        connect: { id: updateId },
      },
      user: {
        connect: { id: user.id },
      },
    },
  })
}

export const allComments = async ({ updateId }) => {
  const comments = await prisma.comment.findMany({
    where: {
      cardId: updateId,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
  return comments
}

export const deleteComment = async ({ commentId }) => {
  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  })
}

export const editComment = async ({ description, commentId }) => {
  await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      description,
    },
  })
}
