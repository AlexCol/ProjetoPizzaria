
import "./globals.css";
import NavBar from "@/components/NavBar/NavBar";

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