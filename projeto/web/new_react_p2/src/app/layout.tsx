import type { Metadata } from 'next';
import { Manrope, Geist_Mono } from 'next/font/google';
import DarkMode from '@/components/contexts/darkMode/DarkMode';
import { cn } from '@/lib/utils';
import App from './app';
import './globals.css';

const geistMonoHeading = Geist_Mono({ subsets: ['latin'], variable: '--font-heading' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Pizzaria Coletti',
  description: 'Sistema de gerenciamento para a Pizzaria Coletti',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang='pt-BR'
      className={cn(htmlTC, 'font-sans', manrope.variable, geistMonoHeading.variable)}
      suppressHydrationWarning
    >
      <head>
        {/*esse script é pra já iniciar o dark mode no lado do cliente e evitar um flash de conteúdo */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  var root = document.documentElement;
                  root.classList.toggle('dark', isDark);
                  root.classList.toggle('light', !isDark);
                } catch (e) {}
              })();`,
          }}
        />
      </head>

      <body className={bodyTC}>
        <DarkMode>
          <App>{children}</App>
        </DarkMode>
      </body>
    </html>
  );
}

const htmlTC = `
  flex 
  flex-col
  h-full
`;

const bodyTC = `
  flex
  flex-col 
  h-full
  bg-background
  text-primary-text
  transition-colors duration-300
`;
