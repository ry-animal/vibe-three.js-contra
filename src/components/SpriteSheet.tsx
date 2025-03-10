import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpriteSheetProps {
    textureUrl: string;
    position: THREE.Vector3 | [number, number, number];
    rows: number;
    columns: number;
    totalFrames: number;
    animationSpeed?: number;
    scale?: number;
    animationRow?: number;
    playing?: boolean;
    flipX?: boolean;
    onAnimationComplete?: () => void;
}

export const SpriteSheet = ({
    textureUrl,
    position,
    rows,
    columns,
    totalFrames,
    animationSpeed = 0.1,
    scale = 1,
    animationRow = 0,
    playing = true,
    flipX = false,
    onAnimationComplete
}: SpriteSheetProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const [currentFrame, setCurrentFrame] = useState(0);
    const lastUpdateTime = useRef(0);

    // Load the texture
    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load(textureUrl, (loadedTexture) => {
            loadedTexture.magFilter = THREE.NearestFilter;
            loadedTexture.minFilter = THREE.NearestFilter;
            setTexture(loadedTexture);
        });
    }, [textureUrl]);

    // Handle animation
    useFrame((state) => {
        if (!texture || !playing) return;

        const time = state.clock.getElapsedTime();
        if (time - lastUpdateTime.current > animationSpeed) {
            const newFrame = (currentFrame + 1) % totalFrames;
            setCurrentFrame(newFrame);
            lastUpdateTime.current = time;

            if (newFrame === 0 && onAnimationComplete) {
                onAnimationComplete();
            }
        }

        if (meshRef.current && texture) {
            // Update UV coordinates for current frame
            const frameWidth = 1 / columns;
            const frameHeight = 1 / rows;

            const col = currentFrame % columns;
            const row = animationRow;

            const offset = new THREE.Vector2(col * frameWidth, 1 - (row + 1) * frameHeight);
            texture.offset.copy(offset);
            texture.repeat.set(frameWidth, frameHeight);

            // Apply flip if needed
            if (meshRef.current.scale.x !== (flipX ? -scale : scale)) {
                meshRef.current.scale.x = flipX ? -scale : scale;
            }
            meshRef.current.scale.y = scale;
        }
    });

    if (!texture) return null;

    return (
        <mesh
            ref={meshRef}
            position={Array.isArray(position) ? position : [position.x, position.y, position.z]}
        >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={texture}
                transparent={true}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

export default SpriteSheet; 