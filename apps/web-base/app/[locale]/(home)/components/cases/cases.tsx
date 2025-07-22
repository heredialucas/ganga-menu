'use client';

import type { Dictionary } from '@repo/internationalization';
import { motion } from 'framer-motion';
import { staggerContainer, fadeIn } from '../../lib/animations';
import { useState } from 'react';
import { ProjectModal } from './project-modal';
import Image from 'next/image';

type CasesProps = {
  dictionary: Dictionary;
  projects: Product[];
};

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

export const Cases = ({ dictionary, projects }: CasesProps) => {
  const [selectedProject, setSelectedProject] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const openProjectDetails = (project: Product) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full py-12 sm:py-16 lg:py-24 relative"
    >
      {/* Elementos decorativos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-10 sm:-left-20 top-1/3 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-blue-500/20 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute right-0 bottom-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-blue-400/10 rounded-full blur-xl sm:blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 w-1 sm:w-2 h-1 sm:h-2 bg-white/30 rounded-full animate-ping"></div>
      </div>

      <div className="w-full sm:container sm:mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <motion.div variants={fadeIn} className="text-center mb-8 sm:mb-12 lg:mb-16 relative">
          {/* Frase flotante */}
          <span className="absolute -top-4 sm:-top-6 lg:-top-8 left-2 sm:left-4 md:left-20 text-xs sm:text-sm md:text-lg text-white/70 font-normal italic -rotate-6 sm:-rotate-12 origin-left">
            &quot;{dictionary.web.home.cases.quote}&quot;
          </span>

          {/* Título centrado */}
          <h2
            id="projects"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4"
          >
            {dictionary.web.home.cases.projectsTitle}
          </h2>
          <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto mb-4 sm:mb-6"></div>

          <p className="text-white/70 text-xs sm:text-sm max-w-xl sm:max-w-2xl mx-auto my-2 px-4">
            {dictionary.web.home.cases.subtitle}
          </p>
        </motion.div>

        {/* Grid de proyectos */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Proyecto Principal (Medium) */}
          {projects.map((project, index) =>
            project.size === "medium" ? (
              <motion.div
                key={index}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5 }}
                className="w-full lg:w-1/2 h-fit"
                onClick={() => openProjectDetails(project)}
              >
                <div className="relative cursor-pointer overflow-hidden rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                  <div className="aspect-[3/2] relative">
                    {project.images.length > 0 && (
                      <div className="w-full h-full relative">
                        <Image
                          src={project.images[0]}
                          alt={project.title}
                          fill
                          className="object-cover object-center"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${project.status === "finished"
                          ? "bg-green-400 animate-pulse"
                          : "bg-blue-400 animate-pulse"
                          }`}
                      ></div>
                      <span className="text-xs text-white/70 capitalize">
                        {project.status === "finished"
                          ? dictionary.web.home.cases.projectStatus.finished
                          : dictionary.web.home.cases.projectStatus.inProgress}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 text-white">
                      {project.title}
                    </h3>
                    <p className="hidden sm:block text-xs sm:text-sm text-gray-200">
                      {project.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null
          )}

          {/* Grid de Proyectos Pequeños */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full lg:w-1/2">
            {projects.map((project, index) =>
              project.size !== "medium" ? (
                <motion.div
                  key={index}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group h-fit"
                  onClick={() => openProjectDetails(project)}
                >
                  <div className="relative cursor-pointer overflow-hidden rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                    <div className="aspect-[3/2] relative">
                      {project.images.length > 0 && (
                        <div className="w-full h-full relative">
                          <Image
                            src={project.images[0]}
                            alt={project.title}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 lg:p-4 z-20">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                        <div
                          className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${project.status === "finished"
                            ? "bg-green-400 animate-pulse"
                            : "bg-blue-400 animate-pulse"
                            }`}
                        ></div>
                        <span className="text-xs text-white/70 capitalize">
                          {project.status === "finished"
                            ? dictionary.web.home.cases.projectStatus.finished
                            : dictionary.web.home.cases.projectStatus.inProgress}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-1 sm:mb-2 text-white">
                        {project.title}
                      </h3>
                      <p className="hidden sm:block text-xs sm:text-sm text-gray-200">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        dictionary={dictionary}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </motion.section>
  );
};
