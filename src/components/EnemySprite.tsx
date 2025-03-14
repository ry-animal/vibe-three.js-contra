import { useState, useEffect } from 'react';
import * as THREE from 'three';
import SpriteSheet from './SpriteSheet';

// Enemy types
export enum EnemyType {
    WALKER = 'walker',
    JUMPER = 'jumper',
    SHOOTER = 'shooter'
}

// Animation states for enemies
export enum EnemyAnimationState {
    IDLE = 0,       // First row
    RUNNING = 1,    // Second row
    SHOOTING = 2    // Third row
}

interface EnemySpriteProps {
    position: THREE.Vector3;
    direction: number;
    type: string;
    isJumping: boolean;
    isShooting: boolean;
    useGreenTheme?: boolean;
}

export const EnemySprite = ({
    position,
    direction,
    type,
    isJumping,
    isShooting,
    useGreenTheme = true // Default to green for enemies to distinguish from player
}: EnemySpriteProps) => {
    const [animationState, setAnimationState] = useState(EnemyAnimationState.IDLE);
    const [flipX, setFlipX] = useState(false);

    // Animation configuration
    const columns = 8; // 8 frames per row
    const framesPerAnimation = 8; // Each animation has 8 frames

    // Animation speed - adjust based on character state and type
    const getAnimationSpeed = () => {
        if (isShooting) return 0.06; // Fast animation for shooting
        if (type === EnemyType.JUMPER) return 0.09; // Slightly faster for jumpers
        if (type === EnemyType.SHOOTER) return 0.12; // Slower for shooters
        return 0.1; // Default for walkers
    };

    // Adjust animation state based on enemy state
    useEffect(() => {
        if (isShooting) {
            setAnimationState(EnemyAnimationState.SHOOTING);
        } else if (isJumping || type === EnemyType.JUMPER) {
            setAnimationState(EnemyAnimationState.RUNNING);
        } else if (direction !== 0 || type === EnemyType.WALKER) {
            setAnimationState(EnemyAnimationState.RUNNING);
        } else {
            setAnimationState(EnemyAnimationState.IDLE);
        }

        // Update facing direction
        setFlipX(direction < 0);
    }, [isShooting, isJumping, direction, type]);

    // Determine which row to use based on animation state and theme
    // For green theme, add 3 to get to the green rows
    const spriteRow = useGreenTheme ? animationState + 3 : animationState;

    return (
        <SpriteSheet
            textureUrl="/assets/M484SpaceSoldier.png"
            position={position}
            rows={6} // Total 6 rows (3 yellow + 3 green)
            columns={columns}
            totalFrames={framesPerAnimation}
            animationSpeed={getAnimationSpeed()}
            scale={1.2} // Slightly smaller than player
            animationRow={spriteRow}
            flipX={flipX}
        />
    );
};

export default EnemySprite; 