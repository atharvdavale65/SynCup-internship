"use server"

import prisma from "@/src/lib/prisma"

const deleteNotification = async () => {
  await prisma.notification.deleteMany()
}

export default deleteNotification
