import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ExplosionEffectProps {
    position: THREE.Vector3;
    scale?: number;
    duration?: number;
    onComplete?: () => void;
}

export const ExplosionEffect = ({
    position,
    scale = 1,
    duration = 0.5,
    onComplete
}: ExplosionEffectProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);
    const textureRef = useRef<THREE.Texture | null>(null);
    const [startTime, setStartTime] = useState(0);
    const [completed, setCompleted] = useState(false);

    // Load explosion texture (using the damage flash from the sprite sheet)
    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load('/assets/M484SpaceSoldier.png', (texture) => {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;

            // The explosion/flash effect is in the sprite sheet
            // We're assuming it's at row 3, column 3
            const frameWidth = 1 / 8; // 8 frames per row
            const frameHeight = 1 / 6; // 6 rows total

            const col = 3; // Fourth column
            const row = 3; // Fourth row

            texture.offset.set(col * frameWidth, 1 - (row + 1) * frameHeight);
            texture.repeat.set(frameWidth, frameHeight);

            textureRef.current = texture;

            if (materialRef.current) {
                materialRef.current.map = texture;
                materialRef.current.needsUpdate = true;
            }
        });

        return () => {
            if (textureRef.current) {
                textureRef.current.dispose();
            }
        };
    }, []);

    // Start the effect timer
    useEffect(() => {
        setStartTime(Date.now());
    }, []);

    // Animate the explosion
    useFrame(() => {
        if (completed) return;

        const elapsedTime = (Date.now() - startTime) / 1000;

        if (meshRef.current) {
            // Grow the explosion over time
            const progress = Math.min(elapsedTime / duration, 1);
            const currentScale = scale * (0.5 + progress * 1.5);
            meshRef.current.scale.set(currentScale, currentScale, 1);

            // Fade out at the end
            if (materialRef.current) {
                materialRef.current.opacity = progress < 0.7 ? 1 : 1 - ((progress - 0.7) / 0.3);
            }

            // Complete the effect
            if (progress >= 1 && !completed) {
                setCompleted(true);
                if (onComplete) {
                    onComplete();
                }
            }
        }
    });

    if (completed) return null;

    return (
        <mesh
            ref={meshRef}
            position={[position.x, position.y, position.z]}
        >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                ref={materialRef}
                transparent={true}
                color={0xffffff}
            />
        </mesh>
    );
};

export default ExplosionEffect; 