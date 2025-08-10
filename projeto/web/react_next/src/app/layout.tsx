import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import App from "./App";

export const metadata: Metadata = {
  title: "Pizzaria",
  description: "Pizzaria Coletti",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={htmlTailwindClass}>
      <body className={bodyTailwindClass}>
        <App>
          {children}
        </App>
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
  dark
  flex
  flex-col 
  h-full
  bg-white
  text-gray-900
`;