import { useEffect, useMemo, useState } from 'react'
import {
  bumpGlobalReminderCount,
  cookwareConfig,
  fetchGlobalReminderCount,
  formatCompactNumber,
  formatCompactUsd,
  getCurrentDay,
  getHolderCount,
  getMarketCapProgress,
  getTotalHoodDistributed,
  MarketCapSnapshot,
  StatValue,
  VladStatus as VladStatusType,
} from './config'
import { useLocalStorage } from './hooks/useLocalStorage'
import Header from './components/Header'
import Footer from './components/Footer'
import Counter from './components/Counter'
import ProgressBar from './components/ProgressBar'
import VladStatus from './components/VladStatus'
import ReminderCard from './components/ReminderCard'
import LoreTimeline, { TimelineEntry } from './components/LoreTimeline'
import TweetEmbed from './components/TweetEmbed'
import Faq from './components/Faq'

const TIMELINE: TimelineEntry[] = [
  { day: 1, note: 'First reminder.' },
  { day: 7, note: 'Still reminding Vlad.' },
  { day: 30, note: 'Still reminding Vlad.' },
  { day: 100, note: 'You get the idea.' },
]

export default function App() {
  const day = useMemo(() => getCurrentDay(cookwareConfig.launchDate), [])

  // Global click count — shared across every visitor, persisted server-side
  // via a free counter service (see fetchGlobalReminderCount/bumpGlobalReminderCount).
  const [reminders, setReminders] = useState(cookwareConfig.startingReminderCount)
  const [pitches] = useLocalStorage('cookware_pitches', cookwareConfig.startingPitchCount)
  const [vladStatus, setVladStatus] = useLocalStorage<VladStatusType>(
    'cookware_vlad_status',
    cookwareConfig.vladStatus,
  )
  const [marketCap, setMarketCap] = useState<MarketCapSnapshot>({
    progress: cookwareConfig.placeholderProgress,
    currentMarketCap: null,
    isLive: false,
  })
  const [holders, setHolders] = useState<StatValue>({ value: null, isLive: false })
  const [hoodDistributed, setHoodDistributed] = useState<StatValue>({ value: null, isLive: false })

  useEffect(() => {
    let cancelled = false
    fetchGlobalReminderCount().then((count) => {
      if (!cancelled) setReminders(count)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const poll = () => {
      getMarketCapProgress().then((snapshot) => {
        if (!cancelled) setMarketCap(snapshot)
      })
    }

    poll() // fetch immediately on mount
    const id = setInterval(poll, cookwareConfig.pollIntervalMs)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const poll = () => {
      getHolderCount().then((snapshot) => {
        if (!cancelled) setHolders(snapshot)
      })
      getTotalHoodDistributed().then((snapshot) => {
        if (!cancelled) setHoodDistributed(snapshot)
      })
    }

    poll() // fetch immediately on mount
    const id = setInterval(poll, cookwareConfig.pollIntervalMs)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const handleRemind = () => {
    // Bump immediately so the click feels instant, then reconcile with
    // whatever the server actually recorded (handles concurrent clickers).
    setReminders((n) => n + 1)
    bumpGlobalReminderCount().then((confirmed) => {
      if (confirmed !== null) setReminders(confirmed)
    })
  }
  const toggleVladDemo = () =>
    setVladStatus((s) => (s === 'pitched' ? 'not_pitched' : 'pitched'))

  const shareMessage = `Day ${day} of reminding Vlad to pitch Cookware.\n\nThe question isn't if he mentions it.\n\nIt's how many reminders it takes to get Cookware to $1B.`

  const statsSubtitle = holders.error
    ? holders.error
    : hoodDistributed.error
      ? hoodDistributed.error
      : holders.isLive && hoodDistributed.isLive
        ? hoodDistributed.truncated
          ? 'Live from Robinhood Chain (Blockscout) · recent distribution history'
          : 'Live from Robinhood Chain (Blockscout)'
        : 'Loading on-chain data…'

  return (
    <div id="top" className="min-h-screen">
      <Header onRemind={handleRemind} />

      {/* HERO */}
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-14 sm:pt-20">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
            COOKWARE PAIRED WITH HOOD
          </h1>
          <p className="mt-3 font-display text-lg font-semibold text-ink/70 sm:text-xl">
            Hold COOKWARE, get HOOD.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <TweetEmbed tweetUrl={cookwareConfig.vladTweetUrl} />
          </div>
          <h2 className="mt-8 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Remind Vlad to pitch Cookware.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink/70">
            The question isn't if he mentions it. It's how many reminders it takes to
            get Cookware to $1B.
          </p>
          <button
            id="remind"
            onClick={handleRemind}
            className="mt-8 rounded-full border-[3px] border-ink bg-clay px-8 py-4 font-display text-lg font-bold text-cream shadow-thick transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            REMIND VLAD
          </button>
        </div>
      </section>

      {/* LIVE COUNTERS */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="grid gap-5 sm:grid-cols-3">
          <Counter label="REMINDERS TO VLAD" value={reminders} accent />
          <Counter label="PITCHES MADE" value={pitches} />
          <Counter label="GOAL" value={cookwareConfig.targetMarketCap} formatValue={formatCompactUsd} />
        </div>
      </section>

      {/* $1B PROGRESS */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="rounded-3xl border-[3px] border-ink bg-white p-8 shadow-thick sm:p-12">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">COOKWARE → $1B</h2>
          <p className="mt-2 text-sm text-ink/60">
            {marketCap.isLive
              ? `Live from DexScreener · $${Math.round(
                  marketCap.currentMarketCap ?? 0,
                ).toLocaleString()} market cap`
              : marketCap.error ?? 'Symbolic progress marker — not a live feed yet.'}
          </p>
          <div className="mt-6">
            <ProgressBar progress={marketCap.progress} fromLabel="$0" toLabel="$1,000,000,000" />
          </div>
        </div>
      </section>

      {/* LIVE STATS */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">COOKWARE ON-CHAIN</h2>
        <p className="mt-2 text-sm text-ink/60">{statsSubtitle}</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Counter label="HOLDERS" value={holders.value ?? 0} accent />
          <Counter
            label="$HOOD AIRDROPPED"
            value={hoodDistributed.value ?? 0}
            formatValue={formatCompactNumber}
          />
        </div>
      </section>

      {/* VLAD STATUS */}
      <section id="tracker" className="mx-auto max-w-5xl px-5 pb-16">
        <h2 className="mb-5 font-display text-3xl font-bold sm:text-4xl">
          THE VLAD PITCH TRACKER
        </h2>
        <VladStatus status={vladStatus} onToggleDemo={toggleVladDemo} />
      </section>

      {/* LORE */}
      <section id="lore" className="border-y-[3px] border-ink bg-ink py-16 text-cream">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">THE LORE</h2>
          <p className="mt-8 whitespace-pre-line text-left text-lg leading-relaxed text-cream/90 sm:text-xl">
            {`In the 1990s, Bulgaria faced severe inflation that eventually turned into hyperinflation.

Vlad Tenev's grandfather didn't trust the rapidly collapsing currency. Instead, he converted his salary and pension into copper cookware.

He accumulated so many pots and pans that, as Vlad later recalled, opening the closet could send copper cookware crashing onto the floor.

For his grandfather, cookware wasn't just something to cook with.

It was a store of wealth.

Decades later, Vlad co-founded Robinhood and began talking about the future of tokenized assets.

And then came the line that changed everything:

Vlad said he had forgotten to pitch tokenized cookware.

Most people heard a joke.

We saw a story coming full circle.

His grandfather once stored wealth in cookware.

Now the world is tokenizing assets.

Maybe Vlad didn't forget.

Maybe he just needed a reminder.`}
          </p>
          <div className="mx-auto mt-10 h-px w-16 bg-cream/30" />
          <p className="mt-10 whitespace-pre-line text-center font-display text-xl leading-relaxed sm:text-2xl">
            {`Day 1 starts the clock.\n\nEvery reminder gets counted.\nEvery pitch gets counted.\n\nAnytime Vlad remembers to pitch Cookware, the counter doesn't stop.\n\nThe mission simply enters its next chapter.`}
          </p>
        </div>
      </section>

      {/* DAILY REMINDER / SHARE CARD */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <ReminderCard day={day} reminders={reminders} pitches={pitches} shareMessage={shareMessage} />
      </section>

      {/* TIMELINE */}
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="mb-8 font-display text-3xl font-bold sm:text-4xl">THE TIMELINE</h2>
        <LoreTimeline entries={TIMELINE} currentDay={day} />
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="mb-8 text-center font-display text-3xl font-bold sm:text-4xl">FAQ</h2>
        <Faq />
      </section>

      <Footer />
    </div>
  )
}
