"use client"

import React from "react"
import { useRouter, useParams } from "next/navigation"
import HelpSupport from "@/src/components/HelpAndSupport/HelpSupport"

function Page() {
  const router = typeof window !== "undefined" ? useRouter() : null
  const boardid = useParams()
  const handleLinkClick = (itemTitle: string | number | boolean) => {
    router.push(
      `/${boardid.organization}/detailedinformation?itemTitle=${encodeURIComponent(itemTitle)}`,
    )
  }

  return (
    <div>
      <HelpSupport handleLinkClick={handleLinkClick} />
    </div>
  )
}

export default Page
