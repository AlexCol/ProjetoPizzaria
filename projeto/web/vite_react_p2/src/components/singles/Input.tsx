import type { LucideProps } from 'lucide-react';
import type {
  ChangeEventHandler,
  ForwardRefExoticComponent,
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
  Ref,
  RefAttributes,
} from 'react';

type inputProps = {
  type?: HTMLInputTypeAttribute | undefined;
  placeholder?: string;
  ref?: Ref<HTMLInputElement> | undefined;
  autoComplete?: HTMLInputAutoCompleteAttribute | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  maxLength?: number | undefined;
  name?: string | undefined;
  accept?: string | undefined;
  value?: string | number | readonly string[] | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  className?: string;
  step?: string;
  label?: string;
  labelClassName?: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  iconClassName?: string;
};

function Input(props: inputProps) {
  return (
    <div className='w-full'>
      {props.label && (
        <label className={`${labelTC} ${props.labelClassName}`}>
          {props.label}
          {props.required && <span className='text-danger ml-1'>*</span>}
        </label>
      )}

      <div className='relative'>
        {props.icon && <props.icon className={`${iconTC} ${props.iconClassName}`} />}
        <input
          className={`${inputTC} ${props.className}`}
          type={props.type}
          placeholder={props.placeholder}
          ref={props.ref}
          autoComplete={props.autoComplete}
          disabled={props.disabled}
          required={props.required}
          maxLength={props.maxLength}
          name={props.name}
          accept={props.accept}
          value={props.value}
          onChange={props.onChange}
          step={props.step}
        />
      </div>
      {/* {props.maxLength && (
        <p className='text-xs text-foreground opacity-60 mt-1.5'>Máximo {props.maxLength} caracteres</p>
      )} */}
    </div>
  );
}

export default Input;

const labelTC = `
  block 
  text-sm 
  font-medium 
  mb-2
`;
//absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5
const iconTC = `
  absolute 
  left-3 
  top-1/2 
  transform 
  -translate-y-1/2 
  w-5 
  h-5 
`;

//w-full pl-11 pr-4 py-3 rounded-lg border input-focus outline-none
const inputTC = `
  w-full
  px-4
  py-2
  rounded-md
  ring-2 ring-border
  focus:outline-none focus:ring-foreground
  transition-colors duration-75
`;
