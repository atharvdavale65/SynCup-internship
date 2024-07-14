"use server"

import prisma from "@/src/lib/prisma"

const createNotification = async (author, event, cardTitle, [user]) => {
  try {
    await prisma.Notification.create({
      relationLoadStrategy: "join",
      data: {
        author,
        event,
        details: cardTitle,
        users: {
          connect: user?.map((userId) => ({ id: parseInt(userId, 10) })),
        },
      },
    })
    return true
  } catch (error) {
    return error
  }
}
export default createNotification
