import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/src/lib/prisma"
import { sendMail } from "@/src/lib/mail"
import { Role } from "@/src/roleManagement/roleManagement"

const handler = NextAuth({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          accessToken: token.accessToken as string,
          refreshToken: token.refreshToken as string,
          id: token.id,
        },
        error: token.error,
      }
    },
    async signIn({ account, profile }) {
      if (account.provider === "google") {
        const { email, name } = profile
        const userlength = await prisma.user.count()
        if (userlength === 0) {
          await prisma.user.create({
            data: {
              email,
              name,
              role: Role.SuperAdmin,
            },
          })
          return true
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email,
              name,
            },
          })
        }

        await sendMail({
          to: email,
          subject: "Welcome to SyncUP",
          body: `
            <p>Hello ${name},</p>
            <p>Welcome to SyncUP! You've successfully logged in with name:${name}, and Email: ${email}.</p>
            <p>Your account is now active and ready to use.</p>
            <p>Best regards,<br>SyncUP Team</p>
          `,
          smtp_email: process.env.SENDGRID_SMTP_EMAIL,
          sendgrid_key: process.env.SENDGRID_API_KEY,
        })
      }
      return true
    },
  },
})

export { handler as GET, handler as POST }
