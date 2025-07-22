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
                                    <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
                                    <p>This may include:</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        <li>Account information (name, email, restaurant details)</li>
                                        <li>Menu and order data</li>
                                        <li>Payment information</li>
                                        <li>Communication records</li>
                                        <li>Usage analytics</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">2. {dictionary.web.legal.privacy.sections.usage}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>We use the information we collect to:</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        <li>Provide and maintain our services</li>
                                        <li>Process transactions and send related information</li>
                                        <li>Send technical notices and support messages</li>
                                        <li>Respond to your comments and questions</li>
                                        <li>Improve our services and develop new features</li>
                                        <li>Protect against fraud and abuse</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">3. {dictionary.web.legal.privacy.sections.sharing}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
                                    <p>We may share information with:</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        <li>Service providers who assist in our operations</li>
                                        <li>Legal authorities when required by law</li>
                                        <li>Business partners with your explicit consent</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">4. {dictionary.web.legal.privacy.sections.security}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                                    <p>These measures include:</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        <li>Encryption of data in transit and at rest</li>
                                        <li>Regular security assessments</li>
                                        <li>Access controls and authentication</li>
                                        <li>Secure data centers and infrastructure</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">5. {dictionary.web.legal.privacy.sections.cookies}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>We use cookies and similar tracking technologies to enhance your experience on our platform.</p>
                                    <p>These technologies help us:</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        <li>Remember your preferences and settings</li>
                                        <li>Analyze how our services are used</li>
                                        <li>Provide personalized content</li>
                                        <li>Improve our services</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">6. {dictionary.web.legal.privacy.sections.rights}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>You have the right to:</p>
                                    <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2">
                                        <li>Access your personal information</li>
                                        <li>Correct inaccurate data</li>
                                        <li>Request deletion of your data</li>
                                        <li>Object to processing of your data</li>
                                        <li>Data portability</li>
                                        <li>Withdraw consent at any time</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">7. {dictionary.web.legal.privacy.sections.changes}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>
                                    <p>We encourage you to review this privacy policy periodically for any changes.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#0d4b3d] mb-3 sm:mb-4">8. {dictionary.web.legal.privacy.sections.contact}</h2>
                                <div className="space-y-3 sm:space-y-4 text-gray-700 text-sm sm:text-base">
                                    <p>If you have any questions about this privacy policy, please contact us:</p>
                                    <ul className="list-none space-y-1 sm:space-y-2">
                                        <li><strong>Email:</strong> privacy@ganga-menu.com</li>
                                        <li><strong>Address:</strong> [Company Address]</li>
                                        <li><strong>Phone:</strong> [Phone Number]</li>
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