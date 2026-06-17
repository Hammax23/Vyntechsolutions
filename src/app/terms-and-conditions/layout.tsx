import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | VynTech Solutions - Service Agreement & Legal Terms',
  description: 'Read VynTech Solutions Terms and Conditions. Understand our service agreements, payment terms, intellectual property rights, warranties, and legal obligations for web development services in Canada.',
  keywords: [
    'terms and conditions',
    'service agreement',
    'legal terms',
    'VynTech Solutions terms',
    'web development contract',
    'client agreement',
    'intellectual property',
    'payment terms',
    'Canadian business terms'
  ],
  openGraph: {
    title: 'Terms & Conditions | VynTech Solutions',
    description: 'Our Terms and Conditions outline the legal agreement for VynTech Solutions services.',
    url: 'https://vyntechsolutions.ca/terms-and-conditions',
    siteName: 'VynTech Solutions',
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms & Conditions | VynTech Solutions',
    description: 'Service agreement and legal terms for VynTech Solutions.',
  },
  alternates: {
    canonical: 'https://vyntechsolutions.ca/terms-and-conditions',
  },
};

export default function TermsAndConditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
