import { useGameStore } from '@/store/gameStore'
import LandingScreen from '@/pages/LandingScreen'
import StartScreen from '@/pages/StartScreen'
import ScenarioSelect from '@/pages/ScenarioSelect'
import GameScreen from '@/pages/GameScreen'
import ResultScreen from '@/pages/ResultScreen'

export type Screen = 'landing' | 'start' | 'scenario' | 'game' | 'result'

export default function App() {
  const screen = useGameStore((s) => s.screen)

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {screen === 'landing' && <LandingScreen />}
      {screen === 'start' && <StartScreen />}
      {screen === 'scenario' && <ScenarioSelect />}
      {screen === 'game' && <GameScreen />}
      {screen === 'result' && <ResultScreen />}
    </div>
  )
}
