"use client"

import {
  CheckCircle as CircleCheckIcon,
  Info as InfoIcon,
  XCircle as OctagonXIcon,
  Warning as TriangleAlertIcon,
} from "@phosphor-icons/react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CoinLoader } from "@/components/ui/coin-loader"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <CoinLoader size={16} />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
