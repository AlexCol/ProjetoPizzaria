import Link from "next/link";
import { isValidElement } from "react";
import { IconType } from "react-icons";

type linkCustomProps = {
  href: string,
  label?: string,
  icon?: IconType | React.ReactElement;
  disabled?: boolean | undefined
}

function LinkCustom(props: linkCustomProps) {
  const IconComp = typeof props.icon === "function" ? (props.icon as IconType) : null;

  if (props.disabled) {
    return (
      <span className={`${linkTailwindClass} opacity-60 cursor-not-allowed`} aria-disabled="true">
        {props.label}
      </span>
    );
  }

  return (
    <Link href={props.href} className={linkTailwindClass}>
      {IconComp ? <IconComp className="inline-block mr-2 text-2xl" /> : isValidElement(props.icon) ? props.icon : null}
      {props.label}
    </Link>
  )
}
export default LinkCustom;

const linkTailwindClass = `
  mt-2
  text-sm
  dark:hover:text-dark-green-900-pizzaria
  hover:text-light-green-300-pizzaria
  transition
`;