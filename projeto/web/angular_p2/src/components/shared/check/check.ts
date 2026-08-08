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
import { checkStyles } from './check.styles';

let nextCheckId = 0;

@Component({
  selector: 'app-check',
  templateUrl: './check.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'styles.host',
  },
})
export class CheckComponent implements ControlValueAccessor {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly formDisabled = signal(false); // Estado disabled recebido pelo Angular Forms através do ControlValueAccessor.
  private readonly generatedId = `app-check-${++nextCheckId}`; // Id automático usado quando nenhum id é informado externamente.
  private onChange: (value: boolean) => void = () => undefined; // Callback registrado pelo Angular Forms para receber alterações de valor.
  private onTouched: () => void = () => undefined; // Callback registrado pelo Angular Forms para marcar o controle como touched.

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly styles = checkStyles; // Estilos utilizados pelo componente.

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly checked = model(false); // Estado marcado/desmarcado. Usado no template e sincronizado com Angular Forms via ControlValueAccessor.
  readonly id = input(''); // Permite definir um id manual. Usado por checkId() e pelo for do label.
  readonly name = input(''); // Define o atributo name nativo do checkbox. Usado no template.
  readonly label = input(''); // Texto exibido ao lado do checkbox. Usado no template para renderizar o <label>.
  readonly value = input(''); // Define o atributo value nativo do checkbox. Usado no template quando necessário em forms HTML.
  readonly required = input(false, { transform: booleanAttribute }); // Marca o checkbox como obrigatório. Usado no atributo required.
  readonly disabled = input(false, { transform: booleanAttribute }); // Desabilita o checkbox externamente. Combinado com o estado recebido pelo Angular Forms.
  readonly ariaLabel = input(''); // Define um nome acessível quando o label visível não for suficiente. Usado no aria-label.
  readonly ariaDescribedBy = input(''); // Relaciona o checkbox a textos auxiliares ou mensagens de erro através de aria-describedby.
  readonly ariaInvalid = input(false, { transform: booleanAttribute }); // Informa a tecnologias assistivas que o valor atual está inválido.
  readonly className = input(''); // Permite adicionar classes extras ao <input>. Usado em checkClasses().
  readonly labelClassName = input(''); // Permite adicionar classes extras ao <label>. Usado em labelClasses().

  readonly changed = output<boolean>(); // Emitido quando o usuário marca ou desmarca o checkbox.
  readonly blurred = output<FocusEvent>(); // Emitido quando o checkbox perde o foco.

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  readonly checkId = computed(() => this.id() || this.generatedId); // Usa o id informado ou gera um automaticamente para relacionar label e checkbox.
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled()); // Combina o disabled externo com o estado definido pelo Angular Forms.
  readonly checkClasses = computed(() => [checkStyles.check, this.className().trim()].filter(Boolean).join(' '));
  readonly labelClasses = computed(() => [checkStyles.label, this.labelClassName().trim()].filter(Boolean).join(' '));

  /*****************************************/
  /* ControlValueAccessor                  */
  /* Métodos utilizados pelo Angular Forms */
  /* para integrar o componente aos forms. */
  /*****************************************/
  // Atualiza o estado do componente quando o FormControl/ngModel é alterado externamente.
  writeValue(value: boolean | null): void {
    this.checked.set(Boolean(value));
  }

  // Recebe do Angular Forms a função que deve ser chamada quando o usuário altera o valor.
  registerOnChange(onChange: (value: boolean) => void): void {
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
  // Disparado quando o usuário marca ou desmarca o checkbox.
  // Atualiza o model e informa a alteração ao Angular Forms e aos consumidores do componente.
  handleChange(event: Event): void {
    const element = event.target as HTMLInputElement;
    const checked = element.checked;

    this.checked.set(checked);
    this.onChange(checked);
    this.changed.emit(checked);
  }

  // Disparado quando o checkbox perde o foco. Marca o controle como touched e emite o evento externamente.
  handleBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }
}
