import { Component } from '@angular/core';
import { footerStyles } from './footer.styles';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  host: {
    '[class]': 'styles.host',
  },
})
export class FooterComponent {
  protected readonly currentYear = new Date().getFullYear();

  protected get styles() {
    return footerStyles;
  }
}
