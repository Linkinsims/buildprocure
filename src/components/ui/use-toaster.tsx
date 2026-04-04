"use client"

import { Toaster as ToasterComponent } from "@/components/toaster"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return <ToasterComponent toasts={toasts} />
}