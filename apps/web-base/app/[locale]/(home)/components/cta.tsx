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
    <div className="w-full py-12 sm:py-16 lg:py-20 xl:py-32 bg-[#0d4b3d] dark:bg-[#0d4b3d]/80" id="transformacion">
      <div className="w-full sm:container sm:mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
          id="contact"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            {dictionary.web.home.cta.title}
          </h2>
          <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-white rounded-full mx-auto mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed px-4">
            {dictionary.web.home.cta.description}
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
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-xl">
              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0d4b3d]/20 dark:bg-[#0d4b3d]/50 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-[#0d4b3d] dark:text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
                        {dictionary.web.global.primaryCta}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{dictionary.web.home.cta.platformDescription}</p>
                    </div>
                  </div>

                  <p className="mb-6 sm:mb-8 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                    {dictionary.web.home.cta.revolutionDescription}
                  </p>

                  <Link
                    href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/sign-in`}
                    className="w-full sm:w-auto bg-[#0d4b3d] hover:bg-[#0d4b3d]/90 text-white flex items-center justify-center gap-2 py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-medium transition-all shadow-lg text-center inline-flex text-sm sm:text-base"
                  >
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{dictionary.web.global.primaryCta}</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d]" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1 text-sm sm:text-base">{dictionary.web.home.cta.features.digitalMenus}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{dictionary.web.home.cta.features.digitalMenusDesc}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d]" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1 text-sm sm:text-base">{dictionary.web.home.cta.features.orderManagement}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{dictionary.web.home.cta.features.orderManagementDesc}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d]" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1 text-sm sm:text-base">{dictionary.web.home.cta.features.kitchenPanel}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{dictionary.web.home.cta.features.kitchenPanelDesc}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0d4b3d]/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d]" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1 text-sm sm:text-base">{dictionary.web.home.cta.features.optimization}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{dictionary.web.home.cta.features.optimizationDesc}</p>
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
