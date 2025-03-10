import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface BulletSpriteProps {
    position: THREE.Vector3;
    direction: number;
    isEnemy: boolean;
}

export const BulletSprite = ({ position, direction, isEnemy }: BulletSpriteProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);
    const textureRef = useRef<THREE.Texture | null>(null);

    // Load bullet texture
    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load('/assets/M484SpaceSoldier.png', (texture) => {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;

            // The bullets are in the image after the character sprites
            // We assume they start at position [0, 3] in a 50x50 grid
            // Calculate texture coordinates (UV mapping)
            const frameWidth = 1 / 8; // 8 frames per row
            const frameHeight = 1 / 6; // 6 rows total

            // Selecting the bullet sprite (x, y position in the sprite sheet)
            // For yellow bullet use the y = 3, x = 1 position (second bullet)
            // For enemy (red) bullet use the y = 3, x = 2 position (third bullet)
            const col = isEnemy ? 2 : 1;
            const row = 3;

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
    }, [isEnemy]);

    // Ensure the bullet faces the right direction
    useEffect(() => {
        if (meshRef.current) {
            meshRef.current.scale.x = direction > 0 ? 0.5 : -0.5;
        }
    }, [direction]);

    // Optionally add animation or effects here
    useFrame(() => {
        if (meshRef.current) {
            // You could add bullet rotation or trail effects here
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={[position.x, position.y, position.z]}
        >
            <planeGeometry args={[0.4, 0.4]} />
            <meshBasicMaterial
                ref={materialRef}
                transparent={true}
                color={isEnemy ? 0xff5555 : 0xffff55} // Fallback colors before texture loads
            />
        </mesh>
    );
};

export default BulletSprite; 