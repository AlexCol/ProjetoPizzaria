import { ChevronDown } from 'lucide-react';
import type { RefObject } from 'react';

type SelectProps = {
  label: string;
  valueRef: RefObject<HTMLSelectElement>;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  options: { label: string; value: string }[];
  classeNames?: {
    containerClassName?: string;
    labelClassName?: string;
    requiredClassName?: string;
    selectDivClassName?: string;
    selectClassName?: string;
    iconClassName?: string;
  };
};

function Select(props: SelectProps) {
  const { valueRef, disabled } = props;
  const classNames = props.classeNames || {};
  return (
    <div className={classNames.containerClassName || ''}>
      <label className={classNames.labelClassName || baseLabelTC}>
        {props.label}
        {props.required && <span className={classNames.requiredClassName || baseRequiredTC}>*</span>}
      </label>
      <div className={classNames.selectDivClassName || baseSelectDivTC}>
        <select
          ref={valueRef}
          defaultValue={props.defaultValue}
          required={props.required}
          disabled={disabled}
          className={classNames.selectClassName || baseSelectTC}
        >
          <option value=''>Selecione...</option>
          {props.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {!disabled && <ChevronDown className={classNames.iconClassName || baseTextTC} />}
      </div>
    </div>
  );
}

export default Select;

const baseLabelTC = 'block text-sm font-semibold text-primary-text mb-2';
const baseRequiredTC = 'text-danger ml-1';
const baseSelectDivTC = 'relative';
const baseSelectTC = `
    w-full
    px-4
    py-2
    bg-background
    rounded-md
    text-primary-text
    appearance-none
    transition-all
    duration-200
    focus:outline-none focus:ring-2 focus:ring-foreground
    disabled:bg-background-2 disabled:opacity-60 disabled:cursor-not-allowed
    cursor-pointer
`;
const baseTextTC = `absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground opacity-40 pointer-events-none`;
