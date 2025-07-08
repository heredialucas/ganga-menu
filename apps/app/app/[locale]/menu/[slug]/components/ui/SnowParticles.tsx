'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Circle } from 'react-konva';

type Particle = {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    twinkleSpeed: number;
    twinkleDirection: boolean;
};

type SnowParticlesProps = {
    count?: number;
};

const createParticle = (id: number, width: number, height: number): Particle => ({
    id,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 3 + 1, // Smaller and more subtle particles
    speed: Math.random() * 0.5 + 0.1, // Slower, more gentle fall
    opacity: Math.random() * 0.6 + 0.1,
    twinkleSpeed: Math.random() * 0.005 + 0.001,
    twinkleDirection: Math.random() > 0.5,
});


export const SnowParticles = ({ count = 70 }: SnowParticlesProps) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [colors, setColors] = useState<string[]>([]);
    const animationFrameId = useRef<number>(0);

    // Effect to get theme colors from CSS variables once mounted
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const computedStyles = getComputedStyle(document.documentElement);
            setColors([
                computedStyles.getPropertyValue('--decorative-primary').trim() || 'rgba(34, 197, 94, 0.2)',
                computedStyles.getPropertyValue('--decorative-secondary').trim() || 'rgba(74, 222, 128, 0.1)',
                computedStyles.getPropertyValue('--decorative-tertiary').trim() || 'rgba(34, 197, 94, 0.15)',
                computedStyles.getPropertyValue('--decorative-accent').trim() || 'rgba(22, 163, 74, 0.3)',
            ]);
        }
    }, []);

    // Effect to handle window resize
    useEffect(() => {
        const handleResize = () => {
            const container = document.querySelector('.min-h-screen'); // Target the main container
            if (container) {
                setDimensions({
                    width: container.scrollWidth,
                    height: container.scrollHeight,
                });
            }
        };

        handleResize(); // Initial size
        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Effect to initialize or reset particles when dimensions change
    useEffect(() => {
        if (dimensions.width > 0 && dimensions.height > 0) {
            setParticles(
                Array.from({ length: count }, (_, i) => createParticle(i, dimensions.width, dimensions.height))
            );
        }
    }, [count, dimensions]);


    // The main animation loop using requestAnimationFrame
    const animate = useCallback(() => {
        setParticles(prevParticles =>
            prevParticles.map(particle => {
                // Update position
                let y = particle.y + particle.speed;
                let x = particle.x + Math.sin(y * 0.01) * 0.2; // Softer horizontal drift

                // Reset particle when it goes off-screen
                if (y > dimensions.height) {
                    y = -10;
                    x = Math.random() * dimensions.width;
                }

                // Update twinkle effect (opacity)
                let { opacity, twinkleDirection } = particle;
                if (twinkleDirection) {
                    opacity += particle.twinkleSpeed;
                    if (opacity >= 0.7) {
                        opacity = 0.7;
                        twinkleDirection = false;
                    }
                } else {
                    opacity -= particle.twinkleSpeed;
                    if (opacity <= 0.1) {
                        opacity = 0.1;
                        twinkleDirection = true;
                    }
                }

                return { ...particle, x, y, opacity, twinkleDirection };
            })
        );
        animationFrameId.current = requestAnimationFrame(animate);
    }, [dimensions.width, dimensions.height]);

    useEffect(() => {
        if (particles.length > 0) {
            animationFrameId.current = requestAnimationFrame(animate);
        }
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [animate, particles.length]);


    if (colors.length === 0 || dimensions.width === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
            <Stage width={dimensions.width} height={dimensions.height}>
                <Layer>
                    {particles.map((particle, index) => {
                        const color = colors[index % colors.length];
                        const baseColor = color.substring(0, color.lastIndexOf(','));
                        return (
                            <Circle
                                key={particle.id}
                                x={particle.x}
                                y={particle.y}
                                radius={particle.size}
                                fill={`${baseColor}, ${particle.opacity})`}
                                shadowBlur={particle.size}
                                shadowColor={`${baseColor}, ${particle.opacity * 0.5})`}
                            />
                        );
                    })}
                </Layer>
            </Stage>
        </div>
    );
}; 