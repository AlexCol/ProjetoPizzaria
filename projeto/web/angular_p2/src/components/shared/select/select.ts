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
import { selectStyles } from './select.styles';

export type SelectValue = string | number | null;

export interface SelectOption {
  label: string;
  value: Exclude<SelectValue, null>;
  disabled?: boolean;
}

let nextSelectId = 0;

@Component({
  selector: 'app-select',
  templateUrl: './select.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'styles.host',
  },
})
export class SelectComponent implements ControlValueAccessor {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly formDisabled = signal(false); // Estado disabled recebido do Angular Forms através do ControlValueAccessor.
  private readonly generatedId = `app-select-${++nextSelectId}`; // Id automático utilizado quando nenhum id é informado.
  private onChange: (value: SelectValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly styles = selectStyles; // Estilos utilizados pelo componente.

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly value = model<SelectValue>(null); // Valor selecionado. Usado no template e sincronizado com Angular Forms via ControlValueAccessor.
  readonly options = input<readonly SelectOption[]>([]); // Opções disponíveis no select. Usado para renderizar os elementos <option>.
  readonly id = input(''); // Permite definir um id manual. Usado por selectId() e pelo for do label.
  readonly name = input(''); // Define o atributo name nativo do select. Usado no template.
  readonly label = input(''); // Texto exibido acima do campo. Usado no template para renderizar o <label>.
  readonly placeholder = input('Selecione...'); // Texto exibido quando nenhum valor está selecionado. Usado na primeira opção do select.
  readonly required = input(false, { transform: booleanAttribute }); // Marca o campo como obrigatório. Usado no select e para exibir o indicador "*" no label.
  readonly disabled = input(false, { transform: booleanAttribute }); // Desabilita o campo externamente. Combinado com o estado recebido pelo Angular Forms.
  readonly ariaLabel = input(''); // Nome acessível do select. Usado no aria-label quando necessário.
  readonly ariaDescribedBy = input(''); // Relaciona o select a textos auxiliares ou mensagens de erro através de aria-describedby.
  readonly ariaInvalid = input(false, { transform: booleanAttribute }); // Informa a tecnologias assistivas que o valor atual está inválido.
  readonly className = input(''); // Permite adicionar classes extras ao <select>. Usado em selectClasses().
  readonly labelClassName = input(''); // Permite adicionar classes extras ao <label>. Usado em labelClasses().
  readonly iconClassName = input(''); // Permite adicionar classes extras ao ícone indicador. Usado em iconClasses().

  readonly blurred = output<FocusEvent>(); // Emitido quando o select perde o foco.
  readonly changed = output<SelectValue>(); // Emitido quando o usuário altera a opção selecionada.

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  readonly selectId = computed(() => this.id() || this.generatedId);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  readonly selectedKey = computed(() => {
    const currentValue = this.value();

    if (currentValue === null) {
      return '';
    }

    const index = this.options().findIndex(
      (option) => Object.is(option.value, currentValue) || String(option.value) === String(currentValue),
    );
    return index >= 0 ? this.getOptionKey(index) : '';
  });

  readonly selectClasses = computed(() => [selectStyles.select, this.className().trim()].filter(Boolean).join(' '));
  readonly labelClasses = computed(() => [selectStyles.label, this.labelClassName().trim()].filter(Boolean).join(' '));
  readonly iconClasses = computed(() => [selectStyles.icon, this.iconClassName().trim()].filter(Boolean).join(' '));

  /*****************************************/
  /* ControlValueAccessor                  */
  /* Métodos utilizados pelo Angular Forms */
  /* para integrar o componente aos forms. */
  /*****************************************/
  // Atualiza o valor do componente quando o FormControl/ngModel é alterado externamente.
  writeValue(value: SelectValue): void {
    this.value.set(value ?? null);
  }

  // Recebe do Angular Forms a função que deve ser chamada quando o usuário altera o valor.
  registerOnChange(onChange: (value: SelectValue) => void): void {
    this.onChange = onChange;
  }

  // Recebe do Angular Forms a função que deve ser chamada quando o campo é marcado como touched.
  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  // Atualiza o estado disabled quando ele é controlado pelo FormControl.
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  // Disparado quando o usuário seleciona uma opção.
  // Converte a chave interna do <option> de volta para o valor original.
  handleChange(event: Event): void {
    const element = event.target as HTMLSelectElement;
    const selectedValue = this.getValueByKey(element.value);

    this.value.set(selectedValue);
    this.onChange(selectedValue);
    this.changed.emit(selectedValue);
  }

  // Disparado quando o select perde o foco. Marca o controle como touched no Angular Forms.
  handleBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }

  getOptionKey(index: number): string {
    return `option-${index}`;
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  // Resolve a chave usada pelo <option> para o valor original, preservando string e number.
  private getValueByKey(key: string): SelectValue {
    if (!key) {
      return null;
    }

    const index = Number(key.replace('option-', ''));
    return this.options()[index]?.value ?? null;
  }
}
