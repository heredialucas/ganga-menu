'use client';

import dynamic from 'next/dynamic';

const SnowParticles = dynamic(
    () => import('./SnowParticles').then((mod) => mod.SnowParticles),
    {
        ssr: false,
    }
);

interface SnowParticlesWrapperProps {
    count?: number;
}

export const SnowParticlesWrapper = ({ count = 70 }: SnowParticlesWrapperProps) => {
    return <SnowParticles count={count} />;
}; 