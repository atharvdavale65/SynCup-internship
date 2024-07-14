"use server"

import { compileResetPassTemplate, sendMail } from "../mail"
import prisma from "../prisma"

export default async function InviteUser(email: string, orgName: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user) throw new Error("The User Does Not Exist!")

  const inviteUrl = `${process.env.NEXTAUTH_URL}/auth/login`
  const body = compileResetPassTemplate(user.name, inviteUrl, orgName)
  const sendResult = await sendMail({
    to: user.email,
    subject: "Invite link",
    body,
    sendgrid_key: process.env.SENDGRID_API_KEY,
    smtp_email: process.env.SENDGRID_SMTP_EMAIL,
  })
  return sendResult
}
