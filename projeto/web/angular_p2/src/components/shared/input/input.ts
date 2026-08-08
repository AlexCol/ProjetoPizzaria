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
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly formDisabled = signal(false); // Estado de disabled recebido pelo Angular Forms através do ControlValueAccessor.
  private readonly generatedId = `app-input-${++nextInputId}`; // Id automático usado quando nenhum id é informado externamente.
  private onChange: (value: InputValue) => void = () => undefined; // Callback registrado pelo Angular Forms para receber alterações de valor.
  private onTouched: () => void = () => undefined; // Callback registrado pelo Angular Forms para marcar o controle como touched.

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  protected readonly styles = inputStyles; // Estilos utilizados pelo componente.

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly value = model<InputValue>(''); // Valor atual do input. Usado no template e sincronizado com Angular Forms via ControlValueAccessor.
  readonly type = input<InputType>('text'); // Define o type nativo do <input>. Usado no template e na conversão de valores numéricos.
  readonly id = input(''); // Permite definir um id manual. Usado por inputId() e pelo for do label.
  readonly name = input(''); // Define o atributo name nativo do input. Usado no template.
  readonly label = input(''); // Texto exibido acima do campo. Usado no template para renderizar o <label>.
  readonly placeholder = input(''); // Define o placeholder nativo do input. Usado no template.
  readonly autoComplete = input(''); // Define o autocomplete nativo do navegador. Usado no template.
  readonly accept = input(''); // Define os tipos de arquivo aceitos quando type="file". Usado no template.
  readonly step = input(''); // Define o incremento permitido para inputs numéricos ou de data/hora. Usado no atributo step.
  readonly min = input<string | number | null>(null); // Define o valor mínimo permitido. Usado no atributo min.
  readonly max = input<string | number | null>(null); // Define o valor máximo permitido. Usado no atributo max.
  readonly minLength = input<number | null>(null); // Define o tamanho mínimo do texto. Usado no atributo minlength.
  readonly maxLength = input<number | null>(null); // Define o tamanho máximo do texto. Usado no atributo maxlength.
  readonly required = input(false, { transform: booleanAttribute }); // Marca o campo como obrigatório. Usado no input e para exibir o indicador "*" no label.
  readonly disabled = input(false, { transform: booleanAttribute }); // Desabilita o campo externamente. Combinado com o estado recebido pelo Angular Forms.
  readonly readOnly = input(false, { transform: booleanAttribute }); // Impede edição sem desabilitar o campo. Usado no atributo readonly.
  readonly ariaLabel = input(''); // Define um nome acessível para o campo. Usado no aria-label do template.
  readonly ariaDescribedBy = input(''); // Relaciona o input a textos auxiliares ou mensagens de erro. Usado no aria-describedby.
  readonly ariaInvalid = input(false, { transform: booleanAttribute }); // Informa a tecnologias assistivas que o valor está inválido. Usado no aria-invalid.
  readonly className = input(''); // Permite adicionar classes extras ao <input>. Usado em inputClasses().
  readonly labelClassName = input(''); // Permite adicionar classes extras ao <label>. Usado em labelClasses().
  readonly iconClassName = input(''); // Permite adicionar classes extras ao wrapper do ícone projetado. Usado em iconClasses().

  readonly blurred = output<FocusEvent>(); // Emitido quando o input perde o foco.

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  protected readonly inputId = computed(() => this.id() || this.generatedId); // Usa o id informado ou gera um automaticamente para relacionar label e input.
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled()); // Combina o disabled externo com o estado definido pelo Angular Forms.

  protected readonly inputClasses = computed(() =>
    [inputStyles.input, this.className().trim()].filter(Boolean).join(' '),
  );

  protected readonly labelClasses = computed(() =>
    [inputStyles.label, this.labelClassName().trim()].filter(Boolean).join(' '),
  );

  protected readonly iconClasses = computed(() =>
    [inputStyles.icon, this.iconClassName().trim()].filter(Boolean).join(' '),
  );

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  // Chamado pelo Angular Forms quando o valor do controle precisa ser atualizado externamente.
  writeValue(value: InputValue): void {
    this.value.set(value ?? '');
  }

  // Registra o callback que deve ser chamado quando o valor do input for alterado pelo usuário.
  registerOnChange(onChange: (value: InputValue) => void): void {
    this.onChange = onChange;
  }

  // Registra o callback que deve ser chamado quando o input for marcado como touched.
  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  // Chamado pelo Angular Forms para alterar o estado disabled do componente.
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  // Disparado ao alterar o valor do <input>. Atualiza o model e informa a mudança ao Angular Forms.
  handleInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    const value: InputValue = this.type() === 'number' && element.value !== '' ? element.valueAsNumber : element.value;

    this.value.set(value);
    this.onChange(value);
  }

  // Disparado quando o input perde o foco. Marca o controle como touched e emite o evento externamente.
  handleBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }
}
