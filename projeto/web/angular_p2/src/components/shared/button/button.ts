import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { ButtonVariant, buttonStyles, disabledButtonStyles } from './button.styles';

export type ButtonType = 'button' | 'reset' | 'submit';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents',
  },
})
export class ButtonComponent {
  readonly label = input('');
  readonly variant = input<ButtonVariant>('default');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly title = input('');
  readonly className = input('');
  readonly iconClassName = input('inline-flex size-5 items-center justify-center [&>svg]:size-full');
  readonly allowSpam = input(false, { transform: booleanAttribute });
  readonly spamDelay = input(2000, { transform: numberAttribute });

  readonly clicked = output<MouseEvent>();

  private readonly isThrottled = signal(false);
  private throttleTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly shouldPreventSpam = computed(() => !this.allowSpam() && this.type() !== 'submit');

  protected readonly isDisabled = computed(() => {
    return this.disabled() || (this.shouldPreventSpam() && this.isThrottled());
  });

  protected readonly classes = computed(() => {
    const additionalClasses = this.className().trim();
    const variantClasses = this.isDisabled() ? disabledButtonStyles : buttonStyles[this.variant()];
    const widthClasses = this.fullWidth() ? 'w-full' : 'w-auto';

    return `${variantClasses} ${widthClasses}${additionalClasses ? ` ${additionalClasses}` : ''}`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.throttleTimer) {
        clearTimeout(this.throttleTimer);
      }
    });
  }

  protected handleClick(event: MouseEvent): void {
    if (this.isDisabled()) {
      return;
    }

    if (this.shouldPreventSpam()) {
      this.isThrottled.set(true);
      this.throttleTimer = setTimeout(() => {
        this.isThrottled.set(false);
        this.throttleTimer = undefined;
      }, Math.max(0, this.spamDelay()));
    }

    this.clicked.emit(event);
  }
}
