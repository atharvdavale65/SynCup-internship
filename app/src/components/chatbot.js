import React, { useState, useRef, useEffect } from "react"
import { Input, Avatar, Card } from "@nextui-org/react"

import axios from "axios"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"

function Chatbot() {
  const [userInput, setUserInput] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const [errorMessage, setErrorMessage] = useState("")
  const { data: session } = useSession()
  const chatContainerRef = useRef()

  const handleUserInput = (e) => {
    setUserInput(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!userInput.trim()) {
      setErrorMessage("Blank messages are not allowed.")
      return
    }

    try {
      const response = await axios.get("http://localhost:5000/api/chatbot", {
        params: {
          user_input: userInput,
        },
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })

      const { data } = response

      const newMessage = {
        user: true,
        content: userInput,
      }

      const typingMessage = {
        user: false,
        content: "Typing...",
      }

      setChatHistory((prevHistory) => [
        ...prevHistory,
        newMessage,
        typingMessage,
      ])

      setTimeout(
        () => {
          const chatbotMessage = {
            user: false,
            content: data.message,
          }
          setChatHistory((prevHistory) => [
            ...prevHistory.slice(0, -1),
            chatbotMessage,
          ])
        },
        Math.min(Math.max(data.message.length * 30, 1500), 5000),
      )

      setUserInput("")
      setErrorMessage("")
    } catch (error) {
      toast.error("Error sending message")
    }
  }

  useEffect(() => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
  }, [chatHistory])

  const firstName = session?.user?.name.split(" ")[0]

  useEffect(() => {
    if (firstName) {
      const welcomeMessage = {
        user: false,
        content: `Hello ${firstName}! How may we assist you?`,
      }
      setChatHistory([welcomeMessage])
    }
  }, [firstName])

  useEffect(() => {
    const handleResize = () => {
      setUserInput("")
      setErrorMessage("")
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div style={{ backgroundColor: "#B39DDB" }} className="chatbot rounded-3xl">
      <div className="bg-[#B39DDB] text-white p-4 rounded-t-2xl">
        <div className="flex items-center flex-col">
          <div className="flex items-center">
            <Avatar
              src="https://i.pinimg.com/236x/cc/ba/5b/ccba5b85f22f65d6021128ed3e336ac6.jpg"
              size="large"
              className="rounded-full w-8 h-8 mr-2"
              alt="User avatar"
            />
            <span className="font-bold text-xl">Hello {firstName}👋</span>
          </div>
          <span className="text-xs">We are here to help</span>
        </div>
      </div>

      <Card
        className="max-w-[450px] h-[420px] overflow-hidden bg-white p-2 pt-0 flex flex-col shadow-lg bg-opacity-50 transition-all rounded-t-3xl no-scrollbar"
        style={{ margin: "0 auto", backgroundColor: "white" }}
      >
        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto no-scrollbar p-2 rounded-b-xxl"
          style={{ width: "100%", wordWrap: "break-word" }}
        >
          {chatHistory.map((entry, index) => (
            <div
              key={index}
              className={`mb-2 ${
                entry.user ? "flex justify-end" : "flex justify-start"
              }`}
            >
              {!entry.user && (
                <Avatar
                  src="https://i.pinimg.com/236x/cc/ba/5b/ccba5b85f22f65d6021128ed3e336ac6.jpg"
                  size="medium"
                  alt="Chatbot avatar"
                  className="w-6 h-6 rounded-full mr-2 mt-1"
                />
              )}

              <div
                className={`p-2 rounded-md ${
                  entry.user
                    ? "bg-[#683ab7] text-white text-center"
                    : "bg-white text-black border border-grey-100"
                } mt-1`}
                style={{ width: entry.user ? "100px" : "200px" }}
              >
                {entry.content}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center p-2 relative rounded-b-xl"
          style={{ marginTop: "auto", position: "sticky", bottom: 0 }}
        >
          <Input
            value={userInput}
            onChange={handleUserInput}
            className={`flex-grow p-2 rounded-lg ${
              userInput.length > 0 ? "border-blue-300" : "border-gray-300"
            } focus:outline-none focus:border-blue-500`}
            placeholder={!errorMessage ? "Ask us a question" : ""}
            style={{
              width: "100%",
              paddingRight: "2.5rem",
              display: "flex",
              alignItems: "center",
            }}
          />
          {!userInput.trim() && errorMessage && (
            <span className="text-xs text-red-500 absolute ml-2">
              {errorMessage}
            </span>
          )}
        </form>
      </Card>
    </div>
  )
}

export default Chatbot
