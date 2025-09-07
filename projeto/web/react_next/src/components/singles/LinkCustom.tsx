import Link from "next/link";

type linkCustomProps = {
  href: string,
  label: string,
  disabled?: boolean | undefined
}

function LinkCustom(props: linkCustomProps) {
  if (props.disabled) {
    return (
      <span className={`${linkTailwindClass} opacity-60 cursor-not-allowed`} aria-disabled="true">
        {props.label}
      </span>
    );
  }

  return (
    <Link href={props.href} className={linkTailwindClass}>
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