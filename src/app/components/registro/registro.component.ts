import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { AuthService } from '../../services/auth-service.service';
import { AlertaService } from '../../services/alerta.service';


type ModoRegistro =
  | 'seleccion'
  | 'organizacion'
  | 'usuario'
  | 'invitacion';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {

  modo: ModoRegistro = 'seleccion';

  nombreOrganizacion = '';
  codigoInvitacion = '';

  nombre = '';
  apellido = '';
  email = '';
  password = '';
  repetirPassword = '';

  mostrarPassword = false;
  mostrarRepetirPassword = false;

  aceptaTerminos = false;

  cargando = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertaService: AlertaService
  ) {}

  ngOnInit(): void {

    const modoQuery =
      this.route.snapshot.queryParamMap.get('modo');

    const codigoQuery =
      this.route.snapshot.queryParamMap.get('codigo');

    if (
      modoQuery === 'organizacion' ||
      modoQuery === 'usuario' ||
      modoQuery === 'invitacion'
    ) {
      this.modo = modoQuery;
    }

    if (codigoQuery?.trim()) {
      this.codigoInvitacion =
        codigoQuery.trim().toUpperCase();

      this.modo = 'invitacion';
    }
  }

  seleccionarModo(
    modo: Exclude<ModoRegistro, 'seleccion'>
  ): void {
    this.modo = modo;
  }

  volverSeleccion(): void {
    this.modo = 'seleccion';
    this.cargando = false;
  }

  registrar(): void {

    if (!this.validarFormulario()) {
      return;
    }

    switch (this.modo) {

      case 'organizacion':
        this.registrarOrganizacion();
        break;

      case 'usuario':
        this.registrarUsuario();
        break;

      case 'invitacion':
        this.registrarConInvitacion();
        break;
    }
  }

  private validarFormulario(): boolean {

    if (
      !this.nombre.trim() ||
      !this.apellido.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.repetirPassword
    ) {
      this.alertaService.warning(
        'Campos incompletos',
        'Completá todos los campos obligatorios.'
      );
      return false;
    }

    if (
      this.modo === 'organizacion' &&
      !this.nombreOrganizacion.trim()
    ) {
      this.alertaService.warning(
        'Falta la organización',
        'Ingresá el nombre de tu consultorio, clínica u organización.'
      );
      return false;
    }

    if (
      this.modo === 'invitacion' &&
      !this.codigoInvitacion.trim()
    ) {
      this.alertaService.warning(
        'Falta el código',
        'Ingresá el código de invitación que te compartieron.'
      );
      return false;
    }

    if (this.password !== this.repetirPassword) {
      this.alertaService.warning(
        'Las contraseñas no coinciden',
        'Verificá que ambas contraseñas sean iguales.'
      );
      return false;
    }

    if (this.password.length < 6) {
      this.alertaService.warning(
        'Contraseña demasiado corta',
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return false;
    }

    if (!this.aceptaTerminos) {
      this.alertaService.warning(
        'Aceptación requerida',
        'Para crear tu cuenta tenés que aceptar los Términos y Condiciones y la Política de Privacidad.'
      );
      return false;
    }

    return true;
  }

  private registrarOrganizacion(): void {

    this.cargando = true;

    this.auth.register({
      nombreOrganizacion:
        this.nombreOrganizacion.trim(),
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({

      next: () => {
        this.cargando = false;

        this.alertaService.success(
          'Organización creada',
          'Tu cuenta y tu organización ya están listas.'
        );

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        this.cargando = false;
        this.mostrarErrorRegistro(error);
      }
    });
  }

  private registrarUsuario(): void {

    this.cargando = true;

    this.auth.registerUsuario({
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({

      next: () => {
        this.cargando = false;

        this.alertaService.success(
          'Cuenta creada',
          'Ya podés iniciar sesión. Después vas a poder unirte a una organización con un código.'
        );

        this.router.navigate(['/login']);
      },

      error: (error) => {
        this.cargando = false;
        this.mostrarErrorRegistro(error);
      }
    });
  }

  private registrarConInvitacion(): void {

    this.cargando = true;

    this.auth.registerConInvitacion({
      codigo:
        this.codigoInvitacion
          .replace(/\s+/g, '')
          .toUpperCase(),
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({

      next: () => {
        this.cargando = false;

        this.alertaService.success(
          'Te uniste correctamente',
          'Tu cuenta ya forma parte de la organización.'
        );

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        this.cargando = false;
        this.mostrarErrorRegistro(error);
      }
    });
  }

  private mostrarErrorRegistro(
    error: any
  ): void {

    console.error(
      'Error al registrar:',
      error
    );

    let mensaje =
      'No se pudo completar el registro.';

    if (error?.error?.message) {
      mensaje = error.error.message;
    } else if (error?.error?.Message) {
      mensaje = error.error.Message;
    } else if (typeof error?.error === 'string') {
      mensaje = error.error;
    }

    this.alertaService.error(
      'No se pudo crear la cuenta',
      mensaje
    );
  }

  normalizarCodigo(): void {
    this.codigoInvitacion =
      this.codigoInvitacion
        .replace(/\s+/g, '')
        .toUpperCase();
  }

  volverLogin(): void {
    this.router.navigate(['/login']);
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  toggleRepetirPassword(): void {
    this.mostrarRepetirPassword =
      !this.mostrarRepetirPassword;
  }

  get tituloFormulario(): string {

    switch (this.modo) {
      case 'organizacion':
        return 'Creá tu organización';

      case 'usuario':
        return 'Creá tu cuenta';

      case 'invitacion':
        return 'Unite a una organización';

      default:
        return 'Creá tu cuenta';
    }
  }

  get descripcionFormulario(): string {

    switch (this.modo) {
      case 'organizacion':
        return 'Creá el espacio desde el que vas a gestionar tu consultorio o clínica.';

      case 'usuario':
        return 'Creá una cuenta personal. Después podés sumarte a una o más organizaciones.';

      case 'invitacion':
        return 'Usá el código que te compartieron para crear tu cuenta dentro de esa organización.';

      default:
        return '';
    }
  }

  get textoBoton(): string {

    if (this.cargando) {
      switch (this.modo) {
        case 'organizacion':
          return 'Creando organización...';

        case 'invitacion':
          return 'Uniéndote...';

        default:
          return 'Creando cuenta...';
      }
    }

    switch (this.modo) {
      case 'organizacion':
        return 'Crear organización';

      case 'invitacion':
        return 'Crear cuenta y unirme';

      default:
        return 'Crear cuenta';
    }
  }
}
