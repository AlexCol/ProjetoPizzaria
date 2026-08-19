# `let-` em `ng-template` e tipagem do contexto

Este guia explica como variáveis como `let-user` funcionam dentro de um
`ng-template` e como usar uma diretiva com `ngTemplateContextGuard` para que o
Angular e o VS Code conheçam o tipo dessas variáveis.

## O que significa `let-user`

Um `ng-template` não é renderizado sozinho. Ele é instanciado por outro recurso,
como `NgTemplateOutlet`, que fornece um objeto de contexto:

```html
<ng-container
  [ngTemplateOutlet]="userTemplate"
  [ngTemplateOutletContext]="{
    $implicit: selectedUser,
    row: selectedUser,
    value: selectedUser.status
  }"
/>
```

Dentro do template, `let-` cria uma variável local a partir desse contexto:

```html
<ng-template #userTemplate let-user let-row="row" let-status="value">
  {{ user.name }} {{ row.email }} {{ status }}
</ng-template>
```

As correspondências são:

| Declaração no template | Propriedade do contexto |
| ---------------------- | ----------------------- |
| `let-user`             | `$implicit`             |
| `let-row="row"`        | `row`                   |
| `let-status="value"`   | `value`                 |

O nome depois de `let-` é local e pode ser escolhido livremente. Portanto,
`let-user` e `let-item` acessariam o mesmo `$implicit`:

```html
<ng-template let-item> {{ item.name }} </ng-template>
```

O equivalente explícito de `let-user` é `let-user="$implicit"`.

## Por que o tipo não é inferido automaticamente

O objeto passado por `ngTemplateOutletContext` existe em tempo de execução, mas
um `ng-template` pode ser declarado longe do ponto em que será instanciado. Por
isso, o Angular Language Service nem sempre consegue ligar o contexto ao
template durante a análise estática.

Sem uma declaração de contexto reconhecida pelo compilador, `user` pode ficar
como `any`. Nesse caso, o VS Code não oferece autocomplete e também não acusa um
erro em propriedades inexistentes como `user.stats`.

Esta anotação no componente não resolve a tipagem interna do HTML:

```ts
readonly statusTemplate =
  viewChild<TemplateRef<DataTableCellTemplateContext<User>>>('statusTemplate');
```

Ela tipa o valor retornado por `viewChild`, mas não declara ao compilador qual é
o contexto dos `let-` dentro daquele template.

## Diretiva que declara o contexto

Neste projeto, a diretiva `UserTemplateDirective` associa o seletor
`appUserTemplate` ao contexto de um `User`:

```ts
import { Directive, inject, TemplateRef } from '@angular/core';
import { User } from '../../models/User';

interface UserTemplateContext {
  $implicit: User;
}

@Directive({
  selector: 'ng-template[appUserTemplate]',
  standalone: true,
})
export class UserTemplateDirective {
  readonly templateRef = inject(TemplateRef<UserTemplateContext>);

  static ngTemplateContextGuard(directive: UserTemplateDirective, context: unknown): context is UserTemplateContext {
    return true;
  }
}
```

O método estático `ngTemplateContextGuard` é reconhecido especialmente pelo
compilador Angular. O predicado
`context is UserTemplateContext` informa que o `$implicit` é um `User`.

O método retornar `true` não valida os dados em tempo de execução. Ele formaliza
um contrato: quem instancia o template deve fornecer um contexto compatível.

## Importação obrigatória

Como a diretiva é standalone, ela precisa estar nos `imports` de todo componente
standalone que a utiliza:

```ts
import { UserTemplateDirective } from '../../../../directives/domain/user-template.directive';

@Component({
  // ...
  imports: [
    UserTemplateDirective,
    // outros componentes e diretivas
  ],
})
export class UsuariosComponent {}
```

Se ela não estiver em `imports`, `appUserTemplate` poderá ser tratado somente
como um atributo comum. Nesse cenário, o guard não participa da verificação e o
`let-user` continua sem o tipo esperado.

## Uso no HTML

A diretiva deve ser aplicada em cada template que precise do contexto tipado:

```html
<ng-template appUserTemplate #statusTemplate let-user>
  <span [class]="user.status === 'Active' ? styles.activeBadge : styles.inactiveBadge">
    {{ statusLabel(user.status) }}
  </span>
</ng-template>

<ng-template appUserTemplate #actionsTemplate let-user>
  <app-button (clicked)="openModal(user)" />
</ng-template>
```

Com `strictTemplates` habilitado, o resultado esperado é:

```html
{{ user.status }}
<!-- válido -->
{{ user.stats }}
<!-- erro: a propriedade não existe em User -->
```

## Contexto completo da DataTable

A DataTable deste projeto fornece três propriedades ao instanciar uma célula:

```ts
export interface DataTableCellTemplateContext<TData> {
  $implicit: TData;
  row: TData;
  value: unknown;
}
```

O contexto enviado em `data-table.html` segue esse formato:

```html
[ngTemplateOutletContext]="{ $implicit: row.original, row: row.original, value: cell.getValue() }"
```

A versão atual de `UserTemplateDirective` declara apenas `$implicit`, que é o
necessário para `let-user`. Se também for necessário tipar `let-row` e
`let-value`, o contexto da diretiva pode declarar todas as propriedades:

```ts
interface UserTemplateContext {
  $implicit: User;
  row: User;
  value: unknown;
}
```

O uso passa a ser:

```html
<ng-template appUserTemplate #statusTemplate let-user let-row="row" let-value="value">
  {{ user.name }} {{ row.email }} {{ value }}
</ng-template>
```

## Configuração do compilador

Em `tsconfig.json`, `angularCompilerOptions` deve estar no nível raiz, ao lado de
`compilerOptions`:

```json
{
  "compilerOptions": {
    "strict": true
  },
  "angularCompilerOptions": {
    "strictTemplates": true
  }
}
```

Após criar ou importar a diretiva, pode ser necessário executar no VS Code
`Angular: Restart Angular Language Service` ou `Developer: Reload Window`.

## Checklist

- `strictTemplates` está habilitado no `tsconfig.json`.
- A diretiva possui `ngTemplateContextGuard` com um predicado de tipo.
- `$implicit` possui o tipo que será recebido pelo `let-user`.
- A diretiva standalone está em `imports` do componente consumidor.
- O atributo `appUserTemplate` aparece em todos os templates que precisam da
  tipagem.
- O contexto fornecido em tempo de execução respeita o contrato declarado pela
  diretiva.
