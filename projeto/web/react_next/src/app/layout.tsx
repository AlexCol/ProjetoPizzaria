import type { Metadata } from "next";
import "./globals.css";
import App from "./App";
import DarkMode from "@/components/contexts/darkMode/DarkMode";

export const metadata: Metadata = {
  title: "Pizzaria",
  description: "Pizzaria Coletti",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR"
      className={htmlTailwindClass}
      suppressHydrationWarning
    >
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
  bg-white dark:bg-gray-900 
  text-gray-900 dark:text-white
  transition-colors duration-300
`;