import { useState, useEffect } from 'react';
import * as THREE from 'three';
import SpriteSheet from './SpriteSheet';

// Animation states
export enum PlayerAnimationState {
    IDLE = 0,       // First row - Idle 
    RUNNING = 1,    // Second row - Running
    SHOOTING = 2    // Third row - Shooting
}

interface PlayerSpriteProps {
    position: THREE.Vector3;
    facingDirection: number;
    isJumping: boolean;
    isShooting: boolean;
    isInvulnerable: boolean;
    useGreenTheme?: boolean;
}

export const PlayerSprite = ({
    position,
    facingDirection,
    isJumping,
    isShooting,
    isInvulnerable,
    useGreenTheme = false
}: PlayerSpriteProps) => {
    const [animationState, setAnimationState] = useState(PlayerAnimationState.IDLE);
    const [flipX, setFlipX] = useState(false);
    const [blinking, setBlinking] = useState(false);
    const [visible, setVisible] = useState(true);

    // Animation configuration
    const columns = 8; // 8 frames per row
    const framesPerAnimation = 8; // Each animation has 8 frames

    // Animation speed - adjust based on character state
    const getAnimationSpeed = () => {
        if (isShooting) return 0.07; // Faster animation for shooting
        if (isJumping) return 0.1;   // Normal speed for jumping
        if (facingDirection !== 0) return 0.08; // Slightly faster for running
        return 0.15; // Slower for idle
    };

    // Adjust animation state based on player state
    useEffect(() => {
        if (isShooting) {
            setAnimationState(PlayerAnimationState.SHOOTING);
        } else if (isJumping) {
            // For simplicity, using running animation for jumping too
            setAnimationState(PlayerAnimationState.RUNNING);
        } else if (facingDirection !== 0) {
            setAnimationState(PlayerAnimationState.RUNNING);
        } else {
            setAnimationState(PlayerAnimationState.IDLE);
        }

        // Update facing direction
        setFlipX(facingDirection < 0);
    }, [isShooting, isJumping, facingDirection]);

    // Handle invulnerability blinking effect
    useEffect(() => {
        if (isInvulnerable) {
            const interval = setInterval(() => {
                setBlinking(prev => !prev);
            }, 150); // Blink every 150ms

            return () => {
                clearInterval(interval);
                setBlinking(false);
            };
        } else {
            setBlinking(false);
            setVisible(true);
        }
    }, [isInvulnerable]);

    // Update visibility based on blinking state
    useEffect(() => {
        setVisible(!blinking);
    }, [blinking]);

    // Only render if visible
    if (!visible) return null;

    // Determine which row to use based on animation state and theme
    // For green theme, add 3 to get to the green rows (as seen in the sprite sheet)
    const spriteRow = useGreenTheme ? animationState + 3 : animationState;

    return (
        <SpriteSheet
            textureUrl="/assets/M484SpaceSoldier.png"
            position={position}
            rows={6} // Total 6 rows (3 yellow + 3 green)
            columns={columns}
            totalFrames={framesPerAnimation}
            animationSpeed={getAnimationSpeed()}
            scale={1.5}
            animationRow={spriteRow}
            flipX={flipX}
        />
    );
};

export default PlayerSprite; 