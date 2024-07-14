import React from "react"
import Cards from "@/src/components/cards"

function page(params) {
  const { id } = params.params
  return (
    <div>
      <Cards boardId={id} />
    </div>
  )
}
export default page
