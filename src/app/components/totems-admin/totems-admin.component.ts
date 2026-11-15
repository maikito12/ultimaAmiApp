import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AlertaService } from '../../services/alerta.service';
import { ConfiguracionOrganizacionService, OrganizacionGeneral, Sucursal } from '../../services/configuracion-organizacion.service';
import { AlcanceTotem, CodigoTotemRespuesta, CrearTotemPayload, FuenteTotem, OrientacionTotem, Totem, TotemsAdminService } from '../../services/totemsadmin.service';

@Component({
  selector: 'app-totems-admin', standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './totems-admin.component.html',
  styleUrl: './totems-admin.component.css'
})
export class TotemsAdminComponent implements OnInit, OnDestroy {
  totems: Totem[] = [];
  sucursales: Sucursal[] = [];
  organizacion: OrganizacionGeneral | null = null;
  cargando = true;
  guardando = false;
  procesandoId: string | null = null;
  formularioAbierto = false;
  editandoId: string | null = null;
  codigoVisible: {codigo:string;venceAt:string;totemNombre:string}|null = null;
  segundosRestantes = 0;
  private intervaloCodigo: ReturnType<typeof setInterval> | null = null;
  formulario: CrearTotemPayload = this.nuevoFormulario();
  pisosTexto = '';
  readonly urlTotem = 'https://coriasalud.com/totem';
  enlaceCopiado = false;
  readonly fuentes: {id: FuenteTotem; nombre:string}[] = [
    {id:'SISTEMA',nombre:'Predeterminada'},
    {id:'INTER',nombre:'Inter'}, {id:'POPPINS',nombre:'Poppins'},
    {id:'MONTSERRAT',nombre:'Montserrat'}, {id:'ROBOTO',nombre:'Roboto'}
  ];
  constructor(
    private readonly totemsService: TotemsAdminService,
    private readonly configuracionService: ConfiguracionOrganizacionService,
    private readonly alerta: AlertaService
  ) {}
  ngOnInit(): void { this.cargarDatos(); }
  ngOnDestroy(): void { this.cerrarCodigo(); }
  get vinculados(): number { return this.totems.filter(t => t.vinculado).length; }
  get sinVincular(): number { return this.totems.filter(t => !t.vinculado).length; }
  get pisosProcesados(): string[] {
    return this.pisosTexto.split(/[,;\n]+/g).map(p=>p.trim())
      .filter(p=>p.length>0 && p.length<=50)
      .filter((p,i,arr)=>arr.findIndex(q=>q.toLowerCase()===p.toLowerCase())===i).slice(0,30);
  }
  private nuevoFormulario(): CrearTotemPayload {
    return {nombre:'',sucursalFisicaId:'',alcanceReservas:'SUCURSAL',pisos:[],slogan:null,
      colorPrincipal:'#17483D',colorSecundario:'#8B5CF6',orientacion:'AUTO',fuente:'SISTEMA'};
  }
  cargarDatos(): void {
    this.cargando=true;
    forkJoin({totems:this.totemsService.listar(),sucursales:this.configuracionService.obtenerSucursales(),
      organizacion:this.configuracionService.obtenerOrganizacionActual()}).subscribe({
      next:({totems,sucursales,organizacion})=>{this.totems=totems;this.sucursales=sucursales;this.organizacion=organizacion;this.cargando=false;},
      error:e=>{this.cargando=false;this.alerta.error('No se pudieron cargar los tótems',this.mensajeError(e,'Intentá nuevamente.'));}
    });
  }
  abrirCrear(): void {
    this.editandoId=null;
    this.formulario=this.nuevoFormulario();
    this.formulario.sucursalFisicaId=this.sucursales[0]?.id || '';
    this.formulario.colorPrincipal=this.organizacion?.colorPrincipal || '#17483D';
    this.formulario.colorSecundario=this.organizacion?.colorSecundario || '#8B5CF6';
    this.pisosTexto='';this.formularioAbierto=true;
  }
  abrirEditar(t:Totem):void {
    this.editandoId=t.id;
    this.formulario={nombre:t.nombre,sucursalFisicaId:t.sucursal_fisica_id,
      alcanceReservas:t.alcance_reservas,pisos:[...t.pisos],slogan:t.slogan,
      colorPrincipal:t.color_principal,colorSecundario:t.color_secundario,
      orientacion:t.orientacion,fuente:t.fuente || 'SISTEMA'};
    this.pisosTexto=t.pisos.join(', ');
    this.formularioAbierto=true;
  }
  cerrarFormulario():void {if(!this.guardando){this.formularioAbierto=false;this.editandoId=null;}}
  guardar(): void {
    if(this.guardando)return;
    const nombre=this.formulario.nombre.trim();
    if(!nombre||nombre.length>120){this.alerta.warning('Nombre inválido','Ingresá hasta 120 caracteres.');return;}
    if(!this.sucursales.some(s=>s.id===this.formulario.sucursalFisicaId)){this.alerta.warning('Sucursal inválida','Seleccioná una sucursal.');return;}
    if(this.formulario.alcanceReservas==='PISOS' && this.pisosProcesados.length===0){this.alerta.warning('Faltan pisos','Ingresá al menos un piso.');return;}
    const payload:CrearTotemPayload={...this.formulario,nombre,slogan:this.formulario.slogan?.trim() || null,
      pisos:this.formulario.alcanceReservas==='PISOS'?this.pisosProcesados:[]};
    this.guardando=true;
    if(this.editandoId){
      const id=this.editandoId;
      this.totemsService.editar(id,payload).subscribe({
        next:t=>{this.guardando=false;this.cerrarFormulario();this.totems=this.totems.map(x=>x.id===id?t:x);this.alerta.success('Tótem actualizado','La configuración se guardó correctamente.');},
        error:e=>{this.guardando=false;this.alerta.error('No se pudo editar',this.mensajeError(e,'Intentá de nuevo.'));}
      });
    } else {
      this.totemsService.crear(payload).subscribe({
        next:r=>{this.guardando=false;this.cerrarFormulario();this.totems=[...this.totems,r.totem].sort((a,b)=>a.nombre.localeCompare(b.nombre));this.mostrarCodigo(r,r.totem.nombre);this.alerta.success('Tótem creado','Ingresá el código en el dispositivo.');},
        error:e=>{this.guardando=false;this.alerta.error('No se pudo crear',this.mensajeError(e,'Intentá de nuevo.'));}
      });
    }
  }
  eliminar(t:Totem):void {
    if(this.procesandoId)return;
    if(!window.confirm(`¿Eliminar «${t.nombre}»? Se revocará su acceso y no podrá volver a conectarse sin crear otro tótem.`))return;
    this.procesandoId=t.id;
    this.totemsService.eliminar(t.id).subscribe({
      next:()=>{this.procesandoId=null;this.totems=this.totems.filter(x=>x.id!==t.id);this.alerta.success('Tótem eliminado','Se revocó la credencial del dispositivo.');},
      error:e=>{this.procesandoId=null;this.alerta.error('No se pudo eliminar',this.mensajeError(e,'Intentá de nuevo.'));}
    });
  }
  regenerar(t:Totem):void {
    if(this.procesandoId||t.vinculado)return;
    this.procesandoId=t.id;
    this.totemsService.regenerarCodigo(t.id).subscribe({
      next:r=>{this.procesandoId=null;t.codigo_vence_at=r.venceAt;this.mostrarCodigo(r,t.nombre);},
      error:e=>{this.procesandoId=null;this.alerta.error('No se pudo generar código',this.mensajeError(e,'Intentá de nuevo.'));}
    });
  }
  desvincular(t:Totem):void {
    if(this.procesandoId||!t.vinculado)return;
    if(!window.confirm(`¿Desvincular «${t.nombre}»? El dispositivo perderá el acceso.`))return;
    this.procesandoId=t.id;
    this.totemsService.desvincular(t.id).subscribe({
      next:()=>{this.procesandoId=null;t.vinculado=false;t.codigo_vence_at=null;this.cerrarCodigo();this.alerta.success('Dispositivo desvinculado');},
      error:e=>{this.procesandoId=null;this.alerta.error('No se pudo desvincular',this.mensajeError(e,'Intentá de nuevo.'));}
    });
  }
  nombreSucursal(id:string):string {return this.sucursales.find(s=>s.id===id)?.nombre || 'Sucursal no disponible';}
  descripcionAlcance(a:AlcanceTotem):string {return a==='TODAS'?'Todas las sucursales':a==='PISOS'?'Pisos seleccionados':'Solo sucursal física';}
  descripcionOrientacion(v:OrientacionTotem):string {return v==='VERTICAL'?'Vertical':v==='HORIZONTAL'?'Horizontal':'Automática';}
  private mostrarCodigo(r:CodigoTotemRespuesta,nombre:string):void {
    this.cerrarCodigo();this.codigoVisible={codigo:r.codigo,venceAt:r.venceAt,totemNombre:nombre};
    this.actualizarSegundos();this.intervaloCodigo=setInterval(()=>this.actualizarSegundos(),1000);
  }
  private actualizarSegundos():void {
    if(!this.codigoVisible)return;
    const vence=Date.parse(this.codigoVisible.venceAt);
    this.segundosRestantes=Number.isFinite(vence)?Math.max(0,Math.ceil((vence-Date.now())/1000)):0;
    if(this.segundosRestantes===0)this.detenerTemporizador();
  }
  get reloj():string {return `${Math.floor(this.segundosRestantes/60).toString().padStart(2,'0')}:${(this.segundosRestantes%60).toString().padStart(2,'0')}`;}
  cerrarCodigo():void {this.detenerTemporizador();this.codigoVisible=null;this.segundosRestantes=0;}
  private detenerTemporizador():void {if(this.intervaloCodigo!==null)clearInterval(this.intervaloCodigo);this.intervaloCodigo=null;}
  private mensajeError(e:any,fallback:string):string {return typeof e?.error?.message==='string'?e.error.message:fallback;}
  async copiarEnlaceTotem():Promise<void> {
    try{await navigator.clipboard.writeText(this.urlTotem);this.enlaceCopiado=true;setTimeout(()=>this.enlaceCopiado=false,2500);this.alerta.success('Enlace copiado');}
    catch{this.alerta.error('No se pudo copiar','Copiá la dirección manualmente.');}
  }
}
