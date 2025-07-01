import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

type PrivacyProps = {
    params: Promise<{
        locale: string;
    }>;
};

export const generateMetadata = async ({
    params,
}: PrivacyProps): Promise<Metadata> => {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    return createMetadata({
        title: 'Política de Privacidad - Ganga-Menú',
        description: 'Política de privacidad y protección de datos de Ganga-Menú. Conoce cómo protegemos tu información.'
    });
};

const Privacy = async ({ params }: PrivacyProps) => {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    return (
        <div className="w-full py-20 lg:py-32 bg-gray-50">
            <div className="container mx-auto max-w-4xl">
                <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12">
                    <h1 className="text-3xl md:text-4xl font-black text-[#0d4b3d] mb-8 text-center">
                        Política de Privacidad
                    </h1>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-8 text-center">
                            <strong>Última actualización:</strong> 24 de octubre de 2024
                        </p>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">1. Información que Recopilamos</h2>
                                <div className="space-y-4 text-gray-700">
                                    <h3 className="text-lg font-semibold">Información de la Cuenta</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Nombre completo y dirección de correo electrónico</li>
                                        <li>Información del restaurante (nombre, dirección, teléfono)</li>
                                        <li>Datos de configuración del menú y productos</li>
                                        <li>Información de facturación y pagos</li>
                                    </ul>

                                    <h3 className="text-lg font-semibold">Información de Uso</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Datos de navegación y uso de la plataforma</li>
                                        <li>Logs de actividad del sistema</li>
                                        <li>Estadísticas de pedidos y operaciones</li>
                                        <li>Información técnica del dispositivo y navegador</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">2. Cómo Utilizamos tu Información</h2>
                                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                    <li>Proporcionar y mantener nuestros servicios de gestión de restaurantes</li>
                                    <li>Procesar transacciones y gestionar facturación</li>
                                    <li>Enviar comunicaciones importantes sobre el servicio</li>
                                    <li>Mejorar y personalizar la experiencia del usuario</li>
                                    <li>Proporcionar soporte técnico y atención al cliente</li>
                                    <li>Cumplir con obligaciones legales y regulatorias</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">3. Compartir Información</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en los siguientes casos:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Proveedores de servicios:</strong> Procesadores de pago, servicios de hosting y análisis</li>
                                        <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o autoridades competentes</li>
                                        <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos, propiedad o seguridad</li>
                                        <li><strong>Consentimiento:</strong> Con tu autorización explícita</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">4. Seguridad de Datos</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Encriptación SSL/TLS para todas las transmisiones de datos</li>
                                        <li>Servidores seguros con acceso restringido</li>
                                        <li>Copias de seguridad regulares y cifradas</li>
                                        <li>Monitoreo continuo de seguridad</li>
                                        <li>Acceso limitado solo al personal autorizado</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">5. Tus Derechos</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>Tienes derecho a:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Acceso:</strong> Solicitar una copia de tu información personal</li>
                                        <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                                        <li><strong>Eliminación:</strong> Solicitar la eliminación de tu información</li>
                                        <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                                        <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
                                        <li><strong>Limitación:</strong> Restringir el procesamiento en ciertas circunstancias</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">6. Cookies y Tecnologías Similares</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>Utilizamos cookies y tecnologías similares para:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Mantener tu sesión iniciada</li>
                                        <li>Recordar tus preferencias</li>
                                        <li>Analizar el uso de nuestra plataforma</li>
                                        <li>Mejorar la funcionalidad y rendimiento</li>
                                    </ul>
                                    <p>Puedes controlar las cookies a través de la configuración de tu navegador.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">7. Retención de Datos</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>Conservamos tu información personal mientras:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Mantengas una cuenta activa con nosotros</li>
                                        <li>Sea necesaria para proporcionar nuestros servicios</li>
                                        <li>Sea requerida por obligaciones legales o regulatorias</li>
                                        <li>Sea necesaria para resolver disputas o hacer cumplir acuerdos</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">8. Transferencias Internacionales</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>Tus datos pueden ser transferidos y procesados en países fuera de tu jurisdicción. Aseguramos que estas transferencias cumplan con los estándares de protección de datos aplicables.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">9. Cambios a esta Política</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cambios significativos por correo electrónico o mediante un aviso prominente en nuestra plataforma.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">10. Contacto</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>Si tienes preguntas sobre esta política de privacidad o el manejo de tus datos, contáctanos:</p>
                                    <ul className="list-none space-y-2">
                                        <li><strong>Email:</strong> privacy@ganga-menu.com</li>
                                        <li><strong>Dirección:</strong> [Dirección de la empresa]</li>
                                        <li><strong>Teléfono:</strong> [Número de teléfono]</li>
                                    </ul>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy; 