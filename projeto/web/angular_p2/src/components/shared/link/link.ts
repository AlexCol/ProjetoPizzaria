import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
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
  readonly label = input('');
  readonly variant = input<LinkVariant>('default');
  readonly routerLink = input<string | null>(null);
  readonly href = input('');
  readonly target = input<LinkTarget>('');
  readonly rel = input('');
  readonly download = input('');
  readonly title = input('');
  readonly ariaLabel = input('');
  readonly className = input('');
  readonly activeClassName = input('');
  readonly exact = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly clicked = output<MouseEvent>();

  protected readonly classes = computed(() => {
    const additionalClasses = this.className().trim();
    const disabledClasses = this.disabled() ? ` ${disabledLinkStyles}` : '';

    return `${linkStyles[this.variant()]}${disabledClasses}${additionalClasses ? ` ${additionalClasses}` : ''}`;
  });

  protected readonly safeRel = computed(() => {
    if (this.rel()) {
      return this.rel();
    }

    return this.target() === '_blank' ? 'noopener noreferrer' : null;
  });

  protected handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.clicked.emit(event);
  }
}
