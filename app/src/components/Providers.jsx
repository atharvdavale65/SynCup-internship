"use client"

import React from "react"
import { NextUIProvider } from "@nextui-org/react"
import { SessionProvider } from "next-auth/react"
import PropTypes from "prop-types"

import { ThemeProvider as NextThemesProvider } from "next-themes"

function Providers({ children }) {
  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <SessionProvider>{children}</SessionProvider>
      </NextThemesProvider>
    </NextUIProvider>
  )
}

Providers.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Providers
