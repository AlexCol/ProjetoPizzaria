import type { LucideProps } from 'lucide-react';
import { useState, type ForwardRefExoticComponent, type RefAttributes } from 'react';

type buttonTypes = 'Success' | 'Danger' | 'Warning' | 'Info' | 'Link' | 'Default' | undefined;

type ButtonProps = {
  className?: string;
  label?: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  iconClassName?: string;
  disabled?: boolean | undefined;
  type?: 'submit' | 'reset' | 'button' | undefined;
  title?: string;
  onClick?: () => void;
  buttonType?: buttonTypes;
  allowSpam?: boolean;
  spamDelay?: number;
};

function Button(props: ButtonProps) {
  const [isThrottled, setIsThrottled] = useState(false);
  const shouldPreventSpam = props.allowSpam !== true && props.type !== 'submit'; //para submit, quem deve bloquear o span é o form (dá problema se combinar bloq de botao e form)
  const delay = props.spamDelay ?? 2000; // Default 2 segundos
  const isDisabled = props.disabled || (shouldPreventSpam && isThrottled);
  const compClassName = filtraButtonClassName(props.buttonType, isDisabled);

  const handleClick = () => {
    if (shouldPreventSpam && isThrottled) {
      // Ignorar clique se estiver em throttle
      return;
    }

    if (shouldPreventSpam) {
      // Iniciar throttle
      setIsThrottled(true);
      setTimeout(() => {
        setIsThrottled(false);
      }, delay);
    }

    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <button
      className={`${compClassName} ${props.className}`}
      onClick={handleClick}
      type={props.type}
      disabled={isDisabled}
      title={props.title}
    >
      {props.label || (props.icon && <props.icon className={props.iconClassName} />)}
    </button>
  );
}

export default Button;

const buttonTC = `
  w-full
  py-2
  rounded-md
  font-bold
  active:scale-99
  focus:outline-none focus:ring-2 focus:ring-foreground
  cursor-pointer
  disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
  transition duration-300  
  hover:bg-background-2
  text-white
`;

const buttonSuccessTC = `
  ${buttonTC}  
  bg-success
  hover:text-success
`;

const buttonDangerTC = `
  ${buttonTC}  
  bg-danger
  hover:text-danger
`;

const buttonWarningTC = `
  ${buttonTC}  
  bg-warning
  hover:text-warning
`;

const buttonInfoTC = `
  ${buttonTC}  
  bg-info
  hover:text-info
`;

const buttonLinkTC = `
  font-medium 
  text-primary
  hover:text-tertiary
  transition
`;

const buttonDisabledTC = `
  ${buttonTC}  
  bg-disabled
  hover:bg-disabled
`;

const defaultButtonTC = `
  ${buttonTC}  
  bg-linear-to-tr from-primary to-secondary
  hover:from-secondary hover:to-primary
`;

function filtraButtonClassName(buttonType: buttonTypes, disabled?: boolean) {
  if (disabled) {
    return buttonDisabledTC;
  }
  switch (buttonType) {
    case 'Success':
      return buttonSuccessTC;
    case 'Danger':
      return buttonDangerTC;
    case 'Warning':
      return buttonWarningTC;
    case 'Info':
      return buttonInfoTC;
    case 'Link':
      return buttonLinkTC;
    default:
      return defaultButtonTC;
  }
}
