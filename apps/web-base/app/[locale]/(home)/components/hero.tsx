'use client';

import type { Dictionary } from '@repo/internationalization';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { ChefHat, Users, MenuIcon, ArrowRight, Smartphone, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';
import { env } from '@/env';
import logo from '@/public/logo.png';
import gangaMenu from '@/public/ganga-menu.png';
import gangaMozos from '@/public/ganga-mozos.png';
import gangaCocina from '@/public/ganga-cocina.png';
import background from '@/public/background.png';
import { staggerContainer, fadeIn, slideIn } from '../lib/animations';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

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
      className="min-h-[calc(100vh-4rem)] flex items-center relative px-4 overflow-hidden"
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
      <div className="absolute -top-10 right-1/4 w-20 h-20 bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 left-1/3 w-32 h-32 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/5 rounded-full blur-2xl"></div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={slideIn} className="pt-8 lg:pt-0">
            <motion.div
              className="flex items-center mb-8"
              variants={fadeIn}
            >
              <div className="relative flex items-center">
                <Image
                  src={logo}
                  alt="Ganga-Menú"
                  width={120}
                  height={120}
                  className="w-auto h-24 transition-transform duration-300 mr-[-10px]"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
                <span className="text-4xl font-bold text-[#0d4b3d] dark:text-white">anga-Menú</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6 text-center lg:text-left leading-tight"
              variants={fadeIn}
            >
              {dictionary.web.home.hero.title || "Gestión Completa para tu Restaurante"}
            </motion.h1>

            <motion.p className="text-gray-600 dark:text-gray-300 text-lg mb-8 text-center lg:text-left leading-relaxed" variants={fadeIn}>
              {dictionary.web.home.hero.subtitle || "Desde menús digitales interactivos hasta gestión completa de pedidos. Los mozos toman órdenes fácilmente y la cocina controla cada preparación en tiempo real. Todo en una plataforma integrada."}
            </motion.p>

            {/* Feature highlights */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg backdrop-blur-sm">
                <div className="w-10 h-10 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center">
                  <MenuIcon className="w-5 h-5 text-[#0d4b3d]" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Menús Digitales</span>
              </div>
              <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg backdrop-blur-sm">
                <div className="w-10 h-10 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#0d4b3d]" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gestión de Pedidos</span>
              </div>
              <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg backdrop-blur-sm">
                <div className="w-10 h-10 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-[#0d4b3d]" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Panel de Cocina</span>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/sign-in`}>
                <motion.button
                  className="bg-[#0d4b3d] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#0d4b3d]/90 transition-all shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {"Comenzar Gratis"}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="#features">
                <motion.button
                  className="border-2 border-[#0d4b3d] text-[#0d4b3d] px-8 py-4 rounded-lg font-medium hover:bg-[#0d4b3d] hover:text-white transition-all shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {"Ver Demo Gratis"}
                  <Smartphone className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Floating Gallery Layout */}
          <motion.div
            className="flex justify-center items-center relative h-96 lg:h-[500px] w-full"
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
              className="absolute z-10 left-0 top-8 w-[30rem] h-[22rem] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 transform hover:scale-105 transition-transform cursor-pointer"
            >
              <Image
                src={gangaMenu}
                alt="Menús Digitales Interactivos"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 288px"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <MenuIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{(dictionary.web.home.hero as any)?.gallery?.menu || "Menús Digitales"}</h3>
                    <p className="text-sm text-white/90">{(dictionary.web.home.hero as any)?.gallery?.menuDesc || "Hermosos e interactivos"}</p>
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
              className="absolute z-20 right-4 top-4 w-64 h-44 rounded-xl overflow-hidden shadow-xl border-3 border-white dark:border-gray-800 transform hover:scale-105 transition-transform cursor-pointer"
            >
              <Image
                src={gangaMozos}
                alt="Sistema para Mozos"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 256px"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{(dictionary.web.home.hero as any)?.gallery?.waiters || "Sistema Mozos"}</h3>
                    <p className="text-xs text-white/90">{(dictionary.web.home.hero as any)?.gallery?.waitersDesc || "Gestión eficiente"}</p>
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
              className="absolute z-30 bottom-8 left-1/2 transform -translate-x-1/2 w-68 h-46 rounded-xl overflow-hidden shadow-xl border-3 border-white dark:border-gray-800 hover:scale-105 transition-transform cursor-pointer"
              style={{ width: '17rem', height: '11.5rem' }}
            >
              <Image
                src={gangaCocina}
                alt="Panel de Cocina"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 272px"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{(dictionary.web.home.hero as any)?.gallery?.kitchen || "Panel Cocina"}</h3>
                    <p className="text-xs text-white/90">{(dictionary.web.home.hero as any)?.gallery?.kitchenDesc || "Control en tiempo real"}</p>
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
              className="absolute top-2 right-2 bg-[#0d4b3d] text-white p-2 rounded-full shadow-lg w-12 h-12 flex items-center justify-center z-30"
            >
              <Clock className="w-5 h-5" />
            </motion.div>

            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                transition: { repeat: Infinity, duration: 5, delay: 1.5 }
              }}
              className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 border-2 border-[#0d4b3d] text-[#0d4b3d] p-2 rounded-full shadow-lg w-10 h-10 flex items-center justify-center z-30"
            >
              <Smartphone className="w-4 h-4" />
            </motion.div>

            {/* Additional decorative elements */}
            <motion.div
              animate={{
                rotate: [0, 360],
                transition: { repeat: Infinity, duration: 10, ease: "linear" }
              }}
              className="absolute top-1/2 left-1/4 w-3 h-3 bg-[#0d4b3d]/30 rounded-full z-5"
            ></motion.div>

            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.7, 0.3],
                transition: { repeat: Infinity, duration: 3 }
              }}
              className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-[#0d4b3d]/40 rounded-full z-5"
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

