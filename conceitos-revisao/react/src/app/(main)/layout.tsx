import type { Metadata } from "next";
import "./../globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="flex flex-col h-full">
      <body className={`${styles.container} antialiased`}>
        {children}
      </body>
    </html>
  );
}

const containerTailwindClass = "flex flex-col h-full";
const styles = {
  container: containerTailwindClass,
}