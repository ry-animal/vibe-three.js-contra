import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Player } from './Player';
import { Level } from './Level';
import { Physics } from './Physics';
import { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import BulletSprite from './BulletSprite';

// Shared types for game state
interface Projectile {
    id: number;
    position: THREE.Vector3;
    direction: number;
    isEnemy: boolean;
    createdAt: number;
}

interface Enemy {
    id: number;
    position: THREE.Vector3;
    direction: number;
    type: 'walker' | 'jumper' | 'shooter';
    jumpCooldown: number;
    shootCooldown: number;
    lastJumpTime: number;
    lastShootTime: number;
    health: number;
}

const Game = () => {
    // Game state
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);
    const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 1, 0));
    const [playerProjectiles, setPlayerProjectiles] = useState<Projectile[]>([]);
    const [enemyProjectiles, setEnemyProjectiles] = useState<Projectile[]>([]);
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [playerHealth, setPlayerHealth] = useState(3);
    const [gameOver, setGameOver] = useState(false);

    // Create a component that will update the projectiles
    const ProjectileUpdater = () => {
        useFrame((_state, delta) => {
            if (!gameStarted || gameOver) return;

            // Move enemy projectiles
            const projectileSpeed = 7;
            const newEnemyProjectiles = enemyProjectiles
                .map(projectile => {
                    const newPos = projectile.position.clone();
                    newPos.x += projectile.direction * projectileSpeed * delta;

                    return {
                        ...projectile,
                        position: newPos
                    };
                })
                .filter(projectile => {
                    // Remove projectiles that are too old or out of bounds
                    const age = (Date.now() - projectile.createdAt) / 1000;
                    return age < 3 && Math.abs(projectile.position.x) < 15;
                });

            setEnemyProjectiles(newEnemyProjectiles);
        });

        return null;
    };

    // Handle player projectile creation
    const handlePlayerShoot = useCallback((projectile: Projectile) => {
        setPlayerProjectiles(prev => [...prev, projectile]);
    }, []);

    // Handle enemy projectile creation
    const handleEnemyShoot = useCallback((projectile: Projectile) => {
        setEnemyProjectiles(prev => [...prev, projectile]);
    }, []);

    // Handle player taking damage
    const handlePlayerDamage = useCallback(() => {
        setPlayerHealth(prev => {
            const newHealth = prev - 1;
            if (newHealth <= 0) {
                setGameOver(true);
            }
            return newHealth;
        });
    }, []);

    // Handle enemy defeat
    const handleEnemyDefeat = useCallback((enemyId: number) => {
        setEnemies(prev => prev.filter(enemy => enemy.id !== enemyId));
        setScore(s => s + 10); // More points for defeating an enemy
    }, []);

    // Update player position (for collision detection)
    const updatePlayerPosition = useCallback((position: THREE.Vector3) => {
        setPlayerPosition(position);
    }, []);

    // Clean up projectiles when game ends
    useEffect(() => {
        if (gameOver) {
            // Keep projectiles visible for a short time before cleaning up
            const timer = setTimeout(() => {
                setPlayerProjectiles([]);
                setEnemyProjectiles([]);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [gameOver]);

    // Game state management
    const startGame = () => {
        // Initialize game state
        setGameStarted(true);
        setScore(0);
        setPlayerHealth(3);
        setGameOver(false);
        setPlayerProjectiles([]);
        setEnemyProjectiles([]);
        // Initialize enemies - this would normally be done by the Level component
        // but we're lifting the state up to the Game component
        setEnemies([
            {
                id: 1,
                position: new THREE.Vector3(5, 1, 0),
                direction: -1,
                type: 'walker',
                jumpCooldown: 0,
                shootCooldown: 0,
                lastJumpTime: 0,
                lastShootTime: 0,
                health: 1
            },
            {
                id: 2,
                position: new THREE.Vector3(-3, 4.5, 0),
                direction: 1,
                type: 'jumper',
                jumpCooldown: 2,
                shootCooldown: 0,
                lastJumpTime: 0,
                lastShootTime: 0,
                health: 1
            },
            {
                id: 3,
                position: new THREE.Vector3(4, 6.5, 0),
                direction: -1,
                type: 'shooter',
                jumpCooldown: 0,
                shootCooldown: 3,
                lastJumpTime: 0,
                lastShootTime: 0,
                health: 2 // Shooter has more health
            },
        ]);
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
            ) : gameOver ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 text-white">
                    <h1 className="text-4xl mb-2 font-bold">Game Over</h1>
                    <p className="text-2xl mb-8">Your score: {score}</p>
                    <button
                        onClick={startGame}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg text-xl transition-colors"
                    >
                        Play Again
                    </button>
                </div>
            ) : (
                <div className="absolute top-5 left-5 text-white z-10 bg-black/50 p-2 rounded">
                    <div>Score: {score}</div>
                    <div>Health: {playerHealth}</div>
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
                    {gameStarted && !gameOver && (
                        <>
                            <ProjectileUpdater />
                            <Player
                                incrementScore={() => setScore(s => s + 1)}
                                onShoot={handlePlayerShoot}
                                onTakeDamage={handlePlayerDamage}
                                onPositionUpdate={updatePlayerPosition}
                                health={playerHealth}
                                enemyProjectiles={enemyProjectiles}
                                enemies={enemies}
                            />
                            <Level
                                playerPosition={playerPosition}
                                playerProjectiles={playerProjectiles}
                                setEnemyProjectiles={handleEnemyShoot}
                                enemies={enemies}
                                setEnemies={setEnemies}
                                onEnemyDefeat={handleEnemyDefeat}
                            />

                            {/* Enemy projectiles */}
                            {enemyProjectiles.map((projectile) => (
                                <BulletSprite
                                    key={projectile.id}
                                    position={projectile.position}
                                    direction={projectile.direction}
                                    isEnemy={true}
                                />
                            ))}
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