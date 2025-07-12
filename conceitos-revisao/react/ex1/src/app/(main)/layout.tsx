
import NavBar from "@/components/NavBar/NavBar";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}

const containerTailwindClass = "flex flex-col h-full";
const styles = {
  container: containerTailwindClass,
}