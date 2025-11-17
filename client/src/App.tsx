import "@fontsource/inter";
import { Game } from "./components/game/Game";
import { SoundManager } from "./components/game/SoundManager";

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Game />
      <SoundManager />
    </div>
  );
}

export default App;
