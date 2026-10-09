import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface LandingFeature {
  icono: string;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  tono: 'menta' | 'crema' | 'lavanda' | 'blanco';
}

interface LandingFaq {
  pregunta: string;
  respuesta: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  readonly marca = 'CoriaSalud';
  readonly anioActual = new Date().getFullYear();

  menuAbierto = false;
  preguntaAbierta: number | null = 0;

  readonly funcionalidades: LandingFeature[] = [
    {
      icono: 'calendar',
      etiqueta: 'AGENDA',
      titulo: 'Turnos, sin complicaciones.',
      descripcion: 'Organizá horarios, bloqueos, confirmaciones y cancelaciones desde una agenda clara y fácil de usar.',
      tono: 'menta'
    },
    {
      icono: 'link',
      etiqueta: 'RESERVAS ONLINE',
      titulo: 'Tus pacientes reservan cuando quieren.',
      descripcion: 'Compartí un enlace de reservas para que elijan profesional, sucursal y horario disponible, sin crear una cuenta.',
      tono: 'crema'
    },
    {
      icono: 'users',
      etiqueta: 'PACIENTES',
      titulo: 'La información, organizada.',
      descripcion: 'Centralizá los datos de pacientes y el seguimiento de las consultas en un mismo espacio de trabajo.',
      tono: 'blanco'
    },
    {
      icono: 'message',
      etiqueta: 'COMUNICACIÓN',
      titulo: 'Menos mensajes manuales.',
      descripcion: 'Configurá comunicaciones operativas de turnos por WhatsApp y correo, según los canales habilitados.',
      tono: 'lavanda'
    },
    {
      icono: 'building',
      etiqueta: 'EQUIPOS',
      titulo: 'Un lugar para todo tu equipo.',
      descripcion: 'Gestioná profesionales, secretarías y múltiples sucursales con accesos según cada rol.',
      tono: 'blanco'
    },
    {
      icono: 'chart',
      etiqueta: 'REPORTES',
      titulo: 'Decisiones con más claridad.',
      descripcion: 'Consultá información de turnos y actividad para entender mejor el funcionamiento de tu espacio.',
      tono: 'menta'
    }
  ];

  readonly preguntas: LandingFaq[] = [
    {
      pregunta: '¿Sirve para un profesional independiente y para un centro de salud?',
      respuesta: 'Sí. La plataforma está pensada para profesionales que atienden por su cuenta y para organizaciones que necesitan coordinar varios profesionales y sucursales.'
    },
    {
      pregunta: '¿Los pacientes tienen que registrarse para pedir un turno?',
      respuesta: 'No. Pueden reservar desde el enlace público de la organización completando los datos necesarios para gestionar la solicitud.'
    },
    {
      pregunta: '¿Puedo trabajar con más de una sucursal?',
      respuesta: 'Sí. Podés organizar la disponibilidad de profesionales y sus horarios en diferentes sucursales.'
    },
    {
      pregunta: '¿La plataforma envía recordatorios?',
      respuesta: 'Incluye herramientas para automatizar comunicaciones operativas de turnos por los canales configurados, como WhatsApp y correo electrónico. La disponibilidad depende de la configuración e integración de cada organización.'
    },
    {
      pregunta: '¿Cómo puedo empezar a usarla?',
      respuesta: 'Podés crear una cuenta desde el botón «Empezar ahora» y continuar con la configuración de tu organización y profesionales.'
    }
  ];

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  togglePregunta(indice: number): void {
    this.preguntaAbierta = this.preguntaAbierta === indice ? null : indice;
  }
}
