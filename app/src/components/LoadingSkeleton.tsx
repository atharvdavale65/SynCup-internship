"use client"

import React from "react"

import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

function LoadingSkeleton() {
  return <Skeleton count={0} />
}
export default LoadingSkeleton
