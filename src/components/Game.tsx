import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Player } from './Player';
import { Level } from './Level';
import { Physics } from './Physics';
import { useState } from 'react';

const Game = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);

    // Game state management
    const startGame = () => {
        setGameStarted(true);
        setScore(0);
    };

    return (
        <div className="w-full h-screen relative">
            {!gameStarted ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 text-white">
                    <h1 className="text-4xl mb-8 font-bold">Contra-Style Platformer</h1>
                    <button
                        onClick={startGame}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg text-xl transition-colors"
                    >
                        Start Game
                    </button>
                </div>
            ) : (
                <div className="absolute top-5 left-5 text-white z-10 bg-black/50 p-2 rounded">
                    Score: {score}
                </div>
            )}

            <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
                <ambientLight intensity={0.3} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />

                <Physics>
                    {gameStarted && (
                        <>
                            <Player incrementScore={() => setScore(s => s + 1)} />
                            <Level />
                        </>
                    )}
                </Physics>

                <OrbitControls enabled={!gameStarted} />
                <Stats />
            </Canvas>
        </div>
    );
};

export default Game; 