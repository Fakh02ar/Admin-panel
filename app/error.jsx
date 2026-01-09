"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error for debugging
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter">Something went wrong!</h1>
        <p className="mt-4 text-lg text-muted-foreground">{error.message || "An unexpected error occurred"}</p>
        <div className="mt-8 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => reset()}>
            Try again
          </Button>
          <Button onClick={() => (window.location.href = "/")}>Go to Home</Button>
        </div>
      </div>
    </div>
  )
}
