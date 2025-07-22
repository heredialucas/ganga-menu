'use client';

import type { Dictionary } from '@repo/internationalization';
import { MenuIcon, Smartphone, BarChart3, Clock, Users, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeIn } from '../lib/animations';

type FeaturesProps = {
  dictionary: Dictionary;
};

export const Features = ({ dictionary }: FeaturesProps) => {
  const features = dictionary.web.home.features.items.map((item, index) => ({
    icon: [
      <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d] dark:text-white" />,
      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d] dark:text-white" />,
      <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d] dark:text-white" />,
      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d] dark:text-white" />,
      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d] dark:text-white" />,
      <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d] dark:text-white" />
    ][index],
    title: item.title,
    description: item.description
  }));

  return (
    <motion.section
      id="features"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full py-12 sm:py-16 lg:py-20 xl:py-40 relative bg-[#0d4b3d]/5 dark:bg-[#0d4b3d]/10"
    >
      <div className="w-full sm:container sm:mx-auto px-4 sm:px-6 lg:px-8">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-5 sm:-left-10 top-1/2 w-20 sm:w-32 lg:w-40 h-20 sm:h-32 lg:h-40 bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/10 rounded-full blur-xl sm:blur-2xl"></div>
          <div className="absolute right-10 sm:right-20 bottom-1/4 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/5 rounded-full blur-lg sm:blur-xl"></div>
          <div className="absolute top-1/3 left-1/4 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-[#0d4b3d]/40 dark:bg-[#0d4b3d]/20 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/3 w-1 sm:w-2 h-1 sm:h-2 bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/10 rounded-full"></div>
        </div>

        {/* Header */}
        <motion.div variants={fadeIn} className="text-center mb-8 sm:mb-12 lg:mb-16 relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 var(--font-nunito)">
            {dictionary.web.home.features.title || "Solución Completa para tu Restaurante"}
          </h2>
          <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-[#0d4b3d]/70 to-[#0d4b3d] rounded-full mx-auto mb-4 sm:mb-6"></div>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto var(--font-nunito) px-4">
            {dictionary.web.home.features.description || "Una plataforma integral que conecta menús digitales, gestión de pedidos, mozos y cocina en un solo sistema eficiente"}
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#0d4b3d]/20 dark:border-[#0d4b3d]/30 hover:border-[#0d4b3d]/40 dark:hover:border-[#0d4b3d]/50 transition-all hover:shadow-lg sm:hover:shadow-xl transform hover:scale-105 shadow-md sm:shadow-lg group"
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2 transition-transform var(--font-nunito)">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors text-sm sm:text-base var(--font-nunito)">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
