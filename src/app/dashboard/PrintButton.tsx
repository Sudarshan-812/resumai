"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-black text-sm font-bold rounded-lg transition-colors shadow-lg shadow-white/5"
    >
      <Printer className="w-4 h-4" /> 
      <span className="hidden sm:inline">Print Report</span>
    </button>
  );
}