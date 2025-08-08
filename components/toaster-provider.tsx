"use client"
import { Toaster } from "react-hot-toast"
export default function ToasterProvider() {
  return <Toaster
  position="top-right"
  toastOptions={{
    style: {
      background: "var(--background)",
      color: "var(--foreground)",
    },
    className: "dark:bg-zinc-900 dark:text-white bg-white text-black",
  }}
/>
}
