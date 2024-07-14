"use server"

/* eslint-disable import/extensions,import/no-unresolved ,no-shadow, no-console , react/no-array-index-key, jsx-a11y/label-has-associated-control, react/jsx-key,react/no-array-index-key */

import toast from "react-hot-toast"
import { sendMail } from "../src/lib/mail"
import appConfig from "@/app.config"

const Invite = async ({ emails, link }) => {
  const body = `
    <p>Hello,</p>
    <p>You have been invited to our ${appConfig.PROJECT_NAME} platform:</p>
    <p>Link: ${link}</p>
    <p>Please click on the link above to login to ${appConfig.PROJECT_NAME} platform.</p>
    <p>Best regards,<br>${appConfig.PROJECT_NAME}</p>
  `

  try {
    const emailPromises = emails.map(async (userEmail) => {
      await sendMail({
        to: userEmail,
        subject: `${appConfig.PROJECT_NAME} Invitation`,
        body,
        sendgrid_key: process.env.SENDGRID_API_KEY,
        smtp_email: process.env.SENDGRID_SMTP_EMAIL,
      })
    })

    await Promise.all(emailPromises)
  } catch (error) {
    toast.error("Error sending invitations:", error)

    throw error
  }
}
export default Invite
