"use server"

/* eslint-disable import/extensions, import/no-unresolved */
import toast from "react-hot-toast"
import prisma from "@/src/lib/prisma"

export async function updateOrganization(updatedOrganizationData) {
  try {
    if (!updatedOrganizationData) {
      toast.error("Updated organization data is null or undefined")
    }

    const existingOrganization = await prisma.organization.findUnique({
      where: {
        id: updatedOrganizationData.id,
      },
    })

    if (!existingOrganization) {
      toast.error("Organization not found")
    }

    const updatedFields = {
      ...(updatedOrganizationData.name && {
        name: updatedOrganizationData.name,
      }),
      ...(updatedOrganizationData.type && {
        type: updatedOrganizationData.type,
      }),
      ...(updatedOrganizationData.description && {
        description: updatedOrganizationData.description,
      }),
    }

    const updatedOrganization = await prisma.organization.update({
      where: {
        id: updatedOrganizationData.id,
      },
      data: updatedFields,
    })

    return updatedOrganization
  } catch (error) {
    toast.error("Error updating organization:", error)
    throw error
  }
}

export async function Addorganization(organizationData, userEmail) {
  try {
    if (!organizationData) {
      toast.error("organizationData is null or undefined")
    }
    const existingOrganization = await prisma.organization.findFirst({
      where: {
        name: {
          equals: organizationData.name,
          mode: "insensitive",
        },
      },
    })
    if (existingOrganization) {
      toast.error("Organization already exists.")
    }
    const createdOrganization = await prisma.organization.create({
      data: {
        ...organizationData,
        users: {
          connect: {
            email: userEmail,
          },
        },
      },
    })

    return createdOrganization
  } catch (error) {
    toast.error("Error in storing organization details:", error)
    throw error
  }
}

export async function fetchOrganizationName(email) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      organizations: {
        include: {
          users: {
            include: {
              notifications: true,
              userOrganizations: true,
            },
          },
        },
      },
    },
  })
  return user
}

export async function getAllOrganizations() {
  try {
    const organizations = await prisma.organization.findMany()
    return organizations
  } catch (error) {
    toast.error("Error fetching all organizations:", error)
    throw error
  }
}

export async function deleteOrganization(organizationId) {
  try {
    if (!organizationId) {
      toast.error("Organization ID is null or undefined")
    }

    const existingOrganization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        users: true,
      },
    })

    if (!existingOrganization) {
      toast.error("Organization not found")
    }
    await prisma.userOrganization.deleteMany({
      where: {
        organizationName: existingOrganization.name,
      },
    })

    const organisation = await prisma.organization.delete({
      where: {
        id: organizationId,
      },
    })

    return organisation
  } catch (error) {
    toast.error("Error deleting organization:", error)
    throw error
  }
}

export async function assignuser(name, email) {
  await prisma.organization.update({
    where: {
      name,
    },
    data: {
      users: {
        connect: {
          email,
        },
      },
    },
  })
}

export async function Adduserorganization(name, email, role) {
  await prisma.UserOrganization.create({
    data: {
      email,
      organizationName: name,
      role,
    },
  })
}
