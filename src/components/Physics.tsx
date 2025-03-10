import { ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';

interface PhysicsProps {
    children: ReactNode;
}

export const Physics = ({ children }: PhysicsProps) => {
    // In a more complex game, we could integrate a physics engine like rapier
    // For now, we'll handle basic physics in each component

    useFrame((_state, _delta) => {
        // Global physics update if needed
    });

    return <>{children}</>;
}; 