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
        title: `${dictionary.web.legal.privacy.title} - Ganga-Menú`,
        description: `${dictionary.web.legal.privacy.title} of the Ganga-Menú platform. Learn about how we protect your data.`
    });
};

const Privacy = async ({ params }: PrivacyProps) => {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    return (
        <div className="w-full py-12 sm:py-16 lg:py-20 xl:py-32 bg-gray-50">
            <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 lg:p-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0d4b3d] mb-6 sm:mb-8 text-center">
                        {dictionary.web.legal.privacy.title}
                    </h1>

                    <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                        <p className="text-gray-600 mb-6 sm:mb-8 text-center text-sm sm:text-base">
                            <strong>{dictionary.web.legal.privacy.lastUpdate}</strong> {dictionary.web.legal.privacy.date}
                        </p>

                        <div className="space-y-6 sm:space-y-8">
                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">1. {dictionary.web.legal.privacy.sections.information}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.privacy.content.information.description}</p>
                                    <p>{dictionary.web.legal.privacy.content.information.includes}</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.privacy.content.information.items.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">2. {dictionary.web.legal.privacy.sections.usage}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.privacy.content.usage.description}</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.privacy.content.usage.purposes.map((purpose, index) => (
                                            <li key={index}>{purpose}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">3. {dictionary.web.legal.privacy.sections.sharing}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.privacy.content.sharing.description}</p>
                                    <p>{dictionary.web.legal.privacy.content.sharing.mayShare}</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.privacy.content.sharing.parties.map((party, index) => (
                                            <li key={index}>{party}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">4. {dictionary.web.legal.privacy.sections.security}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.privacy.content.security.description}</p>
                                    <p>{dictionary.web.legal.privacy.content.security.measures}</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.privacy.content.security.securityItems.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">5. {dictionary.web.legal.privacy.sections.cookies}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.privacy.content.cookies.description}</p>
                                    <p>{dictionary.web.legal.privacy.content.cookies.help}</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.privacy.content.cookies.benefits.map((benefit, index) => (
                                            <li key={index}>{benefit}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">6. {dictionary.web.legal.privacy.sections.rights}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.privacy.content.rights.description}</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.privacy.content.rights.rightsList.map((right, index) => (
                                            <li key={index}>{right}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">7. {dictionary.web.legal.privacy.sections.changes}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.privacy.content.changes.description}</p>
                                    <p>{dictionary.web.legal.privacy.content.changes.review}</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">8. {dictionary.web.legal.privacy.sections.contact}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.privacy.content.contact.description}</p>
                                    <ul className="list-none space-y-1 sm:space-y-2">
                                        <li><strong>{dictionary.web.legal.privacy.content.contact.email}</strong> {dictionary.web.legal.privacy.content.contact.emailValue}</li>
                                        {/* <li><strong>{dictionary.web.legal.privacy.content.contact.address}</strong> {dictionary.web.legal.privacy.content.contact.addressValue}</li> */}
                                        {/* <li><strong>{dictionary.web.legal.privacy.content.contact.phone}</strong> {dictionary.web.legal.privacy.content.contact.phoneValue}</li> */}
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