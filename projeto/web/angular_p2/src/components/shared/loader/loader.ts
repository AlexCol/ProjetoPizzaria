import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: '<div class="loading-screen"><div class="loader"></div></div>',
})
export class LoaderComponent {}

//! optado por deixar esse loader com .css pois uso ele para o index.html
//! para um loader customizado enquanto não é inicializada a aplicação
//! assim, mantenho a logica num lugar só
