import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

type TermsProps = {
    params: Promise<{
        locale: string;
    }>;
};

export const generateMetadata = async ({
    params,
}: TermsProps): Promise<Metadata> => {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    return createMetadata({
        title: 'Términos y Condiciones - Ganga-Menú',
        description: 'Términos y condiciones de uso de la plataforma Ganga-Menú. Conoce nuestras políticas de servicio.'
    });
};

const Terms = async ({ params }: TermsProps) => {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    return (
        <div className="w-full py-20 lg:py-32 bg-gray-50">
            <div className="container mx-auto max-w-4xl">
                <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12">
                    <h1 className="text-3xl md:text-4xl font-black text-[#0d4b3d] mb-8 text-center">
                        Términos y Condiciones
                    </h1>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-8 text-center">
                            <strong>Última actualización:</strong> 24 de octubre de 2024
                        </p>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">1. Aceptación de los Términos</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>Al acceder y utilizar Ganga-Menú, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.</p>
                                    <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en nuestro sitio web.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">2. Descripción del Servicio</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>Ganga-Menú es una plataforma integral de gestión para restaurantes que incluye:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Creación y gestión de menús digitales interactivos</li>
                                        <li>Sistema de gestión de pedidos para personal de servicio</li>
                                        <li>Panel de control de cocina en tiempo real</li>
                                        <li>Herramientas de análisis y reportes</li>
                                        <li>Gestión de mesas y reservas</li>
                                        <li>Integración con sistemas de pago</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">3. Registro y Cuentas de Usuario</h2>
                                <div className="space-y-4 text-gray-700">
                                    <h3 className="text-lg font-semibold">Elegibilidad</h3>
                                    <p>Para utilizar nuestros servicios, debes:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Ser mayor de 18 años o tener autorización legal</li>
                                        <li>Proporcionar información veraz y actualizada</li>
                                        <li>Ser propietario o estar autorizado para gestionar el restaurante</li>
                                        <li>Cumplir con todas las leyes y regulaciones aplicables</li>
                                    </ul>

                                    <h3 className="text-lg font-semibold">Responsabilidades del Usuario</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Mantener la confidencialidad de las credenciales de acceso</li>
                                        <li>Notificar inmediatamente cualquier uso no autorizado</li>
                                        <li>Ser responsable de todas las actividades en tu cuenta</li>
                                        <li>Mantener actualizada la información de contacto</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">4. Planes y Facturación</h2>
                                <div className="space-y-4 text-gray-700">
                                    <h3 className="text-lg font-semibold">Plan Gratuito</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Acceso limitado a funcionalidades básicas</li>
                                        <li>Sin costo mensual</li>
                                        <li>Limitaciones en número de usuarios y funciones</li>
                                    </ul>

                                    <h3 className="text-lg font-semibold">Planes de Pago</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Facturación mensual o anual</li>
                                        <li>Renovación automática salvo cancelación</li>
                                        <li>Cambios de plan efectivos en el siguiente período de facturación</li>
                                        <li>No se ofrecen reembolsos por períodos parciales</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">5. Uso Aceptable</h2>
                                <div className="space-y-4 text-gray-700">
                                    <h3 className="text-lg font-semibold">Está Permitido:</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Usar la plataforma para gestión legítima de restaurantes</li>
                                        <li>Subir contenido propio (menús, imágenes, descripciones)</li>
                                        <li>Configurar y personalizar tu experiencia</li>
                                        <li>Integrar con sistemas de terceros autorizados</li>
                                    </ul>

                                    <h3 className="text-lg font-semibold">Está Prohibido:</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Usar la plataforma para actividades ilegales</li>
                                        <li>Intentar acceder a datos de otros usuarios</li>
                                        <li>Realizar ingeniería inversa del software</li>
                                        <li>Sobrecargar o interferir con los servicios</li>
                                        <li>Subir contenido ofensivo, falso o que infrinja derechos</li>
                                        <li>Revender o redistribuir nuestros servicios</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">6. Propiedad Intelectual</h2>
                                <div className="space-y-4 text-gray-700">
                                    <h3 className="text-lg font-semibold">Nuestros Derechos</h3>
                                    <p>Ganga-Menú y todo su contenido (software, diseño, logos, textos) son propiedad nuestra o de nuestros licenciantes y están protegidos por derechos de autor, marcas registradas y otras leyes de propiedad intelectual.</p>

                                    <h3 className="text-lg font-semibold">Tu Contenido</h3>
                                    <p>Mantienes todos los derechos sobre el contenido que subas (menús, imágenes, descripciones). Al usar nuestros servicios, nos otorgas una licencia para usar, almacenar y mostrar tu contenido según sea necesario para proporcionar el servicio.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">7. Disponibilidad del Servicio</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>Nos esforzamos por mantener nuestros servicios disponibles las 24 horas del día, pero no podemos garantizar disponibilidad del 100%. Podemos experimentar:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Mantenimiento programado (con aviso previo)</li>
                                        <li>Interrupciones técnicas no planificadas</li>
                                        <li>Actualizaciones de seguridad</li>
                                        <li>Mejoras en la funcionalidad</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">8. Limitación de Responsabilidad</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>En la máxima medida permitida por la ley:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Ganga-Menú se proporciona "tal como está"</li>
                                        <li>No garantizamos que el servicio será ininterrumpido o libre de errores</li>
                                        <li>No somos responsables por pérdidas indirectas o consecuenciales</li>
                                        <li>Nuestra responsabilidad total no excederá las tarifas pagadas en los 12 meses anteriores</li>
                                        <li>Eres responsable de mantener copias de seguridad de tu contenido</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">9. Terminación</h2>
                                <div className="space-y-4 text-gray-700">
                                    <h3 className="text-lg font-semibold">Terminación por tu Parte</h3>
                                    <p>Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu cuenta o contactándonos. La cancelación será efectiva al final del período de facturación actual.</p>

                                    <h3 className="text-lg font-semibold">Terminación por Nuestra Parte</h3>
                                    <p>Podemos suspender o terminar tu cuenta si:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Violas estos términos de servicio</li>
                                        <li>No pagas las tarifas adeudadas</li>
                                        <li>Participas en actividades fraudulentas o ilegales</li>
                                        <li>Tu cuenta permanece inactiva por períodos prolongados</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">10. Privacidad y Protección de Datos</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>El manejo de tu información personal se rige por nuestra Política de Privacidad, que forma parte integral de estos términos. Te recomendamos leerla cuidadosamente.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">11. Ley Aplicable</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>Estos términos se rigen por las leyes de [Jurisdicción] sin tener en cuenta sus principios de conflicto de leyes. Cualquier disputa se resolverá en los tribunales competentes de [Jurisdicción].</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">12. Contacto</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p>Para preguntas sobre estos términos y condiciones, contáctanos:</p>
                                    <ul className="list-none space-y-2">
                                        <li><strong>Email:</strong> legal@ganga-menu.com</li>
                                        <li><strong>Dirección:</strong> [Dirección de la empresa]</li>
                                        <li><strong>Teléfono:</strong> [Número de teléfono]</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-[#0d4b3d] mb-4">13. Disposiciones Generales</h2>
                                <div className="space-y-4 text-gray-700">
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Integridad:</strong> Estos términos constituyen el acuerdo completo entre las partes</li>
                                        <li><strong>Divisibilidad:</strong> Si alguna disposición es inválida, el resto permanece en vigor</li>
                                        <li><strong>Renuncia:</strong> La falta de ejercicio de un derecho no constituye renuncia</li>
                                        <li><strong>Asignación:</strong> No puedes transferir estos términos sin nuestro consentimiento</li>
                                        <li><strong>Supervivencia:</strong> Las disposiciones que por su naturaleza deben sobrevivir continuarán vigentes</li>
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

export default Terms; 