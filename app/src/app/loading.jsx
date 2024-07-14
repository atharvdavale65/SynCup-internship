import React from "react"

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <svg
        className="h-16 w-16 text-[#7754bd]"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: "rotate 2s linear infinite" }}
      >
        <path stroke="none" d="M0 0h24v24H0z" />
        <path d="M9 4.55a8 8 0 0 1 6 14.9m0 -4.45v5h5" />
        <path d="M11 19.95a8 8 0 0 1 -5.3 -12.8" strokeDasharray=".001 4.13" />
      </svg>

      <style>
        {`
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  )
}

export default Loading
