import { useGameStore } from '@/store/gameStore'
import StartScreen from '@/pages/StartScreen'
import ScenarioSelect from '@/pages/ScenarioSelect'
import GameScreen from '@/pages/GameScreen'
import ResultScreen from '@/pages/ResultScreen'

export type Screen = 'start' | 'scenario' | 'game' | 'result'

export default function App() {
  const screen = useGameStore((s) => s.screen)

  return (
    <div className="min-h-screen bg-void text-white">
      {screen === 'start' && <StartScreen />}
      {screen === 'scenario' && <ScenarioSelect />}
      {screen === 'game' && <GameScreen />}
      {screen === 'result' && <ResultScreen />}
    </div>
  )
}

