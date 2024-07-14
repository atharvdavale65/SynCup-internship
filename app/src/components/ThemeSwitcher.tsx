"use client"

import { useTheme } from "next-themes"
import React, { useEffect, useState } from "react"
import { FiSun, FiMoon } from "react-icons/fi"
import Image from "next/image"

function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)

  const { setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted)
    return (
      <Image
        src="data:image/svg+xml;base64,PHN2ZyBzdHJva2U9IiNGRkZGRkYiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMCIgdmlld0JveD0iMCAwIDI0IDI0IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB4PSIyIiB5PSIyIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSIyIj48L3JlY3Q+PC9zdmc+Cg=="
        width={36}
        height={36}
        sizes="36x36"
        alt="Loading Light/Dark Toggle"
        priority={false}
        title="Loading Light/Dark Toggle"
      />
    )
  const iconStyle = {
    borderRadius: "6px",
    color: "#7754bd",
    backgroundColor: "#ede7f6",
    padding: "6px",
    cursor: "pointer",
    width: "38px",
    height: "40px",
    transition: "background 0.3s ease",
  }
  const darkiconStyle = {
    borderRadius: "6px",
    color: "#000",
    backgroundColor: "#B196F4",
    padding: "6px",
    cursor: "pointer",
    width: "38px",
    height: "40px",
    transition: "background 0.3s ease",
  }
  if (resolvedTheme === "dark") {
    return <FiSun onClick={() => setTheme("light")} style={darkiconStyle} />
  }

  if (resolvedTheme === "light") {
    return <FiMoon onClick={() => setTheme("dark")} style={iconStyle} />
  }
}
export default ThemeSwitcher
