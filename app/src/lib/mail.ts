/* eslint-disable import/extensions, import/no-unresolved, no-async-promise-executor, camelcase, no-console */
import Handlebars from "handlebars"

import * as sgMail from "@sendgrid/mail"
import userInviteTemplate from "./emailTemplate/userInviteTemplate"

export function sendMail({
  to,
  subject,
  body,
  sendgrid_key,
  smtp_email,
}: {
  to: string
  subject: string
  body: string
  sendgrid_key: string
  smtp_email: string
}): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      sgMail.setApiKey(sendgrid_key)
      const msg = {
        from: { email: smtp_email },
        to,
        subject,
        html: body,
      }
      sgMail.send(msg).then(
        () => {},
        (error) => {
          return error
        },
      )
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

export function compileResetPassTemplate(
  name: string,
  url: string,
  orgName: string,
) {
  const template = Handlebars.compile(userInviteTemplate)
  const htmlBody = template({
    name,
    url,
    orgName,
  })
  return htmlBody
}
