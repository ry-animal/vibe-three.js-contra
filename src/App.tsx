import { KeyboardControls } from '@react-three/drei';
import Game from './components/Game';

// Define key mappings for keyboard controls
enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
  shoot = 'shoot',
}

function App() {
  return (
    <KeyboardControls
      map={[
        { name: Controls.forward, keys: ['ArrowUp', 'w', 'W'] },
        { name: Controls.backward, keys: ['ArrowDown', 's', 'S'] },
        { name: Controls.left, keys: ['ArrowLeft', 'a', 'A'] },
        { name: Controls.right, keys: ['ArrowRight', 'd', 'D'] },
        { name: Controls.jump, keys: ['Space'] },
        { name: Controls.shoot, keys: ['KeyX', 'x', 'Control', 'z', 'Z'] },
      ]}
    >
      <Game />
    </KeyboardControls>
  );
}

export default App;
