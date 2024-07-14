"use server"

import prisma from "@/src/lib/prisma"

export default async function LoginValidation(params: any) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: params.email,
    },
  })
  if (existingUser) {
    return existingUser
  }
  return false
}
