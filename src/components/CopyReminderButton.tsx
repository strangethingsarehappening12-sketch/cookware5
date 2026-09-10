import { useState } from 'react'

interface CopyReminderButtonProps {
  message: string
}

export default function CopyReminderButton({ message }: CopyReminderButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message)
    } catch {
      // Clipboard API unavailable — fall back silently in demo mode
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleCopy}
        className="rounded-full border-[3px] border-ink bg-ink px-6 py-3 font-display text-sm font-semibold text-cream shadow-thickSm transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        COPY TODAY'S REMINDER
      </button>
      {copied && (
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 rounded-full border-2 border-ink bg-clay px-3 py-1 font-mono text-xs text-cream shadow-thickSm">
          Copied!
        </span>
      )}
    </div>
  )
}
