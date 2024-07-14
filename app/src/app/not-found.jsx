import Link from "next/link"
import React from "react"

export default function ErrorPage() {
  return (
    <main className="grid h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-5xl font-bold text-purple-500">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-text">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600 dark:text-text">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-purple-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-300"
          >
            Go back home
          </Link>
          <Link
            href="/helpSupport"
            className="text-sm font-semibold text-gray-900 dark:text-text"
          >
            Contact support <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
