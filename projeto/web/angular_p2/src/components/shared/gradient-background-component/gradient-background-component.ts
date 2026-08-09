import { Component } from '@angular/core';
import { gradientBackgroundStyles } from './gradient-background-component.styles';

@Component({
  selector: 'app-gradient-background',
  templateUrl: './gradient-background-component.html',
  host: {
    '[class]': 'styles.host',
    'aria-hidden': 'true',
  },
})
export class GradientBackgroundComponent {
  protected readonly styles = gradientBackgroundStyles;
}
