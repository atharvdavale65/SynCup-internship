"use server"

import prisma from "@/src/lib/prisma"

async function submitFeedback(feedbackData) {
  try {
    const createdFeedback = await prisma.Feedback.create({
      data: feedbackData,
    })
    return createdFeedback
  } catch (error) {
    return error
  }
}
export default submitFeedback
