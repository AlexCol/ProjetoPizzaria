import type { LucideProps } from 'lucide-react';
import { isValidElement, type ForwardRefExoticComponent, type RefAttributes } from 'react';
import { Link } from 'react-router-dom';

type linkCustomProps = {
  href: string;
  label?: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  disabled?: boolean | undefined;
  className?: string;
};

function LinkCustom(props: linkCustomProps) {
  const IconComp =
    typeof props.icon === 'function'
      ? (props.icon as ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>)
      : null;

  if (props.disabled) {
    return (
      <span className={`${linkTC} ${props.className} opacity-60 cursor-not-allowed`} aria-disabled='true'>
        {props.label}
      </span>
    );
  }

  return (
    <Link to={props.href} className={`${linkTC} ${props.className}`}>
      {IconComp ? <IconComp className='inline-block mr-2 text-2xl' /> : isValidElement(props.icon) ? props.icon : null}
      {props.label}
    </Link>
  );
}
export default LinkCustom;

const linkTC = `
  font-medium
  no-underline hover:no-underline
  text-primary
  hover:text-tertiary
  transition
`;
