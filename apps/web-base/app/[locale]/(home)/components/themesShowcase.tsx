'use client'

import Image from "next/image";
import type { Dictionary } from "@repo/internationalization";
import { useState, useRef } from "react";
import artistImg from '@/public/artist.png';
import luxuryImg from '@/public/luxury.png';
import neoImg from '@/public/neo.png';
import playfulFanImg from '@/public/playful-fan.png';
import retroImg from '@/public/retro.png';
import zenImg from '@/public/zen.png';

type ThemesShowcaseProps = {
  dictionary: Dictionary;
};

type ThemeKey = "artist" | "luxury" | "neo" | "playfulFan" | "retro" | "zen";

type Theme = {
  key: ThemeKey;
  img: any;
};

const themes: Theme[] = [
  { key: "artist", img: artistImg },
  { key: "luxury", img: luxuryImg },
  { key: "neo", img: neoImg },
  { key: "playfulFan", img: playfulFanImg },
  { key: "retro", img: retroImg },
  { key: "zen", img: zenImg },
];

export function ThemesShowcase({ dictionary }: ThemesShowcaseProps) {
  const t = dictionary.web?.home?.themesShowcase;
  const [currentIndex, setCurrentIndex] = useState(2);
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);
  // Carousel data
  const menuTemplates = themes.map((theme) => ({
    id: theme.key,
    image: theme.img,
    name: t?.themes?.[theme.key] || theme.key,
  }));

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const deltaX = e.touches[0].clientX - startX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        startX.current = null;
      } else if (deltaX < 0 && currentIndex < menuTemplates.length - 1) {
        setCurrentIndex(currentIndex + 1);
        startX.current = null;
      }
    }
  };
  const handleTouchEnd = () => {
    startX.current = null;
  };

  // Mouse drag for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || startX.current === null) return;
    const deltaX = e.clientX - startX.current;
    if (Math.abs(deltaX) > 60) {
      if (deltaX > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        dragging.current = false;
        startX.current = null;
      } else if (deltaX < 0 && currentIndex < menuTemplates.length - 1) {
        setCurrentIndex(currentIndex + 1);
        dragging.current = false;
        startX.current = null;
      }
    }
  };
  const handleMouseUp = () => {
    dragging.current = false;
    startX.current = null;
  };

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-0 sm:px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-8">
          {/* Título y descripción a la izquierda en desktop */}
          <div className="mb-8 sm:mb-16 text-center lg:text-left lg:mb-0 lg:flex-1 flex flex-col justify-center">
            <h2 className="mb-3 text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {t?.title || "Temas personalizados"}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl lg:max-w-full mx-auto lg:mx-0">
              {t?.description || "Explora nuestros estilos únicos para tu menú digital"}
            </p>
          </div>
          {/* Carrusel a la derecha */}
          <div className="w-full max-w-3xl mx-auto lg:mx-0 lg:flex-1">
            <div
              className="relative h-96 overflow-hidden rounded-2xl bg-white dark:bg-gray-900 select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              role="presentation"
            >
              <div className="flex items-center h-full">
                {menuTemplates.map((template, index) => {
                  const offset = index - currentIndex;
                  const absOffset = Math.abs(offset);
                  return (
                    <div
                      key={template.id}
                      className="absolute left-1/2 top-1/2 transition-all duration-700 ease-in-out cursor-pointer"
                      style={{
                        transform: `
                      translateX(${offset * 200 - 150}px)
                      translateY(${Math.sin(offset * 0.5) * 30 - 50}%)
                      scale(${1 - absOffset * 0.2})
                      rotateY(${offset * 15}deg)
                    `,
                        zIndex: 10 - absOffset,
                        opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.3,
                      }}
                      onClick={() => setCurrentIndex(index)}
                    >
                      <div className="w-64 h-80 relative">
                        <Image
                          src={template.image}
                          alt={template.name}
                          fill
                          className="w-full h-full object-cover rounded-xl shadow-2xl"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h4 className="font-bold text-lg truncate max-w-[13rem]">{template.name}</h4>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                {menuTemplates.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? "bg-gray-800 dark:bg-white scale-125" : "bg-gray-300 dark:bg-gray-700"}`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
