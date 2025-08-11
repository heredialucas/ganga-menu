'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Mail, Phone, Users, ChefHat, Smartphone } from 'lucide-react';
import logo from '@/public/logo.png';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Dictionary } from '@repo/internationalization';
import { env } from '@/env';
import { getWebBaseUrl } from '@/lib/utils';

// Simple data structure for saved food
const defaultFoodData = {
  location: '',
  date: '',
  price: 0,
  originalPrice: 0
};

// Use a fallback if the imported one isn't available yet
let savedFoodData;
try {
  savedFoodData = require('../(home)/components/hero').savedFoodData || defaultFoodData;
} catch (e) {
  savedFoodData = defaultFoodData;
}

type FooterProps = {
  dictionary?: Dictionary;
};

export const Footer = ({ dictionary }: FooterProps) => {
  const params = useParams();
  const locale = params.locale as string;

  // Navigation labels with dictionary fallbacks
  const navLabels = {
    navigation: dictionary?.web?.home?.footer?.navigation || "Navigation",
    home: dictionary?.web?.header?.home || "Home",
    features: dictionary?.web?.home?.footer?.features || "Features",
    pricing: dictionary?.web?.header?.pricing || "Pricing",
    about: dictionary?.web?.header?.about || "About",
    contact: dictionary?.web?.home?.footer?.contact || "Contact"
  };

  // Features labels with dictionary fallbacks
  const featureLabels = {
    features: dictionary?.web?.home?.footer?.features || "Features"
  };

  // Contact labels with dictionary fallbacks
  const contactLabels = {
    contact: dictionary?.web?.home?.footer?.contact || "Contact"
  };

  return (
    <footer className="relative mt-12 sm:mt-16 lg:mt-24 border-t border-[#0d4b3d]/10 dark:border-[#0d4b3d]/30 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-[#0d4b3d]/5 dark:bg-[#0d4b3d]/5 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-36 sm:w-48 lg:w-72 h-36 sm:h-48 lg:h-72 bg-[#0d4b3d]/5 dark:bg-[#0d4b3d]/5 rounded-full blur-xl sm:blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 py-8 sm:py-12 lg:py-16">
          {/* Logo and description */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex gap-1 sm:gap-2 items-center mb-4 sm:mb-6"
            >
              <div className="relative flex items-center">
                <Image
                  src={logo}
                  alt="Ganga-Menú"
                  width={60}
                  height={60}
                  className="h-10 sm:h-12 lg:h-14 w-auto mr-[-5px] sm:mr-[-7px]"
                />
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0d4b3d] dark:text-white">anga-Menú</span>
              </div>
            </motion.div>

            <p className="leading-relaxed max-w-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              {dictionary?.web?.home?.footer?.companyDescription || "Integrated platform that connects digital menus, order management, waiters and kitchen in a synchronized system to revolutionize your restaurant operation."}
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a
                href={env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#0d4b3d] dark:text-gray-400 dark:hover:text-[#0d4b3d]/90 transition-colors"
              >
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href={env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#0d4b3d] dark:text-gray-400 dark:hover:text-[#0d4b3d]/90 transition-colors"
              >
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href={env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#0d4b3d] dark:text-gray-400 dark:hover:text-[#0d4b3d]/90 transition-colors"
              >
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="sm:col-span-1 lg:col-span-2 flex flex-col items-center lg:items-start">
            <h3 className="font-semibold mb-3 sm:mb-4 text-center lg:text-left text-gray-800 dark:text-white text-base sm:text-lg">
              {navLabels.navigation}
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-center lg:text-left">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors text-sm sm:text-base"
                >
                  {navLabels.home}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#features`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors text-sm sm:text-base"
                >
                  {navLabels.features}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/pricing`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors text-sm sm:text-base"
                >
                  {navLabels.pricing}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#faq`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors text-sm sm:text-base"
                >
                  {navLabels.about}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors text-sm sm:text-base"
                >
                  {navLabels.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="sm:col-span-1 lg:col-span-3 flex flex-col items-center lg:items-start">
            <h3 className="font-semibold mb-3 sm:mb-4 text-center lg:text-left text-gray-800 dark:text-white text-base sm:text-lg">
              {featureLabels.features}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start text-gray-600 dark:text-gray-300">
                <Smartphone className="w-4 h-4 text-[#0d4b3d]" />
                <span className="text-sm sm:text-base">{dictionary?.web?.home?.footer?.menuCreation || "Interactive Digital Menus"}</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start text-gray-600 dark:text-gray-300">
                <Users className="w-4 h-4 text-[#0d4b3d]" />
                <span className="text-sm sm:text-base">{dictionary?.web?.home?.footer?.orderManagement || "Order Management"}</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start text-gray-600 dark:text-gray-300">
                <ChefHat className="w-4 h-4 text-[#0d4b3d]" />
                <span className="text-sm sm:text-base">{dictionary?.web?.home?.footer?.kitchenControl || "Kitchen Panel"}</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-center lg:items-start">
            <h3 className="font-semibold mb-3 sm:mb-4 text-center lg:text-left text-gray-800 dark:text-white text-base sm:text-lg">
              {contactLabels.contact}
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-center lg:text-left">
              <li className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start text-gray-600 dark:text-gray-300">
                <Mail className="w-4 h-4 text-[#0d4b3d]" />
                <span className="text-sm sm:text-base">heredialucasfac22@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4 text-[#0d4b3d]" />
                <span className="text-sm sm:text-base">3814683069</span>
              </li>
            </ul>
            <div className="mt-4 sm:mt-6">
              <Link
                href={`${getWebBaseUrl()}/${locale}/contact`}
                className="inline-flex items-center gap-2 bg-[#0d4b3d] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-[#0d4b3d]/90 transition-all shadow-lg text-sm sm:text-base"
              >
                {dictionary?.web?.home?.footer?.getStarted || "Contact Us"}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#0d4b3d]/10 dark:border-[#0d4b3d]/30 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <div className="text-center sm:text-left">
              © 2024 Ganga-Menú. {dictionary?.web?.home?.footer?.rights || "All rights reserved"}.
            </div>
            <div className="flex gap-4 sm:gap-6">
              <Link href={`/${locale}/legal/privacy`} className="hover:text-[#0d4b3d] transition-colors">
                {dictionary?.web?.home?.footer?.privacy || "Privacy Policy"}
              </Link>
              <Link href={`/${locale}/legal/terms`} className="hover:text-[#0d4b3d] transition-colors">
                {dictionary?.web?.home?.footer?.terms || "Terms and Conditions"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
