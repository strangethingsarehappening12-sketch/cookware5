import CopyReminderButton from './CopyReminderButton'

interface ReminderCardProps {
  day: number
  reminders: number
  pitches: number
  shareMessage: string
}

export default function ReminderCard({ day, reminders, pitches, shareMessage }: ReminderCardProps) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border-[3px] border-ink bg-white p-8 shadow-thick sm:p-12">
      <h3 className="font-display text-6xl font-bold sm:text-7xl">DAY {day}</h3>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border-2 border-ink px-4 py-3 text-center">
          <p className="font-display text-2xl font-bold">{reminders}</p>
          <p className="font-mono text-[11px] text-ink/60">REMINDER{reminders === 1 ? '' : 'S'}</p>
        </div>
        <div className="rounded-xl border-2 border-ink px-4 py-3 text-center">
          <p className="font-display text-2xl font-bold">{pitches}</p>
          <p className="font-mono text-[11px] text-ink/60">PITCH{pitches === 1 ? '' : 'ES'}</p>
        </div>
      </div>

      <p className="mt-6 font-display text-xl font-semibold sm:text-2xl">
        Vlad, it's time to pitch Cookware.
      </p>

      <div className="mt-6">
        <CopyReminderButton message={shareMessage} />
      </div>
    </div>
  )
}
