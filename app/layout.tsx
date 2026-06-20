import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SerenIQ — Your Exam Wellness Companion',
  description:
    'An AI-powered wellness companion helping students monitor and navigate stress during board exams and competitive tests.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg-base text-text-primary min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
