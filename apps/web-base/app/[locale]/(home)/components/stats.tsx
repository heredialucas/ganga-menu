'use client';

import type { Dictionary } from '@repo/internationalization';
import { motion } from 'framer-motion';
import { staggerContainer, fadeIn } from '../lib/animations';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import logoWithBg from '@/public/logoWithBg.png';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

type StatsProps = {
  dictionary: Dictionary;
};

export const Stats = ({ dictionary }: StatsProps) => {
  const steps = [
    {
      title: dictionary.web.home.stats.process?.[0]?.title || "Configura tu Restaurante",
      description: dictionary.web.home.stats.process?.[0]?.description || "Registra tu establecimiento, crea el menú digital y configura las mesas y zonas de tu restaurante."
    },
    {
      title: dictionary.web.home.stats.process?.[1]?.title || "Capacita a tu Personal",
      description: dictionary.web.home.stats.process?.[1]?.description || "Los mozos acceden con códigos únicos para tomar pedidos desde móviles o tabletas de forma intuitiva."
    },
    {
      title: dictionary.web.home.stats.process?.[2]?.title || "Cocina en Tiempo Real",
      description: dictionary.web.home.stats.process?.[2]?.description || "La cocina recibe pedidos instantáneamente y actualiza el estado: en preparación, listo para servir."
    },
    {
      title: dictionary.web.home.stats.process?.[3]?.title || "Servicio Optimizado",
      description: dictionary.web.home.stats.process?.[3]?.description || "Mejora la eficiencia, reduce tiempos de espera y brinda una experiencia excepcional a tus clientes."
    }
  ];

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full py-8 sm:py-12 lg:py-16 relative"
      id="proceso"
    >
      <div className="w-full sm:container sm:mx-auto px-4 sm:px-6 lg:px-8">
        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/5 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute left-1/4 top-1/2 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-[#0d4b3d]/40 dark:bg-[#0d4b3d]/20 rounded-full"></div>

        {/* Header */}
        <motion.div
          variants={fadeIn}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 var(--font-nunito)">
            {dictionary.web.home.stats.title || "Cómo funciona la plataforma integrada"}
          </h2>
          <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-[#0d4b3d]/70 to-[#0d4b3d] rounded-full mx-auto mb-4 sm:mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto var(--font-nunito) px-4">
            {dictionary.web.home.stats.description || "Implementa la solución completa en tu restaurante y transforma la experiencia gastronómica"}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-8 sm:mt-12 lg:mt-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={{
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0d4b3d] dark:text-white">
                    {index + 1}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-full h-px bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/30 -translate-y-1/2"></div>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2 sm:mb-3 var(--font-nunito)">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 var(--font-nunito) max-w-xs mx-auto text-sm sm:text-base">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* App Preview Image with animation */}
        <motion.div
          variants={fadeIn}
          className="mt-12 sm:mt-16 lg:mt-20 flex justify-center"
        >
          <motion.div
            className="relative max-w-xs sm:max-w-sm lg:max-w-2xl"
            animate={{
              y: [0, -10, 0],
              transition: {
                y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
              }
            }}
          >
            <Image
              src={logoWithBg}
              alt="Ganga-Menú Platform"
              width={600}
              height={400}
              className="rounded-lg shadow-xl"
              sizes="(max-width: 640px) 320px, (max-width: 768px) 384px, 600px"
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};
