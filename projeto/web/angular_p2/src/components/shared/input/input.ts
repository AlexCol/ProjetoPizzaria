import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { inputStyles } from './input.styles';

export type InputValue = string | number | null;
export type InputType =
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'month'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';

let nextInputId = 0;

@Component({
  selector: 'app-input',
  templateUrl: './input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'styles.host',
  },
})
export class InputComponent implements ControlValueAccessor {
  readonly value = model<InputValue>('');
  readonly type = input<InputType>('text');
  readonly id = input('');
  readonly name = input('');
  readonly label = input('');
  readonly placeholder = input('');
  readonly autoComplete = input('');
  readonly accept = input('');
  readonly step = input('');
  readonly min = input<string | number | null>(null);
  readonly max = input<string | number | null>(null);
  readonly minLength = input<string | number | null>(null);
  readonly maxLength = input<string | number | null>(null);
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly ariaDescribedBy = input('');
  readonly ariaInvalid = input(false, { transform: booleanAttribute });
  readonly className = input('');
  readonly labelClassName = input('');
  readonly iconClassName = input('');

  readonly blurred = output<FocusEvent>();

  private readonly formDisabled = signal(false);
  private readonly generatedId = `app-input-${++nextInputId}`;
  private onChange: (value: InputValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected get styles() {
    return inputStyles;
  }

  protected readonly inputId = computed(() => this.id() || this.generatedId);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly inputClasses = computed(() => {
    const additionalClasses = this.className().trim();
    return additionalClasses ? `${inputStyles.input} ${additionalClasses}` : inputStyles.input;
  });
  protected readonly labelClasses = computed(() => {
    const additionalClasses = this.labelClassName().trim();
    return additionalClasses ? `${inputStyles.label} ${additionalClasses}` : inputStyles.label;
  });
  protected readonly iconClasses = computed(() => {
    const additionalClasses = this.iconClassName().trim();
    return additionalClasses ? `${inputStyles.icon} ${additionalClasses}` : inputStyles.icon;
  });

  writeValue(value: InputValue): void {
    this.value.set(value ?? '');
  }

  registerOnChange(onChange: (value: InputValue) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  protected handleInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    const value: InputValue = this.type() === 'number' && element.value !== '' ? element.valueAsNumber : element.value;

    this.value.set(value);
    this.onChange(value);
  }

  protected handleBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }
}
