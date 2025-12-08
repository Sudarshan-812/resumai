"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordInput({ name = "password", placeholder = "••••••••" }: { name?: string, placeholder?: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={name}
        name={name}
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        required
        className={cn(
          "flex h-10 w-full border-none rounded-md px-3 py-2 text-sm pr-10",
          "bg-gray-50 dark:bg-zinc-800", // Light vs Dark Background
          "text-neutral-900 dark:text-white", // Light vs Dark Text
          "placeholder:text-neutral-400 dark:placeholder:text-neutral-600",
          "shadow-input transition duration-400",
          "focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      />
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}