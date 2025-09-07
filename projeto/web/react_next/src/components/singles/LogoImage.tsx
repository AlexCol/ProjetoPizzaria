import Image from "next/image";

type LogoImageProps = {
  width?: number,
  height?: number,
}

function LogoImage(props: LogoImageProps) {
  const imageDefaultSize = 190;
  return (
    <Image
      src="/images/logo3.png"
      alt="Pizzaria Coletti"
      title="Pizzaria Coletti"
      width={props.width ?? imageDefaultSize}
      height={props.height ?? imageDefaultSize}
      style={{ height: "auto" }}
      className={logoTailwindClass}
      priority
      quality={100}
    />
  )
}

export default LogoImage;

const logoTailwindClass = `h-auto w-auto max-w-full object-contain`;