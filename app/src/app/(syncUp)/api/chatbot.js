import axios from "axios"

export default async function handler(req, res) {
  const { userInput } = req.body

  try {
    const response = await axios.get("http://localhost:5000/api/chatbot", {
      userInput,
    })

    const { data } = response
    res.status(200).json({ message: data.message })
  } catch (error) {
    res.status(500).json({ message: "Internal server error" })
  }
}
