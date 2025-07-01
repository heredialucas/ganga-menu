'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Mail, Phone, Users, ChefHat, Smartphone } from 'lucide-react';
import logo from '@/public/logo.png';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Dictionary } from '@repo/internationalization';

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
    navigation: dictionary?.web.home.footer?.navigation || dictionary?.web.header?.navigation || "Navegación",
    home: dictionary?.web.header?.home || "Inicio",
    features: dictionary?.web.home.footer?.features || dictionary?.web.header?.features || "Características",
    pricing: dictionary?.web.header?.pricing || "Precios",
    about: dictionary?.web.header?.about || "Acerca de",
    contact: dictionary?.web.home.footer?.contact || dictionary?.web.header?.contact || "Contacto"
  };

  // Features labels with dictionary fallbacks
  const featureLabels = {
    features: dictionary?.web.home.footer?.features || "Características"
  };

  // Contact labels with dictionary fallbacks
  const contactLabels = {
    contact: dictionary?.web.home.footer?.contact || "Contacto"
  };

  return (
    <footer className="relative mt-24 border-t border-[#0d4b3d]/10 dark:border-[#0d4b3d]/30 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0d4b3d]/5 dark:bg-[#0d4b3d]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-[#0d4b3d]/5 dark:bg-[#0d4b3d]/5 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-16">
          {/* Logo and description */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex gap-2 items-center mb-6"
            >
              <div className="relative flex items-center">
                <Image
                  src={logo}
                  alt="Ganga-Menú"
                  width={60}
                  height={60}
                  className="h-14 w-auto mr-[-7px]"
                />
                <span className="text-3xl font-bold text-[#0d4b3d] dark:text-white">anga-Menú</span>
              </div>
            </motion.div>

            <p className="leading-relaxed max-w-sm text-gray-600 dark:text-gray-300 mb-6">
              {dictionary?.web.home.footer?.companyDescription || "Plataforma integral que conecta menús digitales, gestión de pedidos, mozos y cocina en un sistema sincronizado para revolucionar la operación de tu restaurante."}
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#0d4b3d] dark:text-gray-400 dark:hover:text-[#0d4b3d]/90 transition-colors"
              >
                <Facebook />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#0d4b3d] dark:text-gray-400 dark:hover:text-[#0d4b3d]/90 transition-colors"
              >
                <Instagram />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#0d4b3d] dark:text-gray-400 dark:hover:text-[#0d4b3d]/90 transition-colors"
              >
                <Linkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 flex flex-col items-center md:items-start">
            <h3 className="font-semibold mb-4 text-center md:text-left text-gray-800 dark:text-white">
              {navLabels.navigation}
            </h3>
            <ul className="space-y-3 text-center md:text-left">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
                >
                  {navLabels.home}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#features`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
                >
                  {navLabels.features}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/pricing`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
                >
                  {navLabels.pricing}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#faq`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
                >
                  {navLabels.about}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0d4b3d] dark:hover:text-[#0d4b3d]/90 transition-colors"
                >
                  {navLabels.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start">
            <h3 className="font-semibold mb-4 text-center md:text-left text-gray-800 dark:text-white">
              {featureLabels.features}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 justify-center md:justify-start text-gray-600 dark:text-gray-300">
                <Smartphone className="w-4 h-4 text-[#0d4b3d]" />
                <span>{dictionary?.web.home.footer?.menuCreation || "Menús Digitales Interactivos"}</span>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start text-gray-600 dark:text-gray-300">
                <Users className="w-4 h-4 text-[#0d4b3d]" />
                <span>{(dictionary?.web.home.footer as any)?.orderManagement || "Gestión de Pedidos"}</span>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start text-gray-600 dark:text-gray-300">
                <ChefHat className="w-4 h-4 text-[#0d4b3d]" />
                <span>{(dictionary?.web.home.footer as any)?.kitchenControl || "Panel de Cocina"}</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start">
            <h3 className="font-semibold mb-4 text-center md:text-left text-gray-800 dark:text-white">
              {contactLabels.contact}
            </h3>
            <ul className="space-y-3 text-center md:text-left">
              <li className="flex items-center gap-3 justify-center md:justify-start text-gray-600 dark:text-gray-300">
                <Mail className="w-4 h-4 text-[#0d4b3d]" />
                <span>info@ganga-menu.com</span>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4 text-[#0d4b3d]" />
                <span>+34 900 123 456</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 bg-[#0d4b3d] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0d4b3d]/90 transition-all shadow-lg"
              >
                {dictionary?.web.home.footer?.getStarted || "Comenzar"}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#0d4b3d]/10 dark:border-[#0d4b3d]/30 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="text-center md:text-left">
              © 2024 Ganga-Menú. {dictionary?.web.home.footer?.rights || "Todos los derechos reservados"}.
            </div>
            <div className="flex gap-6">
              <Link href={`/${locale}/legal/privacy`} className="hover:text-[#0d4b3d] transition-colors">
                {dictionary?.web.home.footer?.privacy || "Política de Privacidad"}
              </Link>
              <Link href={`/${locale}/legal/terms`} className="hover:text-[#0d4b3d] transition-colors">
                {dictionary?.web.home.footer?.terms || "Términos y Condiciones"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
