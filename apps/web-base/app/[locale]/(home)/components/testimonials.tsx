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
      className="w-full py-20 lg:py-40 relative bg-green-50/50 dark:bg-green-900/10"
      id="business"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute right-0 bottom-10 w-80 h-80 bg-green-400/10 dark:bg-green-400/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-green-600/20 dark:bg-green-600/10 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div variants={fadeIn} className="flex flex-col gap-6 mb-12">
          <h2 className="text-center font-bold text-3xl md:text-4xl text-gray-800 dark:text-white var(--font-nunito)">
            {dictionary.web.home.testimonials?.title || "Lo que dicen nuestros usuarios"}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto text-lg var(--font-nunito)">
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
                <CarouselItem className="md:basis-1/2 lg:basis-1/2 p-2" key={index}>
                  <div className="flex h-full flex-col justify-between rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <Quote className="h-8 w-8 text-green-400/50 dark:text-green-400/30" />
                    </div>

                    <div className="flex flex-col gap-4 flex-grow">
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white var(--font-nunito) mb-2">{item.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 var(--font-nunito)">
                          "{item.description}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-green-100 dark:border-green-800/50">
                      <div className="flex items-start justify-center h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full text-lg font-bold text-green-600 dark:text-green-400">
                        {item.author.name.substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white var(--font-nunito)">{item.author.name}</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 var(--font-nunito)">
                          <MapPin className="h-3 w-3 mr-1" />
                          {('location' in item.author ? item.author.location : item.author.name)}
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
