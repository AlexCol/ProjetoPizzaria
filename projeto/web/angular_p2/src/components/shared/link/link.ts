import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LinkVariant, disabledLinkStyles, linkStyles } from './link.styles';

export type LinkTarget = '_blank' | '_parent' | '_self' | '_top' | '';

@Component({
  selector: 'app-link',
  templateUrl: './link.html',
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents',
  },
})
export class LinkComponent {
  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly label = input(''); // Texto exibido no link. Usado no template e como fallback do aria-label.
  readonly variant = input<LinkVariant>('default'); // Define a variação visual. Usado em classes() para selecionar linkStyles.
  readonly routerLink = input<string | readonly unknown[] | null>(null); // Define navegação interna pelo Angular Router. Usado no template para escolher o tipo de link.
  readonly href = input(''); // Define a URL para navegação nativa. Usado quando routerLink não é informado.
  readonly target = input<LinkTarget>(''); // Define onde o link será aberto. Usado no atributo target.
  readonly rel = input(''); // Define a relação do recurso vinculado. Usado em safeRel().
  readonly download = input(''); // Define o nome do arquivo no download. Usado no atributo download.
  readonly title = input(''); // Define o atributo title nativo do link. Usado no template.
  readonly ariaLabel = input(''); // Nome acessível do link, principalmente quando não há texto visível. Usado no aria-label.
  readonly className = input(''); // Permite adicionar classes extras ao link. Usado em classes().
  readonly activeClassName = input(''); // Classes aplicadas quando a rota estiver ativa. Usado pelo RouterLinkActive.
  readonly exact = input(false, { transform: booleanAttribute }); // Define se RouterLinkActive exige correspondência exata da rota.
  readonly disabled = input(false, { transform: booleanAttribute }); // Impede a navegação e remove o link da navegação por teclado.

  readonly clicked = output<MouseEvent>(); // Emitido quando o link é clicado e não está desabilitado.

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly classes = computed(() =>
    [linkStyles[this.variant()], this.disabled() ? disabledLinkStyles : '', this.className().trim()]
      .filter(Boolean)
      .join(' '),
  );

  // Adiciona rel seguro automaticamente quando target="_blank" e nenhum rel foi informado.
  readonly safeRel = computed(() => {
    if (this.rel()) {
      return this.rel();
    }

    return this.target() === '_blank' ? 'noopener noreferrer' : null;
  });

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  // Disparado ao clicar no link. Impede a navegação quando disabled estiver ativo.
  handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.clicked.emit(event);
  }
}
