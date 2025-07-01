'use client';

import type { Dictionary } from '@repo/internationalization';
import { motion } from 'framer-motion';
import { fadeIn } from '../lib/animations';
import { ShoppingBag, ArrowRight, Smartphone, ChefHat, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { env } from '@/env';

type CTAProps = {
  dictionary: Dictionary;
  locale?: string;
};

export const CTA = ({ dictionary, locale = 'es' }: CTAProps) => {
  return (
    <div className="w-full py-20 lg:py-32 bg-[#0d4b3d] dark:bg-[#0d4b3d]/80" id="transformacion">
      <div className="container mx-auto">
        <motion.div
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
          id="contact"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {dictionary.web.home.cta.title || "¿Listo para Transformar tu Restaurante?"}
          </h2>
          <div className="w-20 h-1 bg-white rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-white/90 leading-relaxed">
            {dictionary.web.home.cta.description || "Únete a restaurantes que revolucionaron su operación con nuestra plataforma integrada: menús digitales, gestión de pedidos y control de cocina"}
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Main CTA Card */}
          <motion.div
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/50 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-[#0d4b3d] dark:text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {dictionary.web.global.primaryCta || "Transforma tu restaurante"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">Plataforma completa e integrada</p>
                    </div>
                  </div>

                  <p className="mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
                    Revoluciona tu operación con nuestra solución integral: menús digitales hermosos, sistema de pedidos para mozos y panel de control para cocina. Todo sincronizado en tiempo real.
                  </p>

                  <Link
                    href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/sign-in`}
                    className="w-full md:w-auto bg-[#0d4b3d] hover:bg-[#0d4b3d]/90 text-white flex items-center justify-center gap-2 py-4 px-8 rounded-lg font-medium transition-all shadow-lg text-center inline-flex"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>{dictionary.web.global.primaryCta || "¡Prueba Gratis Ahora!"}</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="w-12 h-12 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Smartphone className="w-6 h-6 text-[#0d4b3d]" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Menús Digitales</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Hermosos e interactivos</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="w-12 h-12 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-[#0d4b3d]" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Gestión de Pedidos</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Para mozos eficientes</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="w-12 h-12 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ChefHat className="w-6 h-6 text-[#0d4b3d]" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Panel de Cocina</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Control en tiempo real</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="w-12 h-12 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-[#0d4b3d]" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Optimización</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Reduce tiempos de espera</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
