import { Component, computed, inject, signal } from "@angular/core";
import { Cuota, ToPrestamo } from "../../mappers/prestamo.mapper";
import { PrestamoEstado } from "../../interfaces/prestamo.interface";
import { httpPrestamoService } from "../../services/http_prestamo.service";
import { NgClass } from "@angular/common";
import { formatearRut, limpiarRut, validarRut } from "../../../utils/rut.util";

interface UpdatePrestamo{ prestamoId:number; Items : cuotas[];}
interface cuotas { NroCuota:number; }

@Component({
  selector: 'prestamo-cobrar',
  imports: [NgClass],
  templateUrl: './prestamo-cobrar.html',
  styleUrl: './prestamo-cobrar.css',
})
export class PrestamoCobrar {
  private httpPrestamo = inject(httpPrestamoService);
 
  readonly PAGE_SIZE = 5;
  readonly EstadoCuota = PrestamoEstado;
 
  searchTerm = signal('');
  errorRut = signal('');
  prestamo = signal<ToPrestamo | null>(null);
 
  buscando = false;
  noEncontrado = false;
  registrandoPago = false;
 
  currentPage = 1;
  selected = new Set<number>(); // nroCuota seleccionados (persisten entre páginas)
 
  fmt(n: number): string {
    return n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
 
  // ── Búsqueda ────────────────────────────────────────
  buscar(): void {
    const raw = this.searchTerm().trim();
 
    if (!validarRut(raw)) {
      this.noEncontrado = false;
      this.errorRut.set('RUT inválido. Revisa el número y el dígito verificador.');
      return;
    }
 
    this.errorRut.set('');
    const doc = formatearRut(raw); // si el backend espera K como '10': formatearRut(raw, { kComoDiez: true })
 
    this.buscando = true;
    this.noEncontrado = false;
    this.prestamo.set(null);
    this.selected.clear();
    this.currentPage = 1;
 
    this.httpPrestamo.getPrestamoById(doc).subscribe({
      next: (prestamo) => {
        this.buscando = false;
        this.prestamo.set(prestamo);
      },
      error: () => {
        this.buscando = false;
        this.noEncontrado = true;
      },
    });
  }
 
  /** Formatea el RUT mientras el usuario escribe (12.345.678-9). */
  actualizarState(e: Event): void {
    const input = e.target as HTMLInputElement;
    const limpio = limpiarRut(input.value).slice(0, 9); // máx. 8 dígitos + DV
    const formateado = formatearRut(limpio);
 
    input.value = formateado;       // refleja el formato en el input
    this.searchTerm.set(formateado);
    this.errorRut.set('');
    this.noEncontrado = false;
  }
 
  // ── Paginación ──────────────────────────────────────
  get totalPages(): number {
    const p = this.prestamo();
    return p ? Math.max(1, Math.ceil(p.items.length / this.PAGE_SIZE)) : 1;
  }
 
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
 
  get cuotasPagina(): Cuota[] {
    const p = this.prestamo();
    if (!p) { return []; }
    const start = (this.currentPage - 1) * this.PAGE_SIZE;
    return p.items.slice(start, start + this.PAGE_SIZE);
  }
 
  irAPagina(page: number): void {
    if (page < 1 || page > this.totalPages) { return; }
    this.currentPage = page;
  }
 
  // ── Selección de cuotas y total ─────────────────────
  toggleCuota(cuota: Cuota, checked: boolean): void {
    if (cuota.estado === this.EstadoCuota.Pagado) { return; }
    if (checked) { this.selected.add(cuota.nroCuota); }
    else { this.selected.delete(cuota.nroCuota); }
  }
 
  get totalAPagar(): number {
    const p = this.prestamo();
    if (!p) { return 0; }
    return p.items
      .filter(c => c.estado !== this.EstadoCuota.Pagado && this.selected.has(c.nroCuota))
      .reduce((sum, c) => sum + c.montoCuota, 0);
  }
 
  // ── Registrar pago ──────────────────────────────────
  registrarPago(): void {
    const p = this.prestamo();
    if (!p || this.selected.size === 0) {
      alert('Selecciona al menos una cuota pendiente para registrar el pago.');
      return;
    }
 
    const request: UpdatePrestamo = {
      prestamoId: p.prestamoId,
      Items: [...this.selected].map(NroCuota => ({ NroCuota })),
    };
 
    const monto = this.totalAPagar; // se captura antes de limpiar la selección
    this.registrandoPago = true;
 
    this.httpPrestamo.Update(request).subscribe({
      next: () => {
        this.registrandoPago = false;
        alert(`Pago registrado por ${this.fmt(monto)}. ✓`);
        this.selected.clear();
        this.buscar(); // refresca el préstamo
      },
      error: () => {
        this.registrandoPago = false;
        alert('Ocurrió un error al registrar el pago. Intenta nuevamente.');
      },
    });
  }


 readonly texto = signal('');
 readonly abierto = signal(false);
 readonly indiceActivo = signal(0);
 readonly seleccionado = signal<ToPrestamo| null>(null);

 readonly filtrados = computed(() =>{

 });

 onInput(valor :string):void{
  this.texto.set(valor);
  this.abierto.set(true);
  this.indiceActivo.set(0);
  this.seleccionado.set(null);
 }
seleccionar(toPrestamo:ToPrestamo):void {
  this.texto.set(toPrestamo.nroDocumento);
  this.seleccionado.set(toPrestamo);
  this.abierto.set(false);
}
 cerrar():void {
  this.abierto.set(false);
 }

  //  onKeydown(e: KeyboardEvent): void {
  //   const lista = this.filtrados();
  //   if (!lista.length) return;

  //   if (e.key === 'ArrowDown') {
  //     e.preventDefault();
  //     this.abierto.set(true);
  //     this.indiceActivo.update((i) => Math.min(i + 1, lista.length - 1));
  //   } else if (e.key === 'ArrowUp') {
  //     e.preventDefault();
  //     this.indiceActivo.update((i) => Math.max(i - 1, 0));
  //   } else if (e.key === 'Enter' && this.abierto()) {
  //     e.preventDefault();
  //     this.seleccionar(lista[this.indiceActivo()]);
  //   } else if (e.key === 'Escape') {
  //     this.abierto.set(false);
  //   }
  // }
}