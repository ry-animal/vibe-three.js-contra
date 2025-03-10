import { Box } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useState } from 'react';
import * as THREE from 'three';

interface Platform {
    position: [number, number, number];
    size: [number, number, number];
    color: string;
}

export const Level = () => {
    // Platform data structure
    const platforms: Platform[] = [
        { position: [0, -0.5, 0], size: [10, 1, 3], color: 'gray' },
        { position: [-4, 2, 0], size: [2, 0.5, 3], color: 'brown' },
        { position: [0, 4, 0], size: [2, 0.5, 3], color: 'brown' },
        { position: [4, 6, 0], size: [2, 0.5, 3], color: 'brown' },
    ];

    // Enemy data
    const [enemies, setEnemies] = useState([
        { id: 1, position: new THREE.Vector3(5, 1, 0), direction: -1 },
        { id: 2, position: new THREE.Vector3(-3, 4.5, 0), direction: 1 },
    ]);

    // Enemy movement system
    useFrame((_state, delta) => {
        const speed = 2;
        const newEnemies = enemies.map(enemy => {
            const newPos = enemy.position.clone();
            newPos.x += enemy.direction * speed * delta;

            // Reverse direction if reaching platform edges
            if (Math.abs(newPos.x) > 7) {
                return {
                    ...enemy,
                    position: newPos,
                    direction: -enemy.direction
                };
            }

            return {
                ...enemy,
                position: newPos
            };
        });

        setEnemies(newEnemies);
    });

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
                <mesh
                    key={enemy.id}
                    position={enemy.position.toArray()}
                    castShadow
                >
                    <boxGeometry args={[0.8, 0.8, 0.5]} />
                    <meshStandardMaterial color="red" />
                </mesh>
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