import Image from "next/image";

function LogoImage() {
  return (
    <Image
      src="/images/logo3.png"
      alt="Pizzaria Coletti"
      title="Pizzaria Coletti"
      width={150}
      height={150}
      className={logoTailwindClass}
      priority
    />
  )
}

export default LogoImage;

const logoTailwindClass = `
  w-auto
  h-auto
`;