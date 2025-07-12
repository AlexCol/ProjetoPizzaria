'use client';

import Button from "@/components/DarkmodeButton/Button";
import "./globals.css";
import NavBar from "@/components/NavBar/NavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("RootLayout");
  return (
    <html lang="pt-BR" className={styles.html}>
      <body className={`${styles.container}`}>
        <Button />
        <NavBar />
        {children}
      </body>
    </html>
  );
}

const htmlTailwindClass = "flex flex-col h-full";
const containerTailwindClass = "light flex flex-col h-full transition-colors duration-300"; //cores estão no globals.css
const styles = {
  html: htmlTailwindClass,
  container: containerTailwindClass,
}