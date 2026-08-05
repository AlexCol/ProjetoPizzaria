import { Component } from '@angular/core';
import { loaderStyles } from './loader.styles';

@Component({
  selector: 'app-loader',
  template: '<div [class]="styles.screen"><div [class]="styles.loader"></div></div>',
  host: {
    '[class]': 'styles.host',
  },
})
export class LoaderComponent {
  protected get styles() {
    return loaderStyles;
  }
}
