"use server"

import toast from "react-hot-toast"
import prisma from "@/src/lib/prisma"

async function createTeam(name, description, membersIds, boardId) {
  try {
    const membersArray = Array.from(membersIds)
    const createdTeam = await prisma.team.create({
      data: {
        name,
        description,
        members: {
          connect: membersArray.map((id) => ({ id: parseInt(id, 10) })),
        },
        boards: {
          connect: { id: parseInt(boardId, 10) },
        },
      },
    })
    return createdTeam
  } catch (error) {
    toast.error("Error creating team:", error)
    throw error
  }
}
async function fetchTeams() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: true,
        boards: true,
      },
    })
    return teams
  } catch (error) {
    toast.error("Error fetching teams:", error)
    throw error
  }
}

async function editTeam(teamId, name, description, memberIds, boardId) {
  try {
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        description,
        members: {
          set: memberIds.map((id) => ({ id: parseInt(id, 10) })),
        },
        boards: {
          set: [{ id: parseInt(boardId, 10) }],
        },
      },
    })
    return updatedTeam
  } catch (error) {
    toast.error("Error editing team:", error)
    throw error
  }
}

async function deleteTeam(teamId) {
  await prisma.team.delete({
    where: { id: teamId },
  })
  return true
}

export { createTeam, fetchTeams, editTeam, deleteTeam }
