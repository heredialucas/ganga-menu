'use client';

import Image from 'next/image';
import type { Dictionary } from '@repo/internationalization';
import { MouseEvent } from 'react';

export type Product = {
    id: string;
    title: string;
    description: string;
    images: string[];
    status: string;
    size: string;
    status_description: string;
    technologies: string[];
    features: string[];
};

export type ProjectCardProps = {
    project: Product;
    dictionary: Dictionary;
    size: string;
    onClick: (project: Product) => void;
};

export const ProductCard = ({ project, dictionary, size, onClick }: ProjectCardProps) => {
    // Determine aspect ratio based on size
    const aspectRatioClass = {
        large: 'aspect-[2/1]',
        medium: 'aspect-[3/2]',
        small: 'aspect-[4/3]',
    }[size] || 'aspect-square';

    const handleClick = () => {
        onClick(project);
    };

    // Use the first image if available, otherwise use a placeholder
    const imageUrl = project.images.length > 0 ? project.images[0] : '';

    return (
        <div
            className="relative overflow-hidden rounded-lg sm:rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-border/80 transition-all duration-300 h-full cursor-pointer"
            onClick={handleClick}
        >
            <div className={`relative ${aspectRatioClass}`}>
                <div className="h-full w-full">
                    <Image
                        src={imageUrl}
                        alt={project.title}
                        className="object-cover w-full h-full"
                        width={800}
                        height={600}
                        priority
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent z-10"></div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 lg:p-4 z-20">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <div
                        className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${project.status === "finished"
                            ? "bg-success animate-pulse"
                            : "bg-blue-400 animate-pulse"
                            }`}
                    ></div>
                    <span className="text-xs text-muted-foreground capitalize">
                        {project.status === "finished"
                            ? dictionary.web.home.cases.projectStatus.finished
                            : dictionary.web.home.cases.projectStatus.inProgress}
                    </span>
                </div>

                <h3 className={`font-semibold mb-1 sm:mb-2 text-foreground ${size === 'large'
                        ? 'text-sm sm:text-lg lg:text-xl'
                        : size === 'medium'
                            ? 'text-xs sm:text-base lg:text-lg'
                            : 'text-xs sm:text-sm'
                    }`}>
                    {project.title}
                </h3>

                <p className={`text-muted-foreground ${size === 'small'
                        ? 'text-xs line-clamp-1'
                        : 'text-xs sm:text-sm line-clamp-2'
                    }`}>
                    {project.description}
                </p>
            </div>
        </div>
    );
}; 