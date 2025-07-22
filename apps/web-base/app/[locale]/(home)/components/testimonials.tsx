'use client';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@repo/design-system/components/ui/carousel';
import type { Dictionary } from '@repo/internationalization';
import { Star, Quote, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeIn } from '../lib/animations';

type TestimonialsProps = {
  dictionary: Dictionary;
};

export const Testimonials = ({ dictionary }: TestimonialsProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Sample testimonials to use if dictionary doesn't have them
  const sampleTestimonials = [
    {
      title: "¡Comida deliciosa a mitad de precio!",
      description: "Uso Ganga-Menú en mi restaurante y mis clientes están encantados. Pueden ver todos nuestros platos con fotos hermosas y hacer pedidos más fácilmente.",
      author: {
        name: "María García",
        location: "Madrid"
      }
    },
    {
      title: "Gran manera de reducir el desperdicio",
      description: "Me encanta saber que estoy contribuyendo a reducir el desperdicio alimentario mientras disfruto de comida increíble. La app es súper intuitiva y los establecimientos son de primera.",
      author: {
        name: "Carlos Rodríguez",
        location: "Barcelona"
      }
    },
    {
      title: "Descubrí mis cafeterías favoritas",
      description: "Implementamos Ganga-Menú y ahora actualizar nuestro menú es súper fácil. Los especiales del día se cambian en segundos y los clientes lo ven inmediatamente.",
      author: {
        name: "Laura Martínez",
        location: "Valencia"
      }
    },
    {
      title: "Ahorro y calidad garantizada",
      description: "Llevo 3 meses usando la app y nunca me ha decepcionado. Los packs sorpresa son siempre de calidad y el ahorro es real. Lo recomiendo a todo el mundo.",
      author: {
        name: "Pablo Sánchez",
        location: "Sevilla"
      }
    }
  ];

  // Get testimonials from dictionary if available, otherwise use samples
  const testimonials = dictionary.web.home.testimonials?.items?.length > 0
    ? dictionary.web.home.testimonials.items
    : sampleTestimonials;

  useEffect(() => {
    if (!api) {
      return;
    }

    const timer = setTimeout(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0);
        api.scrollTo(0);
      } else {
        api.scrollNext();
        setCurrent(current + 1);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [api, current]);

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="w-full py-12 sm:py-16 lg:py-20 xl:py-40 relative bg-green-50/50 dark:bg-green-900/10"
      id="business"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-10 sm:-left-20 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute right-0 bottom-5 sm:bottom-10 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-green-400/10 dark:bg-green-400/5 rounded-full blur-xl sm:blur-2xl"></div>
        <div className="absolute top-1/3 left-1/2 w-1 sm:w-2 h-1 sm:h-2 bg-green-600/20 dark:bg-green-600/10 rounded-full"></div>
      </div>

      <div className="w-full sm:container sm:mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeIn} className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-12">
          <h2 className="text-center font-bold text-2xl sm:text-3xl md:text-4xl text-gray-800 dark:text-white var(--font-nunito)">
            {dictionary.web.home.testimonials?.title || "Lo que dicen nuestros usuarios"}
          </h2>
          <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto mb-1 sm:mb-2"></div>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto text-sm sm:text-base lg:text-lg var(--font-nunito) px-4">
            {dictionary.web.home.testimonials?.description || "Descubre cómo Ganga-Menú está transformando la experiencia gastronómica de restaurantes y clientes"}
          </p>
        </motion.div>

        <motion.div
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
          className="w-full"
        >
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {testimonials.map((item, index) => (
                <CarouselItem className="basis-full sm:basis-1/2 lg:basis-1/2 p-2" key={index}>
                  <div className="flex h-full flex-col justify-between rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-lg border border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="flex space-x-0.5 sm:space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-green-400/50 dark:text-green-400/30" />
                    </div>

                    <div className="flex flex-col gap-3 sm:gap-4 flex-grow">
                      <div className="flex flex-col">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white var(--font-nunito) mb-1 sm:mb-2">{item.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 var(--font-nunito) text-sm sm:text-base">
                          "{item.description}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-green-100 dark:border-green-800/50">
                      <div className="flex items-start justify-center h-8 w-8 sm:h-10 sm:w-10 bg-green-100 dark:bg-green-900 rounded-full text-sm sm:text-lg font-bold text-green-600 dark:text-green-400">
                        {item.author.name.substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white var(--font-nunito) text-sm sm:text-base">{item.author.name}</p>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 var(--font-nunito)">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.author.location || item.author.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </motion.div>
      </div>
    </motion.section>
  );
};
