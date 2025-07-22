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
        title: `${dictionary.web.legal.terms.title} - Ganga-Menú`,
        description: `${dictionary.web.legal.terms.title} of the Ganga-Menú platform. Learn about our service policies.`
    });
};

const Terms = async ({ params }: TermsProps) => {
    const { locale } = await params;
    const dictionary = await getDictionary(locale);

    return (
        <div className="w-full py-12 sm:py-16 lg:py-20 xl:py-32 bg-gray-50">
            <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 lg:p-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0d4b3d] mb-6 sm:mb-8 text-center">
                        {dictionary.web.legal.terms.title}
                    </h1>

                    <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                        <p className="text-gray-600 mb-6 sm:mb-8 text-center text-sm sm:text-base">
                            <strong>{dictionary.web.legal.terms.lastUpdate}</strong> {dictionary.web.legal.terms.date}
                        </p>

                        <div className="space-y-6 sm:space-y-8">
                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">1. {dictionary.web.legal.terms.sections.acceptance}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.terms.content.acceptance}</p>
                                    <p>{dictionary.web.legal.terms.content.modificationRights}</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">2. {dictionary.web.legal.terms.sections.serviceDescription}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.terms.content.serviceDescription}</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.terms.content.serviceFeatures.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">3. {dictionary.web.legal.terms.sections.registration}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <h3 className="text-lg font-semibold">{dictionary.web.legal.terms.content.registration.eligibility}</h3>
                                    <p>{dictionary.web.legal.terms.content.registration.eligibilityDescription}</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.terms.content.registration.eligibilityRequirements.map((requirement, index) => (
                                            <li key={index}>{requirement}</li>
                                        ))}
                                    </ul>

                                    <h3 className="text-lg font-semibold">{dictionary.web.legal.terms.content.registration.userResponsibilities}</h3>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.terms.content.registration.userResponsibilitiesList.map((responsibility, index) => (
                                            <li key={index}>{responsibility}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">4. {dictionary.web.legal.terms.sections.billing}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <h3 className="text-lg font-semibold">{dictionary.web.legal.terms.content.billing.freePlan}</h3>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.terms.content.billing.freePlanFeatures.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))}
                                    </ul>

                                    <h3 className="text-lg font-semibold">{dictionary.web.legal.terms.content.billing.paidPlans}</h3>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.terms.content.billing.paidPlansFeatures.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">5. {dictionary.web.legal.terms.sections.acceptableUse}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <h3 className="text-lg font-semibold">{dictionary.web.legal.terms.content.acceptableUse.allowed}</h3>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.terms.content.acceptableUse.allowedItems.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>

                                    <h3 className="text-lg font-semibold">{dictionary.web.legal.terms.content.acceptableUse.prohibited}</h3>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.terms.content.acceptableUse.prohibitedItems.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">6. {dictionary.web.legal.terms.sections.intellectualProperty}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <h3 className="text-lg font-semibold">{dictionary.web.legal.terms.content.intellectualProperty.ourRights}</h3>
                                    <p>{dictionary.web.legal.terms.content.intellectualProperty.ourRightsDescription}</p>

                                    <h3 className="text-lg font-semibold">{dictionary.web.legal.terms.content.intellectualProperty.yourContent}</h3>
                                    <p>{dictionary.web.legal.terms.content.intellectualProperty.yourContentDescription}</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">7. {dictionary.web.legal.terms.sections.availability}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.terms.content.availability.description}</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.terms.content.availability.interruptions.map((interruption, index) => (
                                            <li key={index}>{interruption}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">8. {dictionary.web.legal.terms.sections.liability}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.terms.content.liability.description}</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.terms.content.liability.limitations.map((limitation, index) => (
                                            <li key={index}>{limitation}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">9. {dictionary.web.legal.terms.sections.termination}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <h3 className="text-lg font-semibold">{dictionary.web.legal.terms.content.termination.byUser}</h3>
                                    <p>{dictionary.web.legal.terms.content.termination.byUserDescription}</p>

                                    <h3 className="text-lg font-semibold">{dictionary.web.legal.terms.content.termination.byUs}</h3>
                                    <p>{dictionary.web.legal.terms.content.termination.byUsDescription}</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        {dictionary.web.legal.terms.content.termination.terminationReasons.map((reason, index) => (
                                            <li key={index}>{reason}</li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">10. {dictionary.web.legal.terms.sections.privacy}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.terms.content.privacy.description}</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">11. {dictionary.web.legal.terms.sections.governingLaw}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.terms.content.governingLaw.description}</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">12. {dictionary.web.legal.terms.sections.contact}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>{dictionary.web.legal.terms.content.contact.description}</p>
                                    <ul className="list-none space-y-1 sm:space-y-2">
                                        <li><strong>{dictionary.web.legal.terms.content.contact.email}</strong> {dictionary.web.legal.terms.content.contact.emailValue}</li>
                                        {/* <li><strong>{dictionary.web.legal.terms.content.contact.address}</strong> {dictionary.web.legal.terms.content.contact.addressValue}</li> */}
                                        {/* <li><strong>{dictionary.web.legal.terms.content.contact.phone}</strong> {dictionary.web.legal.terms.content.contact.phoneValue}</li> */}
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">13. {dictionary.web.legal.terms.sections.general}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        <li><strong>{dictionary.web.legal.terms.content.general.integrity}</strong></li>
                                        <li><strong>{dictionary.web.legal.terms.content.general.severability}</strong></li>
                                        <li><strong>{dictionary.web.legal.terms.content.general.waiver}</strong></li>
                                        <li><strong>{dictionary.web.legal.terms.content.general.assignment}</strong></li>
                                        <li><strong>{dictionary.web.legal.terms.content.general.survival}</strong></li>
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