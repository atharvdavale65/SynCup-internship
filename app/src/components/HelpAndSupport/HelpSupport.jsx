import React, { useState } from "react"
import { Button, Input, Card } from "@nextui-org/react"
import { AiOutlineSearch } from "react-icons/ai"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import PropTypes from "prop-types"
import HelpData from "./Data/helpData.js"

function HelpSupport({ handleLinkClick }) {
  const boardid = useParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const filteredData = HelpData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const goToHome = () => {
    router.push(`/${boardid.organization}/home`)
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100vh",
        paddingX: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <div
        style={{
          overflowY: "auto",
          maxHeight: "90vh",
          scrollbarWidth: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5
            className="text-[#7754bd] mb-4 font-bold mt-1"
            style={{
              fontWeight: "bold",
              marginLeft: "20px",
              fontSize: "1.4rem",
            }}
          >
            Help and Support
          </h5>
          <div style={{ marginLeft: "auto" }}>
            <div
              onClick={goToHome}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  goToHome()
                }
              }}
              role="button"
              tabIndex={0}
              style={{ cursor: "pointer" }}
            >
              <Link href={`/${boardid.organization}/home`}>
                <Button
                  variant="contained"
                  className="bg-[#7754bd] text-white mt-2 lg:mt-0 dark:bg-700 dark:text-black"
                  style={{
                    marginLeft: "auto",
                    marginRight: "10px",
                  }}
                >
                  Go to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div>
          <h6
            className="mb-4  font-bold text-center "
            style={{ fontWeight: "bold", fontSize: "1.2rem" }}
          >
            How can we help you?
          </h6>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="mt-4"
          >
            <Input
              isClearable
              type="text"
              label="Search here"
              className="md:w-96"
              style={{ width: "900px" }}
              startContent={
                <span style={{ marginRight: "5px" }}>
                  <AiOutlineSearch style={{ fontSize: "1.2em" }} />
                </span>
              }
              onClear={() => setSearchQuery("")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 ">
          {filteredData.map((item, index) => (
            <div key={index} className="flex justify-center">
              <Card style={{ width: "350px" }}>
                <div className="flex justify-between items-center p-4 h-full">
                  <div style={{ width: "100%" }}>
                    <h6
                      className="text-1xl font-bold text-[#7754bd] mb-2"
                      style={{ fontWeight: "bold", fontSize: "1.2rem" }}
                    >
                      {item.title}
                    </h6>
                    <p>{item.desc}</p>
                    {item.link && (
                      <button
                        type="button"
                        onClick={() => handleLinkClick(item.title)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleLinkClick(item.title)
                          }
                        }}
                      >
                        {" "}
                        <span className="text-[#7754bd] underline cursor-pointer">
                          {item.linkText || "Read More"}
                        </span>
                      </button>
                    )}
                    {item.title === "Contact Us" && (
                      <div>
                        {item.email && (
                          <p>
                            <a
                              href={`mailto:${item.email}`}
                              className="text-[#7754bd] underline"
                            >
                              {item.email}
                            </a>
                          </p>
                        )}
                        {item.phone && (
                          <p>
                            <a
                              href={`tel:${item.phone}`}
                              className="text-[#7754bd] underline"
                            >
                              {item.phone}
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="hover:scale-125 transition-transform text-[#7754bd]">
                    {item.Icon}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

HelpSupport.propTypes = {
  handleLinkClick: PropTypes.func.isRequired,
}

export default HelpSupport
