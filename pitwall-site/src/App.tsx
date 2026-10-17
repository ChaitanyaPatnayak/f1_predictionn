import { useEffect, useState } from 'react'
import { LightsOutHero } from '@/components/sections/lights-out-hero'
import { Ticker } from '@/components/ticker'
import { Nav } from '@/components/nav'
import { Legal } from '@/components/legal'
import { StatsBand } from '@/components/sections/stats-band'
import { Predictor } from '@/components/sections/predictor'
import { Myths } from '@/components/sections/myths'
import { Interlude } from '@/components/sections/interlude'
import { ABLab } from '@/components/sections/ab-lab'
import { History } from '@/components/sections/history'
import { Drivers } from '@/components/sections/drivers'
import { Nations } from '@/components/sections/nations'
import { TitleFight } from '@/components/sections/title-fight'
import { Circuits } from '@/components/sections/circuits'
import { Footer } from '@/components/sections/footer'
import { Dynasties } from '@/components/sections/dynasties'
import { AeroLab } from '@/components/sections/aero-lab'
import { Arcade } from '@/components/sections/arcade'

type Route = 'home' | 'privacy' | 'terms'
const routeFromHash = (): Route => (location.hash === '#privacy' ? 'privacy' : location.hash === '#terms' ? 'terms' : 'home')

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)

  useEffect(() => {
    const onHash = () => {
      const next = routeFromHash()
      setRoute((prev) => {
        if (prev !== next) window.scrollTo(0, 0)
        return next
      })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (route !== 'home') {
    return (
      <>
        <Nav />
        <Legal page={route} />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Nav />
      <main>
        <LightsOutHero />
        <Ticker />
        <StatsBand />
        <Predictor />
        <Myths />
        <Interlude />
        <ABLab />
        <History />
        <Dynasties />
        <Drivers />
        <Nations />
        <TitleFight />
        <AeroLab />
        <Circuits />
        <Arcade />
      </main>
      <Footer />
    </>
  )
}
