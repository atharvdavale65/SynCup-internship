import React, { useState, useEffect } from "react"
import { Button, Textarea, Accordion, AccordionItem } from "@nextui-org/react"
import { HiOutlineViewList } from "react-icons/hi"
import { LiaHandPointRight } from "react-icons/lia"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import toast from "react-hot-toast"
import HelpData from "./Data/helpData.js"
import appConfig from "@/app.config.js"
import submitFeedback from "../../../server/feedback.js"

function DetailedInformation() {
  const boardid = useParams()
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [feedbackData, setFeedbackData] = useState({
    feedback: "",
  })
  const [feedbackError, setFeedbackError] = useState("")
  const [activeKey, setActiveKey] = useState(null)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const goToHome = () => {
    router.push(`/${boardid.organization}/home`)
  }
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }
  const handleItemClick = (item) => {
    setSelectedItem(item)
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFeedbackData({ ...feedbackData, [name]: value })
    const words = value.trim().split(/\s+/)
    const wordCount = words.length

    if (wordCount < 10) {
      setFeedbackError("Feedback should contain at least 10 words.")
    } else if (wordCount > 200) {
      setFeedbackError("Feedback should contain at most 200 words.")
    } else {
      setFeedbackError("")
    }
  }

  const handleSubmitFeedback = async () => {
    if (feedbackError || !feedbackData.feedback.trim()) {
      setFeedbackError("Feedback should contain between 10 and 200 words.")
      return
    }

    const words = feedbackData.feedback.trim().split(/\s+/)
    const wordCount = words.length

    if (wordCount < 10 || wordCount > 200) {
      setFeedbackError("Feedback should contain between 10 and 200 words.")
      return
    }

    try {
      await submitFeedback(feedbackData)
      setFeedbackData({ feedback: "" })
      setFeedbackSubmitted(true)
      setTimeout(() => setFeedbackSubmitted(false), 2000)
    } catch (error) {
      toast.error("Error in submitting feedback")
    }
  }

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const itemTitle = queryParams.get("itemTitle")
    if (itemTitle) {
      const selectedItemData = HelpData.find((item) => item.title === itemTitle)
      setSelectedItem(selectedItemData)
    } else {
      setSelectedItem(null)
    }
  }, [])
  useEffect(() => {
    const handleResize = () => {
      setIsDrawerOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])
  useEffect(() => {
    const handleClickOutside = (e) => {
      const textarea = document.getElementById("feedback-textarea")
      if (textarea && !textarea.contains(e.target)) {
        setFeedbackError("")
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])
  return (
    <div style={{ height: "100vh", overflow: "auto", scrollbarWidth: "none" }}>
      <div className="mt-5">
        <div className="flex justify-between items-center">
          <h5
            className="text-[#7754bd] mb-4 font-bold "
            style={{
              fontWeight: "bold",
              marginLeft: "20px",
              fontSize: "1.4rem",
            }}
          >
            Help and Support
          </h5>
          <div className="flex">
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
            <HiOutlineViewList
              className="h-7 w-7  cursor-pointer mt-2 mr-7"
              style={{ marginLeft: "10px" }}
              onClick={toggleDrawer}
            />
          </div>
        </div>
        <p className="mt-1px" style={{ marginLeft: "20px" }}>
          Welcome to {appConfig.PROJECT_NAME} Help and Support. Select an item
          from the menu to get detailed information.
        </p>
      </div>
      <div className="text-center flex">
        <div
          id="drawer-body-scrolling"
          className={`fixed top-[150px] right-0 z-40 h-screen p-4 transition-transform ${
            isDrawerOpen ? "" : "translate-x-full"
          } ${
            isDrawerOpen ? "mr-[2%]" : ""
          } bg-white w-[20rem] lg:w-[20rem] dark:bg border border-gray-300`}
          tabIndex="-1"
          aria-labelledby="drawer-body-scrolling-label"
          style={{
            position: "fixed",
            height: "80vh",
            overflow: "auto",
            scrollbarWidth: "none",
          }}
        >
          <div className="pb-4 border-b border-gray-300 w-full px-15">
            <h5
              id="drawer-body-scrolling-label"
              className="text-base font-semibold uppercase dark:text-gray-400 text-[#7754bd]"
            >
              Menu
            </h5>
            <Button
              type="button"
              data-drawer-hide="drawer-body-scrolling"
              aria-controls="drawer-body-scrolling"
              className="text-black bg-transparent hover:bg-gray-200 hover:text-gray-900 ml-5 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-0 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white dark:text-text"
              onClick={toggleDrawer}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </Button>
          </div>
          <div className="py-4 overflow-y-auto">
            <ul className="space-y-2 font-medium">
              {HelpData.map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="flex items-center p-2 text-black rounded-lg dark:text-white dark:hover:text-black hover:bg-gray-100 group"
                    style={{ fontSize: "17px" }}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="text-[#7754bd]">{item.Icon}</div>
                    <span className="ml-7">{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div>
        {selectedItem ? (
          <div className="ml-5" style={{ maxWidth: "calc(100vw - 240px)" }}>
            <h6
              className="text-[#7754bd] mb-2 font-bold mt-4"
              style={{ fontWeight: "bold", fontSize: "1.3rem" }}
            >
              {selectedItem.title}
            </h6>
            <p
              className="text-black mb-4 dark:text-white"
              style={{ fontSize: "17px" }}
            >
              {selectedItem.desc}
            </p>
            <div
              style={{ maxWidth: "100%" }}
              className="overflow-y-auto max-h-[32rem]  no-scrollbar"
            >
              <Accordion style={{ width: "calc(100% - 330px)" }}>
                {Object.entries(selectedItem.content).map(
                  ([key, value]) =>
                    selectedItem.title !== "Demo" && (
                      <AccordionItem
                        key={key}
                        title={
                          <div
                            className="flex items-center"
                            onClick={() =>
                              setActiveKey(activeKey === key ? null : key)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                setActiveKey(activeKey === key ? null : key)
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <LiaHandPointRight
                              className={`mr-2 text-[#7754bd] ${
                                activeKey === key ? "transform rotate-90" : ""
                              }`}
                            />
                            <span style={{ fontSize: "17px" }}>{key}</span>
                          </div>
                        }
                      >
                        <p
                          className="text-black dark:text-white"
                          style={{ fontSize: "15px" }}
                        >
                          {value}
                        </p>
                      </AccordionItem>
                    ),
                )}
              </Accordion>
            </div>
          </div>
        ) : (
          <p
            className="text-black dark:text-white "
            style={{ marginLeft: "20px" }}
          >
            No item selected. Please go back to the Help and Support page.
          </p>
        )}
        {selectedItem && selectedItem.title === "Demo" && (
          <div className="ml-5" style={{ maxWidth: "calc(100vw - 240px)" }}>
            <div className="video-wrapper mt-10">
              <iframe
                style={{ width: "45%", height: "300px" }}
                title="Demo Video"
                src={selectedItem.content["Demo Video"].url}
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        )}
        {selectedItem && selectedItem.title === "Feedbacks" && (
          <div
            className="mt-5 ml-7"
            style={{
              height: "100vh",
              overflow: "auto",
              scrollbarWidth: "none",
            }}
          >
            <div
              style={{
                maxWidth: "500px",
                marginRight: "5px",
                marginLeft: "5px",
                marginTop: "10px",
              }}
            >
              <Textarea
                id="feedback-textarea"
                placeholder="Feedback"
                name="feedback"
                maxRows={4}
                value={feedbackData.feedback}
                onChange={handleInputChange}
                fullWidth
                className="mb-3"
              />
              {feedbackError && <p className="text-red-500">{feedbackError}</p>}
              <Button
                onClick={handleSubmitFeedback}
                variant="contained"
                className="bg-[#7754bd] text-white"
              >
                Submit
              </Button>
              {feedbackSubmitted && (
                <p className="text-green-500">
                  Feedback submitted successfully!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default DetailedInformation
