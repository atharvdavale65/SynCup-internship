"use client"

import React, { useEffect, useState } from "react"
import { MdRotateLeft } from "react-icons/md"
import { useSession } from "next-auth/react"
import { Button, Card, CardBody } from "@nextui-org/react"
import { IoIosArrowForward } from "react-icons/io"
import toast, { Toaster } from "react-hot-toast"
import Link from "next/link"
import CreateOrganization from "@/src/components/CreateOrganization"
import { fetchOrganizationName } from "@/server/organization"
import appConfig from "@/app.config"
import Loader from "@/src/components/Loader"

function selectorganization() {
  const { data: session } = useSession()
  const userEmail = session?.user?.email
  const [organizationname, setorganizationname] = useState([])
  const [orgOpenModal, setOrgOpenModal] = useState(false)
  const [load, setLoad] = useState(true)
  const [update, setupdate] = useState(false)
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        if (!userEmail) return
        const orgNameeee = await fetchOrganizationName(userEmail)
        setorganizationname(orgNameeee.organizations)
        setLoad(false)
        setupdate(false)
      } catch (error) {
        toast.error("Error fetching organization")
      }
    }
    fetchOrganization()
  }, [userEmail, update])
  const handleOrgCloseModal = () => {
    setOrgOpenModal(false)
  }

  return (
    <div>
      {load ? (
        <Loader />
      ) : (
        <div
          className="flex justify-center items-center"
          style={{
            backgroundColor: "#eef2f6",
            minHeight: "100vh",
            width: "100vw",
          }}
        >
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <div className="md:w-1/4 p-6 bg-gray-50 rounded-md">
            <div className="text-center flex items-center justify-center">
              <MdRotateLeft style={{ color: "#673AB7", fontSize: "2rem" }} />
              <h2
                className="text-3xl font-bold text-black ml-1"
                style={{ fontSize: "24px", fontFamily: "Roboto" }}
              >
                {appConfig.PROJECT_NAME}
              </h2>
            </div>

            <div
              className="text-center mb-3 font-bold "
              style={{
                fontFamily: "Roboto",
                color: "#673AB7",
                fontSize: "24px",
              }}
            >
              Choose Organization
            </div>

            <div className="space-y-2 max-h-64 overflow-y-scroll no-scrollbar justify-centre">
              {organizationname.map((org) => (
                <Link
                  href={`/${org.name}/home`}
                  passHref
                  legacyBehavior
                  key={org.name}
                >
                  <a
                    className="cursor-pointer"
                    style={{ textDecoration: "none", height: "100%" }}
                  >
                    <Card shadow="sm" className="m-2" key={org.name}>
                      <CardBody>
                        <div className="flex justify-between">
                          {org.name}
                          <IoIosArrowForward className="mt-1" />
                        </div>
                      </CardBody>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
            <div className="text-center justify-center mt-4">
              <Button
                color="secondary"
                onClick={() => setOrgOpenModal(true)}
                size="sm"
              >
                Create new organization
              </Button>
            </div>
          </div>
          <CreateOrganization
            isOpen={orgOpenModal}
            handleOrgCloseModal={handleOrgCloseModal}
            setupdate={setupdate}
          />
        </div>
      )}
    </div>
  )
}

export default selectorganization
