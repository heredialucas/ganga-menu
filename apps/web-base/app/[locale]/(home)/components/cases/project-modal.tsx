'use client';

import { type Product } from './product-card';
import type { Dictionary } from '@repo/internationalization';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@repo/design-system/components/ui/dialog';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@repo/design-system/components/ui/carousel';

type ProjectModalProps = {
    project: Product | null;
    dictionary: Dictionary;
    onClose: () => void;
    open: boolean;
};

export const ProjectModal = ({ project, dictionary, onClose, open }: ProjectModalProps) => {
    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader className="mb-4 sm:mb-6">
                    <DialogTitle className="text-lg sm:text-xl font-bold">{project.title}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <div
                            className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${project.status === "finished"
                                ? "bg-success animate-pulse"
                                : "bg-blue-400 animate-pulse"
                                }`}
                        ></div>
                        <DialogDescription>
                            <span className="text-xs text-muted-foreground capitalize">
                                {project.status === "finished"
                                    ? dictionary.web.home.cases.projectStatus.finished
                                    : dictionary.web.home.cases.projectStatus.inProgress}
                            </span>
                        </DialogDescription>
                    </div>
                </DialogHeader>

                {/* Project Images Carousel */}
                <div className="aspect-video w-full mb-4 sm:mb-6">
                    <Carousel className="w-full">
                        <CarouselContent>
                            {project.images.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-video relative">
                                        <Image
                                            src={image}
                                            alt={`${project.title} - Image ${index + 1}`}
                                            className="object-contain"
                                            width={800}
                                            height={450}
                                            priority={index === 0}
                                            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 80vw, 600px"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-1 sm:left-2 w-8 h-8 sm:w-10 sm:h-10" />
                        <CarouselNext className="right-1 sm:right-2 w-8 h-8 sm:w-10 sm:h-10" />
                    </Carousel>
                </div>

                {/* Project Description */}
                <div className="space-y-3 sm:space-y-4">
                    <div>
                        <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">{dictionary.web.home.cases.modal.description}</h3>
                        <p className="text-muted-foreground text-sm sm:text-base">{project.description}</p>
                        {project.status_description && (
                            <p className="text-muted-foreground text-sm sm:text-base mt-1 sm:mt-2">{project.status_description}</p>
                        )}
                    </div>

                    {/* Technologies */}
                    <div>
                        <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">{dictionary.web.home.cases.modal.technologies}</h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {project.technologies.map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">{dictionary.web.home.cases.modal.features}</h3>
                        <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1">
                            {project.features.map((feature, index) => (
                                <li key={index} className="text-muted-foreground text-sm sm:text-base">
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 