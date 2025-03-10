import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

interface PlayerProps {
    incrementScore: () => void;
}

export const Player = ({ incrementScore }: PlayerProps) => {
    // Reference to the mesh
    const ref = useRef<THREE.Mesh>(null);

    // Player state
    const [position, setPosition] = useState({ x: 0, y: 1, z: 0 });
    const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
    const [isJumping, setIsJumping] = useState(false);
    const [facingDirection, setFacingDirection] = useState(1); // 1 for right, -1 for left
    const [isShooting, setIsShooting] = useState(false);

    // Get three.js context (viewport removed as it's unused)
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

    // Handle player physics
    useFrame((state, delta) => {
        if (!ref.current) return;

        // Get current key states - only using left/right
        const { left, right } = getKeys();

        // Movement
        const moveSpeed = 5;
        let xVelocity = 0;

        if (left) {
            xVelocity = -moveSpeed;
            setFacingDirection(-1);
        } else if (right) {
            xVelocity = moveSpeed;
            setFacingDirection(1);
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

        // Update mesh position
        ref.current.position.x = position.x;
        ref.current.position.y = position.y;
        ref.current.position.z = position.z;

        // Update rotation based on facing direction
        ref.current.rotation.y = facingDirection === 1 ? 0 : Math.PI;
    });

    // Shooting function
    const shoot = () => {
        // In a real game, you would create a projectile here
        console.log('Shooting in direction:', facingDirection);
        incrementScore();
    };

    return (
        <Box
            ref={ref}
            position={[position.x, position.y, position.z]}
            args={[0.75, 1.5, 0.5]}
            castShadow
        >
            <meshStandardMaterial color={isShooting ? 'red' : 'blue'} />
        </Box>
    );
}; 