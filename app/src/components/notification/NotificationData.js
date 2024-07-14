"use server"

import prisma from "@/src/lib/prisma"

const fetchNotifications = async (email) => {
  const notifications = await prisma.notification.findMany({
    where: {
      users: {
        some: {
          email,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return notifications.map((notification) => ({
    ...notification,
    new: notification.status === "UNREAD",
  }))
}

const markNotificationAsRead = async (notificationId) => {
  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        status: "READ",
      },
    })
  } catch (error) {
    throw new Error("Error marking notification as read.")
  }
}

export { fetchNotifications, markNotificationAsRead }
