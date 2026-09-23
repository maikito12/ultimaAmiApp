import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertaComponent } from './app/shared/alertas/alerta/alerta.component';
import { DialogoComponent } from './app/shared/dialogos/dialogo/dialogo.component';




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AlertaComponent,
    DialogoComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'amiapp';
}
