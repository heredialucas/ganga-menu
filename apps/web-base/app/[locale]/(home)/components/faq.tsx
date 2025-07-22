'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/design-system/components/ui/accordion';
import { Button } from '@repo/design-system/components/ui/button';
import type { Dictionary } from '@repo/internationalization';
import { MessageCircle, HelpCircle, Leaf, RecycleIcon, Utensils, Clock, DollarSign, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeIn } from '../lib/animations';

type FAQProps = {
  dictionary: Dictionary;
  locale: string;
};

// Sample FAQ items to use if dictionary doesn't have them
const sampleFaqItems = [
  {
    question: "¿Cómo funciona Ganga-Menú?",
    answer: "Ganga-Menú es una plataforma que permite a los restaurantes crear menús digitales interactivos. Subes fotos de tus platos, agregas descripciones y precios, y obtienes un enlace único para compartir con tus clientes. Es fácil, rápido y totalmente personalizable."
  },
  {
    question: "¿Qué tipo de restaurantes pueden usar Ganga-Menú?",
    answer: "Cualquier tipo de establecimiento gastronómico: restaurantes, cafeterías, bares, pizzerías, panaderías, food trucks, etc. Nuestra plataforma se adapta a cualquier tipo de menú, desde comida rápida hasta alta cocina."
  },
  {
    question: "¿Es difícil actualizar mi menú?",
    answer: "Para nada. Puedes actualizar precios, agregar especiales del día, cambiar descripciones o subir nuevas fotos en cuestión de segundos desde nuestro panel de administración. Los cambios se reflejan inmediatamente en tu menú digital."
  },
  {
    question: "¿Puedo personalizar el diseño de mi menú?",
    answer: "Sí, puedes personalizar colores, añadir el logo de tu restaurante, organizar las categorías como prefieras y destacar tus platos especiales. Todo se hace de forma visual e intuitiva."
  },
  {
    question: "¿Cuánto cuesta usar Ganga-Menú?",
    answer: "Ofrecemos diferentes planes adaptados a las necesidades de cada restaurante. Tenemos un plan gratuito para empezar, y planes profesionales con características avanzadas. Visita nuestra página de precios para más detalles."
  },
  {
    question: "¿Necesito conocimientos técnicos para usar Ganga-Menú?",
    answer: "No necesitas ningún conocimiento técnico. Nuestra plataforma está diseñada para ser súper intuitiva. Si tienes dudas, nuestro equipo de soporte está siempre disponible para ayudarte."
  }
];

export const FAQ = ({ dictionary, locale }: FAQProps) => {
  // Create WhatsApp message 
  const getWhatsAppMessage = () => {
    return "¡Hola! Tengo preguntas sobre Ganga-Menú para crear mi menú digital. Me interesa saber más sobre cómo funciona y cómo puedo empezar a usarlo. ¡Gracias!";
  };

  // Get FAQ items from dictionary if available, otherwise use samples
  const faqItems = dictionary.web.home.faq?.items?.length > 0
    ? dictionary.web.home.faq.items
    : sampleFaqItems;

  return (
    <div className="w-full py-12 sm:py-16 lg:py-20 xl:py-40" id="faq">
      <div className="w-full sm:container sm:mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">
            {dictionary.web.home.faq?.title || "Preguntas frecuentes"}
          </h2>
          <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-[#0d4b3d]/70 to-[#0d4b3d] rounded-full mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4">
            {dictionary.web.home.faq?.description || "Respuestas a las dudas más comunes sobre Ganga-Menú y cómo crear tu menú digital"}
          </p>
        </motion.div>

        <div className="grid gap-8 sm:gap-10 lg:grid-cols-2">
          <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="flex flex-col gap-4 sm:gap-6 items-center lg:items-start"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/30 rounded-lg sm:rounded-xl flex items-center justify-center mb-2">
              <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[#0d4b3d] dark:text-white" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white text-center lg:text-left">
              {dictionary.web.home.faq?.needMore || "¿Necesitas más información?"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center lg:text-left mb-4 text-sm sm:text-base">
              {dictionary.web.home.faq?.contactDescription || "Contáctanos si tienes dudas sobre cómo usar Ganga-Menú o quieres saber más sobre cómo digitalizar tu menú"}
            </p>
            <Button className="gap-2 bg-[#0d4b3d] hover:bg-[#0d4b3d]/80 text-white shadow-md text-xs sm:text-sm lg:text-base whitespace-normal text-center flex-wrap h-auto py-2 sm:py-3 px-3 sm:px-4" asChild>
              <Link href={`/${locale}/contact`}>
                <span className="break-words">{dictionary.web.home.faq?.cta || "Contáctanos"}</span>
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              </Link>
            </Button>

            <div className="flex gap-4 sm:gap-6 mt-6 sm:mt-8 justify-center lg:justify-start">
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/30 rounded-full flex items-center justify-center">
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d] dark:text-white" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Ecológico</span>
              </div>
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/30 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d] dark:text-white" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Ahorro</span>
              </div>
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0d4b3d]/10 dark:bg-[#0d4b3d]/30 rounded-full flex items-center justify-center">
                  <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-[#0d4b3d] dark:text-white" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Delicioso</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="flex flex-col gap-3 sm:gap-4"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`index-${index}`}
                  className="mb-2 sm:mb-3 border border-[#0d4b3d]/20 dark:border-[#0d4b3d]/40 rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
                >
                  <AccordionTrigger className="px-3 sm:px-4 py-2 sm:py-3 hover:no-underline font-medium text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-3 sm:px-4 py-2 sm:py-3 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
