'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '../lib/animations';
import { Bell, Mail, Lock } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';

type NewsletterProps = {
    dictionary: Dictionary;
};

export const Newsletter = ({ dictionary }: NewsletterProps) => {
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [sendingNewsletter, setSendingNewsletter] = useState(false);
    const [newsletterStatus, setNewsletterStatus] = useState<{
        type: 'success' | 'error' | '';
        message: string;
    }>({ type: '', message: '' });

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación básica
        if (!newsletterEmail || !newsletterEmail.includes('@')) {
            setNewsletterStatus({
                type: 'error',
                message: dictionary.web.home.newsletter.validation || 'Please enter a valid email'
            });
            return;
        }

        try {
            setSendingNewsletter(true);
            setNewsletterStatus({ type: '', message: '' });

            // Simulación de envío (reemplazar con la llamada a API real)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Éxito
            setNewsletterStatus({
                type: 'success',
                message: dictionary.web.home.newsletter.success || 'Thank you for subscribing!'
            });
            setNewsletterEmail('');
        } catch (error) {
            // Error
            setNewsletterStatus({
                type: 'error',
                message: dictionary.web.home.newsletter.error || 'Something went wrong. Please try again.'
            });
        } finally {
            setSendingNewsletter(false);
        }
    };

    return (
        <motion.section
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="w-full py-12 sm:py-16 lg:py-24 relative"
        >
            {/* Elementos decorativos modernos */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-5 sm:-right-10 top-5 sm:top-10 w-36 sm:w-48 lg:w-72 h-36 sm:h-48 lg:h-72 bg-blue-400/20 rounded-full blur-2xl sm:blur-3xl"></div>
                <div className="absolute -left-10 sm:-left-20 bottom-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-blue-500/10 rounded-full blur-2xl sm:blur-3xl"></div>
                <div className="absolute right-1/3 top-1/2 w-1 sm:w-2 h-1 sm:h-2 bg-white/30 rounded-full animate-ping"></div>
                <div className="absolute left-1/4 bottom-1/4 w-1.5 sm:w-3 h-1.5 sm:h-3 bg-blue-400/40 rounded-full animate-pulse"></div>

                {/* Líneas decorativas */}
                <div className="absolute top-0 left-1/3 w-px h-16 sm:h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                <div className="absolute bottom-0 right-1/3 w-px h-16 sm:h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
            </div>

            <div className="w-full sm:container sm:mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto relative">
                    <motion.div
                        variants={{
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0 },
                        }}
                        className="bg-white/5 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-white/10 shadow-xl sm:shadow-2xl"
                    >
                        <div className="text-center mb-6 sm:mb-8">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6"
                            >
                                <Bell className="w-6 h-6 sm:w-8 sm:h-8" />
                            </motion.div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                                {dictionary.web.home.newsletter.title || 'Stay Updated'}
                            </h2>
                            <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto mb-4 sm:mb-6"></div>
                            <p className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
                                {dictionary.web.home.newsletter.description || 'Subscribe to receive the latest news about digital product development and MVPs'}
                            </p>
                        </div>

                        <motion.div
                            className="max-w-md mx-auto"
                            variants={{
                                initial: { opacity: 0, y: 20 },
                                animate: { opacity: 1, y: 0 },
                            }}
                        >
                            <div className="bg-white/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                                <form
                                    onSubmit={handleNewsletterSubmit}
                                    className="flex flex-col sm:flex-row gap-2 sm:gap-3"
                                >
                                    <div className="flex-1 relative">
                                        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                                            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder={dictionary.web.home.newsletter.placeholder || 'Your email address'}
                                            value={newsletterEmail}
                                            onChange={(e) => setNewsletterEmail(e.target.value)}
                                            required
                                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white border border-white/10 text-black placeholder-black/40 focus:border-blue-400/50 focus:outline-none transition-colors text-sm sm:text-base"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={sendingNewsletter}
                                        className="sm:w-auto w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                    >
                                        {sendingNewsletter
                                            ? (dictionary.web.home.newsletter.subscribing || 'Subscribing...')
                                            : (dictionary.web.home.newsletter.subscribe || 'Subscribe')}
                                    </motion.button>
                                </form>
                            </div>

                            {/* Mensaje de estado */}
                            {newsletterStatus.type && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${newsletterStatus.type === "success"
                                        ? "bg-green-500/10 text-green-200"
                                        : "bg-red-500/10 text-red-200"
                                        }`}
                                >
                                    {newsletterStatus.message}
                                </motion.div>
                            )}

                            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{dictionary.web.home.newsletter.privacy || 'We promise not to send spam, only relevant content'}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
}; 