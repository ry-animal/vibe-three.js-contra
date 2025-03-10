import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import PlayerSprite from './PlayerSprite';

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
    type: string;
    health: number;
}

interface PlayerProps {
    incrementScore: () => void;
    onShoot: (projectile: Projectile) => void;
    onTakeDamage: () => void;
    onPositionUpdate: (position: THREE.Vector3) => void;
    health: number;
    enemyProjectiles: Projectile[];
    enemies: Enemy[];
}

export const Player = ({
    incrementScore,
    onShoot,
    onTakeDamage,
    onPositionUpdate,
    health,
    enemyProjectiles,
    enemies
}: PlayerProps) => {
    // Reference to invisible hitbox mesh
    const hitboxRef = useRef<THREE.Mesh>(null);

    // Player state
    const [position, setPosition] = useState({ x: 0, y: 1, z: 0 });
    const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
    const [isJumping, setIsJumping] = useState(false);
    const [facingDirection, setFacingDirection] = useState(1); // 1 for right, -1 for left
    const [isShooting, setIsShooting] = useState(false);
    const [isInvulnerable, setIsInvulnerable] = useState(false); // Invulnerability after getting hit
    const [isMoving, setIsMoving] = useState(false); // Track if player is moving horizontally

    // Get three.js context
    useThree();

    // Controls setup
    const [subscribeKeys, getKeys] = useKeyboardControls();

    // Setup keyboard controls
    useEffect(() => {
        const unsubscribeJump = subscribeKeys(
            (state) => state.jump,
            (pressed) => {
                if (pressed && !isJumping) {
                    setIsJumping(true);
                    setVelocity(v => ({ ...v, y: 5 }));
                }
            }
        );

        const unsubscribeShoot = subscribeKeys(
            (state) => state.shoot,
            (pressed) => {
                if (pressed && !isShooting) {
                    setIsShooting(true);
                    shoot();
                    setTimeout(() => setIsShooting(false), 200);
                }
            }
        );

        return () => {
            unsubscribeJump();
            unsubscribeShoot();
        };
    }, [isJumping, isShooting, subscribeKeys]);

    // Update player position in the parent component for collision detection
    useEffect(() => {
        onPositionUpdate(new THREE.Vector3(position.x, position.y, position.z));
    }, [position, onPositionUpdate]);

    // Handle player physics and collision detection
    useFrame((state, delta) => {
        if (!hitboxRef.current) return;

        // Get current key states
        const { left, right } = getKeys();

        // Movement
        const moveSpeed = 5;
        let xVelocity = 0;

        if (left) {
            xVelocity = -moveSpeed;
            setFacingDirection(-1);
            setIsMoving(true);
        } else if (right) {
            xVelocity = moveSpeed;
            setFacingDirection(1);
            setIsMoving(true);
        } else {
            setIsMoving(false);
        }

        // Apply gravity
        const gravity = 9.8;
        const newYVelocity = velocity.y - gravity * delta;

        // Update velocity
        setVelocity({
            x: xVelocity,
            y: newYVelocity,
            z: 0
        });

        // Update position
        const newX = position.x + xVelocity * delta;
        const newY = position.y + velocity.y * delta;

        // Simple ground collision
        const groundY = 0;
        if (newY <= groundY + 1) {
            setPosition({
                x: newX,
                y: groundY + 1,
                z: position.z
            });
            setVelocity(v => ({ ...v, y: 0 }));
            setIsJumping(false);
        } else {
            setPosition({
                x: newX,
                y: newY,
                z: position.z
            });
        }

        // Update hitbox position
        hitboxRef.current.position.x = position.x;
        hitboxRef.current.position.y = position.y;
        hitboxRef.current.position.z = position.z;

        // Check for collisions with enemies and their projectiles
        if (!isInvulnerable) {
            // Check enemy projectile collisions
            for (const projectile of enemyProjectiles) {
                const distance = new THREE.Vector3(position.x, position.y, position.z)
                    .distanceTo(projectile.position);

                if (distance < 0.5) { // If hit by a projectile
                    takeDamage();
                    break;
                }
            }

            // Check enemy collisions
            for (const enemy of enemies) {
                const distance = new THREE.Vector3(position.x, position.y, position.z)
                    .distanceTo(enemy.position);

                if (distance < 1) { // If touching an enemy
                    takeDamage();
                    break;
                }
            }
        }
    });

    // Take damage function
    const takeDamage = () => {
        if (isInvulnerable) return;

        onTakeDamage();
        setIsInvulnerable(true);

        // Set invulnerability period
        setTimeout(() => {
            setIsInvulnerable(false);
        }, 1500); // 1.5 seconds of invulnerability
    };

    // Shooting function
    const shoot = () => {
        const newProjectile: Projectile = {
            id: Date.now(),
            position: new THREE.Vector3(
                position.x + (facingDirection * 0.5), // Spawn in front of player
                position.y,
                position.z
            ),
            direction: facingDirection,
            isEnemy: false,
            createdAt: Date.now()
        };

        onShoot(newProjectile);
        incrementScore();
    };

    return (
        <>
            {/* Invisible hitbox for collision detection */}
            <mesh
                ref={hitboxRef}
                position={[position.x, position.y, position.z]}
                visible={false}
            >
                <boxGeometry args={[0.5, 1.5, 0.5]} />
                <meshBasicMaterial transparent={true} opacity={0} />
            </mesh>

            {/* Player sprite */}
            <PlayerSprite
                position={new THREE.Vector3(position.x, position.y, position.z)}
                facingDirection={isMoving ? facingDirection : 0} // Only use facing direction when moving
                isJumping={isJumping}
                isShooting={isShooting}
                isInvulnerable={isInvulnerable}
                useGreenTheme={false} // Use yellow theme for player
            />

            {/* Player health UI (positioned in 3D space above player) */}
            <group position={[position.x, position.y + 2, position.z]}>
                {[...Array(health)].map((_, i) => (
                    <mesh key={i} position={[i * 0.5 - (health - 1) * 0.25, 0, 0]}>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                ))}
            </group>
        </>
    );
}; 