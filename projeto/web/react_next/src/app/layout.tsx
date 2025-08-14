import type { Metadata } from "next";
import "./globals.css";
import App from "./App";
import DarkMode from "@/components/contexts/darkMode/DarkMode";

export const metadata: Metadata = {
  title: "Pizzaria",
  description: "Pizzaria Coletti",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={htmlTailwindClass} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
        (function() {
          try {
            var stored = localStorage.getItem('darkMode');
            var isDark = stored ? JSON.parse(stored) 
              : window.matchMedia('(prefers-color-scheme: dark)').matches;
            var root = document.documentElement;
            if (isDark) {
              root.classList.add('dark');
              root.classList.remove('light');
            } else {
              root.classList.add('light');
              root.classList.remove('dark');
            }
          } catch (e) {}
        })();`
          }}
        />
      </head>

      <body className={bodyTailwindClass}>
        <DarkMode>
          <App>
            {children}
          </App>
        </DarkMode>
      </body>
    </html>
  );
}

const htmlTailwindClass = `
  flex 
  flex-col
  h-full
`;

const bodyTailwindClass = `
  flex
  flex-col 
  h-full
  bg-dark-100-pizzaria dark:bg-dark-700-pizzaria 
  text-dark-900-pizzaria dark:text-dark-300-pizzaria
  transition-colors duration-300
`;