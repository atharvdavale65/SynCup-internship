"use server"

import prisma from "@/src/lib/prisma"

export default async function GetSyncupData(boardId) {
  const data = await prisma.task.findMany({
    relationLoadStrategy: "join",
    where: {
      boardId: parseInt(boardId, 10),
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      user: true,
      cards: {
        orderBy: {
          order: "asc",
        },
        include: {
          assignedUsers: true,
          label: true,
          comments: true,
          attachments: true,
        },
      },
    },
  })
  return data.map((task) => ({
    id: task.id,
    title: task.category,
    color: task.color,
    cards: task.cards.map((card) => ({
      id: card.id,
      name: card.name,
      description: card.description,
      photo: card.photo,
      order: card.order,
      createdAt: card.createdAt,
      dueDate: card.dueDate,
      isCompleted: card.isCompleted,
      priority: card.priority,
      status: card.status,
      assignedUsers: card.assignedUsers.map((user) => ({
        name: user.name,
        email: user.email,
        photo: user.photo,
      })),
      label: card.label.map((label) => ({
        id: label.id,
        name: label.name,
        color: label.color,
      })),
      comments: card.comments.map((comments) => ({
        id: comments.id,
        description: comments.name,
      })),
      attachments: card.attachments.map((attachments) => ({
        id: attachments.id,
      })),
      taskColor: task.color,
    })),
  }))
}
