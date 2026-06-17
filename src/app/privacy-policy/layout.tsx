import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | VynTech Solutions - Data Protection & Privacy Practices',
  description: 'Learn how VynTech Solutions protects your personal information. Our Privacy Policy outlines data collection, usage, security measures, and your rights under PIPEDA and Canadian privacy laws.',
  keywords: [
    'privacy policy',
    'data protection',
    'PIPEDA compliance',
    'personal information protection',
    'VynTech Solutions privacy',
    'Canadian privacy law',
    'data security',
    'cookie policy',
    'privacy rights Canada'
  ],
  openGraph: {
    title: 'Privacy Policy | VynTech Solutions',
    description: 'Our commitment to protecting your privacy and personal information under Canadian law.',
    url: 'https://vyntechsolutions.ca/privacy-policy',
    siteName: 'VynTech Solutions',
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | VynTech Solutions',
    description: 'Learn how VynTech Solutions protects your personal information.',
  },
  alternates: {
    canonical: 'https://vyntechsolutions.ca/privacy-policy',
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
