import { Box } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useState } from 'react';
import EnemySprite from './EnemySprite';
import BulletSprite from './BulletSprite';
import ExplosionEffect from './ExplosionEffect';

interface Platform {
    position: [number, number, number];
    size: [number, number, number];
    color: string;
}

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

interface LevelProps {
    playerPosition: THREE.Vector3;
    playerProjectiles: Projectile[];
    setEnemyProjectiles: (projectile: Projectile) => void;
    enemies: Enemy[];
    setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
    onEnemyDefeat: (enemyId: number) => void;
}

export const Level = ({
    playerProjectiles,
    setEnemyProjectiles,
    enemies,
    setEnemies,
    onEnemyDefeat
}: LevelProps) => {
    // Platform data structure
    const platforms: Platform[] = [
        { position: [0, -0.5, 0], size: [10, 1, 3], color: 'gray' },
        { position: [-4, 2, 0], size: [2, 0.5, 3], color: 'brown' },
        { position: [0, 4, 0], size: [2, 0.5, 3], color: 'brown' },
        { position: [4, 6, 0], size: [2, 0.5, 3], color: 'brown' },
    ];

    // State for explosions
    const [explosions, setExplosions] = useState<{ id: number, position: THREE.Vector3 }[]>([]);

    // Enemy movement and behavior system
    useFrame((_state, delta) => {
        const currentTime = Date.now() / 1000; // Current time in seconds
        const gravity = 9.8;
        const moveSpeed = 2;
        const jumpForce = 5;

        // Update enemies
        const newEnemies = enemies.map(enemy => {
            const newPos = enemy.position.clone();
            let newDirection = enemy.direction;
            let newLastJumpTime = enemy.lastJumpTime;
            let newLastShootTime = enemy.lastShootTime;

            // Handle horizontal movement
            newPos.x += enemy.direction * moveSpeed * delta;

            // Reverse direction if reaching platform edges
            if (Math.abs(newPos.x) > 7) {
                newDirection = -enemy.direction;
            }

            // Handle jumping for jumper enemies
            if (enemy.type === 'jumper' &&
                enemy.jumpCooldown > 0 &&
                currentTime - enemy.lastJumpTime > enemy.jumpCooldown) {
                newPos.y += jumpForce * delta;
                newLastJumpTime = currentTime;
            }

            // Apply gravity
            if (newPos.y > 0.5) { // If not on the ground
                newPos.y -= gravity * delta;
            }

            // Ensure enemies don't fall below their platforms
            // This is a simplification - in a real game you'd do proper collision detection
            if (enemy.type === 'walker' && newPos.y < 1) {
                newPos.y = 1;
            } else if (enemy.type === 'jumper' && newPos.y < 4.5) {
                newPos.y = 4.5;
            } else if (enemy.type === 'shooter' && newPos.y < 6.5) {
                newPos.y = 6.5;
            }

            // Handle shooting for shooter enemies
            if (enemy.type === 'shooter' &&
                enemy.shootCooldown > 0 &&
                currentTime - enemy.lastShootTime > enemy.shootCooldown) {
                createProjectile(enemy);
                newLastShootTime = currentTime;
            }

            return {
                ...enemy,
                position: newPos,
                direction: newDirection,
                lastJumpTime: newLastJumpTime,
                lastShootTime: newLastShootTime
            };
        });

        setEnemies(newEnemies);

        // Check player projectile collisions with enemies
        playerProjectiles.forEach(projectile => {
            enemies.forEach(enemy => {
                // Calculate distance between projectile and enemy
                const distance = projectile.position.distanceTo(enemy.position);

                // If collision detected
                if (distance < 0.8) {
                    // Create explosion effect
                    setExplosions(prev => [
                        ...prev,
                        { id: Date.now(), position: enemy.position.clone() }
                    ]);

                    // Handle enemy getting hit
                    handleEnemyHit(enemy.id);
                }
            });
        });
    });

    // Function to create a new enemy projectile
    const createProjectile = (enemy: Enemy) => {
        const newProjectile: Projectile = {
            id: Date.now(), // Use timestamp as a simple unique ID
            position: new THREE.Vector3(
                enemy.position.x,
                enemy.position.y,
                enemy.position.z
            ),
            direction: enemy.direction,
            isEnemy: true,
            createdAt: Date.now()
        };

        setEnemyProjectiles(newProjectile);
    };

    // Handle enemy being hit by player projectile
    const handleEnemyHit = (enemyId: number) => {
        setEnemies(prevEnemies =>
            prevEnemies.map(enemy => {
                if (enemy.id === enemyId) {
                    const newHealth = enemy.health - 1;

                    // If enemy is defeated
                    if (newHealth <= 0) {
                        setTimeout(() => onEnemyDefeat(enemyId), 0);
                        return enemy; // Will be filtered out by the Game component
                    }

                    // Enemy still alive, reduce health
                    return {
                        ...enemy,
                        health: newHealth
                    };
                }
                return enemy;
            })
        );
    };

    // Handle removing an explosion after animation completes
    const handleExplosionComplete = (id: number) => {
        setExplosions(prev => prev.filter(exp => exp.id !== id));
    };

    return (
        <group>
            {/* Background */}
            <mesh position={[0, 10, -5]} receiveShadow>
                <planeGeometry args={[30, 20]} />
                <meshStandardMaterial color="#87CEEB" />
            </mesh>

            {/* Ground and platforms */}
            {platforms.map((platform, i) => (
                <Box
                    key={i}
                    position={platform.position}
                    args={platform.size}
                    receiveShadow
                    castShadow
                >
                    <meshStandardMaterial color={platform.color} />
                </Box>
            ))}

            {/* Enemies */}
            {enemies.map((enemy) => (
                <EnemySprite
                    key={enemy.id}
                    position={enemy.position}
                    direction={enemy.direction}
                    type={enemy.type}
                    isJumping={enemy.type === 'jumper'}
                    isShooting={enemy.type === 'shooter' && Date.now() / 1000 - enemy.lastShootTime < 0.2}
                    useGreenTheme={true}
                />
            ))}

            {/* Player projectiles */}
            {playerProjectiles.map((projectile) => (
                <BulletSprite
                    key={projectile.id}
                    position={projectile.position}
                    direction={projectile.direction}
                    isEnemy={false}
                />
            ))}

            {/* Explosions */}
            {explosions.map((explosion) => (
                <ExplosionEffect
                    key={explosion.id}
                    position={explosion.position}
                    scale={1.2}
                    duration={0.5}
                    onComplete={() => handleExplosionComplete(explosion.id)}
                />
            ))}

            {/* Decorations: Trees, rocks, etc. */}
            <group position={[-5, 0, 0]}>
                <mesh position={[0, 1.5, 0]} castShadow>
                    <cylinderGeometry args={[0.2, 0.2, 2]} />
                    <meshStandardMaterial color="brown" />
                </mesh>
                <mesh position={[0, 3, 0]} castShadow>
                    <coneGeometry args={[1, 2, 8]} />
                    <meshStandardMaterial color="green" />
                </mesh>
            </group>

            <group position={[6, 0, 0]}>
                <mesh position={[0, 0.5, 0]} castShadow>
                    <sphereGeometry args={[0.7, 8, 8]} />
                    <meshStandardMaterial color="darkgray" />
                </mesh>
            </group>
        </group>
    );
}; 