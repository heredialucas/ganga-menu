'use client';

import type { Dictionary } from '@repo/internationalization';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChefHat, Users, MenuIcon, ArrowRight, Smartphone, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getAppUrl } from '@/lib/utils';
import logo from '@/public/logo.png';
import gangaMenu from '@/public/ganga-menu.png';
import gangaMozos from '@/public/ganga-mozos.png';
import gangaCocina from '@/public/ganga-cocina.png';
import background from '@/public/background.png';
import { staggerContainer, fadeIn, slideIn } from '../lib/animations';

type HeroProps = {
  dictionary: Dictionary;
};

export const Hero = ({ dictionary }: HeroProps) => {
  const params = useParams();
  const locale = params.locale as string;
  const [rotation, setRotation] = useState(0);

  // Logo rotation animation
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 90) % 360);
    }, 1000);

    return () => {
      clearInterval(rotationInterval);
    };
  }, []);

  return (
    <motion.section
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="min-h-[calc(100vh-4rem)] flex items-center relative px-4 sm:px-6 lg:px-8 overflow-hidden"
      id="inicio"
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={background}
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-5 sm:-top-10 right-1/4 w-10 sm:w-20 h-10 sm:h-20 bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/10 rounded-full blur-lg sm:blur-xl"></div>
      <div className="absolute bottom-5 sm:bottom-10 left-1/3 w-16 sm:w-32 h-16 sm:h-32 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/5 rounded-full blur-xl sm:blur-2xl"></div>

      <div className="w-full sm:container sm:mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <motion.div variants={slideIn} className="pt-8 lg:pt-0">
            <motion.div
              className="flex items-center mb-6 sm:mb-8"
              variants={fadeIn}
            >
              <div className="relative flex items-center">
                <Image
                  src={logo}
                  alt="Ganga-Menú"
                  width={120}
                  height={120}
                  className="w-auto h-16 sm:h-20 lg:h-24 transition-transform duration-300 mr-[-8px] sm:mr-[-10px]"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0d4b3d] dark:text-white">anga-Menú</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center lg:text-left leading-tight"
              variants={fadeIn}
            >
              {dictionary.web.home.hero.title}
            </motion.h1>

            <motion.p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 text-center lg:text-left leading-relaxed" variants={fadeIn}>
              {dictionary.web.home.hero.subtitle}
            </motion.p>

            {/* Feature highlights */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/80 dark:bg-gray-800/80 p-2 sm:p-3 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center">
                  <MenuIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0d4b3d]" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{dictionary.web.home.hero.gallery.menu}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 bg-white/80 dark:bg-gray-800/80 p-2 sm:p-3 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#0d4b3d]" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{dictionary.web.home.hero.gallery.waiters}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 bg-white/80 dark:bg-gray-800/80 p-2 sm:p-3 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center">
                  <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-[#0d4b3d]" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{dictionary.web.home.hero.gallery.kitchen}</span>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4">
              <Link href={`${getAppUrl()}/${locale}/sign-in`}>
                <motion.button
                  className="bg-[#0d4b3d] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-[#0d4b3d]/90 transition-all shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {dictionary.web.home.hero.getStarted}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </Link>
              {/* <Link href="#features">
                <motion.button
                  className="border-2 border-[#0d4b3d] text-[#0d4b3d] px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-[#0d4b3d] hover:text-white transition-all shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {dictionary.web.home.hero.tryFree}
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </Link> */}
            </div>
          </motion.div>

          {/* Floating Gallery Layout */}
          <motion.div
            className="flex justify-center items-center relative h-64 sm:h-80 lg:h-96 xl:h-[500px] w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, delay: 0.2 }
            }}
          >
            {/* Main large image - Center slightly left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -8, 0],
                rotate: [-2, 0, -2]
              }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 6, ease: "easeInOut" }
              }}
              className="absolute z-10 left-0 top-4 sm:top-8 w-48 sm:w-64 lg:w-80 xl:w-[30rem] h-36 sm:h-44 lg:h-56 xl:h-[22rem] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white dark:border-gray-800 transform hover:scale-105 transition-transform"
            >
              <Image
                src={gangaMenu}
                alt="Menús Digitales Interactivos"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, (max-width: 1024px) 320px, 480px"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 text-white">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <MenuIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">{dictionary.web.home.hero.gallery.menu}</h3>
                    <p className="text-xs sm:text-sm text-white/90">{dictionary.web.home.hero.gallery.menuDesc}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Second image - Top right, overlapping */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 3 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -6, 0],
                rotate: [3, 1, 3]
              }}
              transition={{
                duration: 0.8,
                delay: 0.6,
                y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 7, ease: "easeInOut" }
              }}
              className="absolute z-20 right-2 sm:right-4 top-2 sm:top-4 w-32 sm:w-48 lg:w-64 h-24 sm:h-32 lg:h-44 rounded-lg sm:rounded-xl overflow-hidden shadow-lg sm:shadow-xl border-2 sm:border-3 border-white dark:border-gray-800 transform hover:scale-105 transition-transform"
            >
              <Image
                src={gangaMozos}
                alt="Sistema para Mozos"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 128px, (max-width: 768px) 192px, (max-width: 1024px) 256px"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3">
                <div className="flex items-center gap-1.5 sm:gap-2 text-white">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm">{dictionary.web.home.hero.gallery.waiters}</h3>
                    <p className="text-xs text-white/90">{dictionary.web.home.hero.gallery.waitersDesc}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Third image - Bottom center, overlapping both */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -1 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -5, 0],
                rotate: [-1, 1, -1]
              }}
              transition={{
                duration: 0.8,
                delay: 0.9,
                y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 8, ease: "easeInOut" }
              }}
              className="absolute z-30 bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 w-40 sm:w-56 lg:w-68 xl:w-68 h-28 sm:h-36 lg:h-46 xl:h-46 rounded-lg sm:rounded-xl overflow-hidden shadow-lg sm:shadow-xl border-2 sm:border-3 border-white dark:border-gray-800 hover:scale-105 transition-transform"
            >
              <Image
                src={gangaCocina}
                alt="Panel de Cocina"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 160px, (max-width: 768px) 224px, (max-width: 1024px) 272px"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3">
                <div className="flex items-center gap-1.5 sm:gap-2 text-white">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <ChefHat className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm">{dictionary.web.home.hero.gallery.kitchen}</h3>
                    <p className="text-xs text-white/90">{dictionary.web.home.hero.gallery.kitchenDesc}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating accent elements */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 10, 0],
                transition: { repeat: Infinity, duration: 4 }
              }}
              className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-[#0d4b3d] text-white p-1.5 sm:p-2 rounded-full shadow-lg w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center z-30"
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>

            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                transition: { repeat: Infinity, duration: 5, delay: 1.5 }
              }}
              className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 bg-white dark:bg-gray-800 border-2 border-[#0d4b3d] text-[#0d4b3d] p-1.5 sm:p-2 rounded-full shadow-lg w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center z-30"
            >
              <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.div>

            {/* Additional decorative elements */}
            <motion.div
              animate={{
                rotate: [0, 360],
                transition: { repeat: Infinity, duration: 10, ease: "linear" }
              }}
              className="absolute top-1/2 left-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-[#0d4b3d]/30 rounded-full z-5"
            ></motion.div>

            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.7, 0.3],
                transition: { repeat: Infinity, duration: 3 }
              }}
              className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#0d4b3d]/40 rounded-full z-5"
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

