# Shared UI Components — Implementation Guide

This document defines the conventions to follow when creating new reusable Angular UI components in this project.

Use it as a reference for future implementations.

---

## 1. Main principles

When creating a new shared UI component:

- Prefer native HTML elements whenever possible.
- Wrap native behavior instead of reimplementing it unnecessarily.
- Use Angular Signals APIs:
  - `input()`
  - `output()`
  - `model()`
  - `computed()`
  - `signal()`
- Use `ChangeDetectionStrategy.OnPush`.
- Keep template, styles and TypeScript separated:
  - `component.ts`
  - `component.html`
  - `component.styles.ts`
- Keep reusable control behavior inside the shared component.
- Keep page-specific layout and composition outside the shared component.
- Add accessibility support when the native element requires additional context.
- Use `ControlValueAccessor` for custom form controls that must work with Angular Forms.

---

## 2. Suggested file structure

Example:

```text
components/
└─ shared/
   └─ input/
      ├─ input.ts
      ├─ input.html
      └─ input.styles.ts
```

Use the same pattern for buttons, links, selects, checkboxes, modals and other reusable UI controls.

---

## 3. Component structure

Prefer the following member organization:

```ts
export class ExampleComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/

  /*****************************************/
  /* ControlValueAccessor                  */
  /* Métodos utilizados pelo Angular Forms */
  /* para integrar o componente aos forms. */
  /*****************************************/

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
}
```

Omit sections that are not needed.

---

## 4. Comment style

Comments should explain:

- when an event or method is triggered;
- why a non-obvious implementation exists;
- what framework/browser behavior is being handled.

Avoid comments that only repeat the code.

Good:

```ts
// Disparado quando o input perde o foco. Marca o controle como touched no Angular Forms.
handleBlur(event: FocusEvent): void {
  this.onTouched();
  this.blurred.emit(event);
}
```

Avoid:

```ts
// Método de blur.
handleBlur(...) {}
```

For properties, short inline comments are preferred when useful:

```ts
readonly disabled = input(false, { transform: booleanAttribute }); // Desabilita o componente externamente.
```

---

## 5. Visibility rules

Use visibility to communicate intent.

```text
public
→ intentional external API or framework contract

protected
→ component/template implementation

private
→ TypeScript-only internal implementation
```

Notes:

- Members without an explicit modifier are `public`.
- Template-bound methods may remain public if that keeps the component simpler.
- `ControlValueAccessor` methods must remain public because they implement a framework contract.
- Private helpers that are not used by the template should be marked `private`.

---

## 6. Inputs

Prefer Signals-based inputs.

```ts
readonly label = input('');
readonly disabled = input(false, { transform: booleanAttribute });
readonly maxLength = input<number | null>(null);
```

Use transforms when the HTML attribute form should be supported:

```ts
booleanAttribute
numberAttribute
```

Example:

```ts
readonly disabled = input(false, { transform: booleanAttribute });
readonly spamDelay = input(2000, { transform: numberAttribute });
```

Keep input types as restrictive as practical.

Prefer:

```ts
readonly maxLength = input<number | null>(null);
```

over:

```ts
readonly maxLength = input<string | number | null>(null);
```

when the native API is conceptually numeric.

---

## 7. Outputs

Always type outputs explicitly.

```ts
readonly clicked = output<MouseEvent>();
readonly changed = output<SelectValue>();
readonly blurred = output<FocusEvent>();
readonly closed = output<void>();
```

Emit outputs for events that consumers may reasonably need to react to.

Do not emit events only because the native element has them.

---

## 8. Models

Use `model()` when the component should support two-way binding.

Examples:

```ts
readonly value = model<InputValue>('');
readonly checked = model(false);
readonly isOpen = model(false);
```

This enables usage such as:

```html
<app-check [(checked)]="active" />
```

or:

```html
<app-modal [(isOpen)]="showModal" />
```

---

## 9. Computed properties

Use `computed()` for derived state.

Example:

```ts
readonly isDisabled = computed(
  () => this.disabled() || this.formDisabled(),
);
```

Prefer computed properties when:

- the value depends on Signals;
- the value is reused;
- it improves readability.

Avoid introducing a computed property for trivial expressions used only once unless it improves clarity.

---

## 10. Styling

Keep reusable component styling inside `*.styles.ts`.

Example:

```ts
export const inputStyles = {
  host: 'block w-full',
  input: [
    'w-full rounded-md bg-background px-4 py-2',
    'ring-2 ring-border outline-none',
  ].join(' '),
} as const;
```

Page-level styles should primarily handle:

- layout;
- spacing;
- positioning;
- page-specific branding;
- composition between shared components.

Shared components should own:

- control appearance;
- focus states;
- disabled states;
- reusable interaction styling.

---

## 11. Custom CSS classes

When useful, expose extra class inputs:

```ts
readonly className = input('');
readonly labelClassName = input('');
readonly iconClassName = input('');
```

Compose them with the base style:

```ts
readonly inputClasses = computed(() =>
  [inputStyles.input, this.className().trim()]
    .filter(Boolean)
    .join(' '),
);
```

This avoids manual whitespace handling.

---

## 12. Accessibility

### Accessible name

Expose `ariaLabel` when a component may have no visible text.

```ts
readonly ariaLabel = input('');
```

Template:

```html
[attr.aria-label]="ariaLabel() || label() || null"
```

### Validation description

Use `aria-describedby` to associate controls with helper/error text.

```html
<app-input
  ariaDescribedBy="email-error"
/>

<small id="email-error">
  Informe um e-mail válido.
</small>
```

### Invalid state

Expose or derive `aria-invalid` when necessary:

```html
[attr.aria-invalid]="ariaInvalid() ? true : null"
```

### Labels

Whenever possible, relate labels to native controls through `for` + `id`.

Generate an ID when none is supplied:

```ts
let nextInputId = 0;

private readonly generatedId = `app-input-${++nextInputId}`;

readonly inputId = computed(
  () => this.id() || this.generatedId,
);
```

---

## 13. Angular Forms integration

Any reusable form control that should work with:

```text
ngModel
FormControl
formControlName
```

should implement `ControlValueAccessor`.

Register it:

```ts
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ExampleComponent),
    multi: true,
  },
],
```

Implement:

```ts
writeValue(...)
registerOnChange(...)
registerOnTouched(...)
setDisabledState(...)
```

Keep these methods in their own section:

```ts
/*****************************************/
/* ControlValueAccessor                  */
/* Métodos utilizados pelo Angular Forms */
/* para integrar o componente aos forms. */
/*****************************************/
```

---

## 14. ControlValueAccessor pattern

### Internal callbacks

```ts
private onChange: (value: ValueType) => void = () => undefined;
private onTouched: () => void = () => undefined;
```

### External disabled state

```ts
private readonly formDisabled = signal(false);

readonly isDisabled = computed(
  () => this.disabled() || this.formDisabled(),
);
```

### Angular Forms methods

```ts
writeValue(value: ValueType): void {
  this.value.set(value);
}

registerOnChange(onChange: (value: ValueType) => void): void {
  this.onChange = onChange;
}

registerOnTouched(onTouched: () => void): void {
  this.onTouched = onTouched;
}

setDisabledState(disabled: boolean): void {
  this.formDisabled.set(disabled);
}
```

### User interaction

The component itself must call:

```ts
this.onChange(value);
```

when the user changes the value.

And:

```ts
this.onTouched();
```

when the control becomes touched, usually on blur.

---

## 15. Native elements first

Prefer:

```text
button  → <button>
link    → <a>
input   → <input>
select  → <select>
check   → <input type="checkbox">
modal   → <dialog>
```

Do not reproduce native behavior with `<div>` elements unless there is a concrete reason.

Benefits:

- keyboard behavior;
- accessibility;
- browser semantics;
- form integration;
- less custom code.

---

## 16. Button conventions

A shared button should normally support:

```ts
label
variant
type
disabled
fullWidth
ariaLabel
title
className
```

Optional behaviors may include click throttling.

For this project, disabled buttons intentionally use a neutral/gray style:

```ts
this.isDisabled()
  ? disabledButtonStyles
  : buttonStyles[this.variant()]
```

This is preferred over keeping the original semantic color with opacity.

---

## 17. Link conventions

A shared link may support:

```text
routerLink
href
target
rel
download
disabled
activeClassName
exact
```

Keep Angular routing and native navigation conceptually separate.

For `_blank`, provide a safe default:

```ts
return this.target() === '_blank'
  ? 'noopener noreferrer'
  : null;
```

A native `<a>` has no `disabled` attribute.

Disabled links should therefore combine:

```text
aria-disabled
tabindex="-1"
preventDefault()
stopPropagation()
```

---

## 18. Input conventions

Use `InputValue` when the component can return more than strings:

```ts
export type InputValue = string | number | null;
```

For `type="number"`:

```ts
const value =
  element.value !== ''
    ? element.valueAsNumber
    : '';
```

Do not unnecessarily convert numeric values back to strings.

Useful inputs may include:

```text
type
id
name
label
placeholder
autocomplete
accept
step
min
max
minLength
maxLength
required
disabled
readOnly
ariaLabel
ariaDescribedBy
ariaInvalid
```

---

## 19. Select conventions

Prefer a typed option model:

```ts
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}
```

Remember that native `<option value>` values are strings.

If the component needs to preserve numeric values, use an internal key and map it back to the original value rather than exposing the string conversion to consumers.

---

## 20. Checkbox conventions

Checkbox form values should normally be boolean.

```ts
readonly checked = model(false);
```

On native change:

```ts
const checked = element.checked;

this.checked.set(checked);
this.onChange(checked);
```

Prefer `change` for checkbox state changes.

---

## 21. Modal conventions

Prefer native `<dialog>` and `showModal()`.

Use a Signal as the state source:

```text
isOpen
  ↓
effect()
  ↓
showModal() / close()
```

Handle Escape through the native `cancel` event.

Use the native `close` event for post-close notifications.

For backdrop interaction, prefer a pointer event when appropriate rather than adding unnecessary keyboard handlers merely to satisfy click-accessibility lint rules.

---

## 22. Browser top layer

Remember that native modal dialogs opened with:

```ts
dialog.showModal();
```

live in the browser top layer.

A normal DOM element cannot reliably appear above them using only `z-index`.

If another UI element must stay above a native modal, it may also need to participate in the browser top layer.

The toast implementation in this project uses the Popover API for this reason.

---

## 23. Page composition

A page should use shared controls rather than duplicate their HTML and styles.

Prefer:

```html
<app-input />
<app-select />
<app-check />
<app-button />
<app-link />
```

Page-specific CSS should not redefine the complete visual appearance of these components.

It may still provide:

```text
self-center
mt-4
grid
flex
gap-*
width constraints
page-specific branding
```

---

## 24. Pre-implementation checklist

Before creating a new shared component, answer:

- Is there a native HTML element that already solves most of the problem?
- Does this really need to be reusable?
- Does it need Angular Forms integration?
- Does it need two-way binding with `model()`?
- Which inputs are actually part of the public API?
- Which outputs are useful to consumers?
- Which values should be computed?
- Does it need generated IDs?
- Does it need `aria-label`, `aria-describedby` or `aria-invalid`?
- Which styles belong to the shared component?
- Which styles should remain page-specific?
- Are any methods framework-contract methods?
- Are any implementation details unnecessarily exposed?

---

## 25. Post-implementation checklist

Before considering the component complete:

- Verify keyboard navigation.
- Verify focus-visible styling.
- Verify disabled behavior.
- Verify native form behavior.
- Verify `ngModel` if `ControlValueAccessor` is implemented.
- Verify Reactive Forms if applicable.
- Verify `touched` behavior.
- Verify generated and explicit IDs.
- Verify labels.
- Verify accessibility attributes.
- Verify custom classes.
- Verify projected content.
- Verify dark/light theme tokens if applicable.
- Verify that page-specific styles were not accidentally moved into the shared component.
- Remove unused inputs and outputs.

---

## 26. Baseline template

Use this as a starting point for future shared controls:

```ts
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
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

type ComponentValue = string | null;

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ExampleComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent implements ControlValueAccessor {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly formDisabled = signal(false);
  private onChange: (value: ComponentValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly value = model<ComponentValue>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly changed = output<ComponentValue>();

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /*****************************************/
  /* ControlValueAccessor                  */
  /* Métodos utilizados pelo Angular Forms */
  /* para integrar o componente aos forms. */
  /*****************************************/
  writeValue(value: ComponentValue): void {
    this.value.set(value);
  }

  registerOnChange(
    onChange: (value: ComponentValue) => void,
  ): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  handleChange(value: ComponentValue): void {
    this.value.set(value);
    this.onChange(value);
    this.changed.emit(value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
```

---

## 27. Final rule

When creating a new shared UI component:

```text
Start with native HTML.
Add Angular only for reusable state, API and forms integration.
Keep the public API small.
Keep responsibilities local.
Preserve accessibility.
Document non-obvious decisions.
Follow the same structure as the existing shared components.
```
