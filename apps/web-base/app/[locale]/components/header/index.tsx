'use client';

import { env } from '@/env';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { Button } from '@repo/design-system/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@repo/design-system/components/ui/navigation-menu';
import { Menu, MoveRight, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import type { Dictionary } from '@repo/internationalization';
import Image from 'next/image';
import logo from '@/public/logo.png';
import { LanguageSwitcher } from './language-switcher';

type HeaderProps = {
  dictionary: Dictionary;
  locale: string;
};

export const Header = ({ dictionary, locale }: HeaderProps) => {
  const pathname = usePathname();
  const [rotation, setRotation] = useState(0);

  // Logo rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 90) % 360);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    {
      title: dictionary.web.header.features || 'Features',
      href: `/${locale}#features`,
    },
    {
      title: dictionary.web.header.pricing || 'Pricing',
      href: `/${locale}/pricing`,
    },
    {
      title: dictionary.web.header.about || 'About',
      href: `/${locale}#faq`,
    },
    {
      title: dictionary.web.header.contact || 'Contact',
      href: `/${locale}/contact`,
    }
  ];

  // Ensure first letter is capitalized for all navigation items
  const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const [isOpen, setOpen] = useState(false);
  return (
    <header className="sticky top-0 left-0 z-40 w-full border-b bg-background">
      <div className="container relative mx-auto flex items-center justify-between min-h-14 sm:min-h-16 px-3 sm:px-4">
        {/* Logo on the left */}
        <div className="flex items-center">
          <Link href={`/${locale}`} className="flex items-center">
            <div className="relative flex items-center">
              <Image
                src={logo}
                alt="Ganga-Menú"
                width={100}
                height={40}
                className="w-auto h-8 sm:h-10 transition-transform duration-300 mr-[-4px] sm:mr-[-5px]"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
              <span className="text-lg sm:text-xl font-bold text-[#0d4b3d] dark:text-white">anga-Menú</span>
            </div>
          </Link>
        </div>

        {/* Navigation in the center - desktop only */}
        <div className="hidden lg:flex items-center justify-center flex-1">
          <NavigationMenu>
            <NavigationMenuList className="flex flex-row justify-center gap-1 sm:gap-2">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuLink asChild>
                    <Button variant="ghost" asChild className="font-nunito font-bold hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3 text-sm sm:text-base">
                      <Link href={item.href}>{capitalizeFirstLetter(item.title)}</Link>
                    </Button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* <ModeToggle /> */}
          <LanguageSwitcher />

          {/* Single CTA Button - Hidden on mobile */}
          <Link href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/sign-in`} className="hidden sm:inline-flex">
            <Button className="bg-[#0d4b3d] hover:bg-[#0d4b3d]/90 text-white font-nunito font-bold px-3 sm:px-4 py-1 h-8 sm:h-9 text-xs sm:text-sm">
              {(dictionary.web.header as any)?.tryFree || 'Comenzar Gratis'}
            </Button>
          </Link>

          {/* Mobile menu button */}
          <Button variant="ghost" onClick={() => setOpen(!isOpen)} className="lg:hidden ml-1 sm:ml-2 px-1 sm:px-2">
            {isOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>

        {/* Mobile navigation menu */}
        {isOpen && (
          <div className="lg:hidden container absolute top-14 sm:top-16 left-0 right-0 flex w-full flex-col gap-4 sm:gap-6 border-t bg-background py-3 sm:py-4 shadow-lg z-50">
            {navigationItems.map((item) => (
              <div key={item.title}>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <Link
                    href={item.href}
                    className="flex items-center justify-between font-nunito font-bold px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <span>{capitalizeFirstLetter(item.title)}</span>
                    <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            ))}
            <div className="px-3 sm:px-4 space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
              {/* <ModeToggle /> */}
              <div className="flex justify-center sm:justify-start">
                <LanguageSwitcher />
              </div>

              {/* Mobile CTA Button */}
              {env.NEXT_PUBLIC_APP_URL && (
                <Link
                  href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/sign-in`}
                  className="flex items-center justify-between font-nunito font-bold bg-[#0d4b3d] text-white rounded-lg px-4 py-3 text-base sm:text-lg hover:bg-[#0d4b3d]/90 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span>{(dictionary.web.header as any)?.tryFree || 'Comenzar Gratis'}</span>
                  <MoveRight className="h-4 w-4 stroke-1 text-white" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
