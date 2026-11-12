import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
// Ajusta estas rutas a tu proyecto
import { CustomersService } from '../../customers/services/customers.service';
import { CustomerItem } from '../../customers/interfaces/customers.interface';

@Component({
  selector: 'app-buscador-documento',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card-kodoti">
      <div class="panel-head">
        <span class="eyebrow">Búsqueda</span>
        <span>Consultar por documento</span>
      </div>

      <div class="panel-body">
        <label class="form-label-kodoti" for="doc">Nro. Documento</label>

        <div class="autocomplete">
          <input
            id="doc"
            type="text"
            class="form-control-kodoti mono"
            autocomplete="off"
            [placeholder]="cargando() ? 'Cargando clientes...' : 'Escribe el nro de documento...'"
            [disabled]="cargando()"
            [value]="texto()"
            (input)="onInput($any($event.target).value)"
            (focus)="abierto.set(true)"
            (blur)="cerrar()"
            (keydown)="onKeydown($event)"
          />

          @if (abierto() && filtrados().length > 0) {
            <ul class="opciones" role="listbox">
              @for (c of filtrados(); track c.clientId; let i = $index) {
                <li
                  role="option"
                  [class.activo]="i === indiceActivo()"
                  (mousedown)="seleccionar(c)"
                  (mouseenter)="indiceActivo.set(i)"
                >
                  <span class="doc mono">{{ c.nroDocumento }}</span>
                  <span class="nombre">{{ c.firstName }} {{ c.lastName }}</span>
                </li>
              }
            </ul>
          }

          @if (abierto() && texto() && filtrados().length === 0) {
            <div class="sin-resultados mono">Sin resultados</div>
          }
        </div>

        @if (seleccionado(); as c) {
          <div class="datos">
            <div class="dato">
              <span class="form-label-kodoti">Nro. Documento</span>
              <span class="valor mono">{{ c.nroDocumento }}</span>
            </div>
            <div class="dato">
              <span class="form-label-kodoti">Id Cliente</span>
              <span class="valor mono">{{ c.clientId }}</span>
            </div>
            <div class="dato">
              <span class="form-label-kodoti">Nombre</span>
              <span class="valor">{{ c.firstName }}</span>
            </div>
            <div class="dato">
              <span class="form-label-kodoti">Apellido</span>
              <span class="valor">{{ c.lastName }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; max-width: 440px; }

    .autocomplete { position: relative; }

    .opciones {
      position: absolute; z-index: 20; left: 0; right: 0;
      margin: 4px 0 0; padding: 0.3rem; list-style: none;
      max-height: 230px; overflow-y: auto;
      background: var(--surface-2);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
    }
    .opciones li {
      display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;
      padding: 0.55rem 0.7rem;
      border-radius: 6px;
      cursor: pointer;
      border-left: 2px solid transparent;
      transition: background .12s ease;
    }
    .opciones li.activo {
      background: var(--teal-soft);
      border-left-color: var(--teal);
    }
    .doc { color: var(--ink); font-weight: 600; font-size: 0.9rem; }
    .nombre { color: var(--muted); font-size: 0.85rem; }

    .sin-resultados {
      position: absolute; z-index: 20; left: 0; right: 0; margin-top: 4px;
      padding: 0.7rem 0.85rem;
      background: var(--surface-2);
      border: 1px solid var(--line);
      border-radius: 8px;
      color: var(--muted);
      font-size: 0.8rem;
    }

    .datos {
      margin-top: 1.4rem;
      padding-top: 1.2rem;
      border-top: 1px solid var(--line);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem 1.25rem;
    }
    .dato { display: flex; flex-direction: column; }
    .valor { color: var(--ink); font-size: 0.95rem; }
  `,
})
export class BuscadorDocumentoComponent {
  private readonly customersService = inject(CustomersService);

  // UNA sola petición: se ejecuta al crear el componente y queda en memoria.
  // null = todavía cargando.
  private readonly respuesta = toSignal(
    this.customersService.GetAll(1, 100).pipe(
      catchError(() => of({ items: [] as CustomerItem[] })),
    ),
    { initialValue: null },
  );

  readonly clientes = computed<CustomerItem[]>(() => this.respuesta()?.items ?? []);
  readonly cargando = computed(() => this.respuesta() === null);

  readonly texto = signal('');
  readonly abierto = signal(false);
  readonly indiceActivo = signal(0);
  readonly seleccionado = signal<CustomerItem | null>(null);

  // Filtra en memoria por prefijo del nroDocumento
  readonly filtrados = computed(() => {
    const t = this.texto().trim();
    if (!t) return this.clientes();
    return this.clientes().filter((c) => c.nroDocumento.startsWith(t));
  });

  onInput(valor: string): void {
    this.texto.set(valor);
    this.abierto.set(true);
    this.indiceActivo.set(0);
    this.seleccionado.set(null);
  }

  seleccionar(c: CustomerItem): void {
    this.texto.set(c.nroDocumento);
    this.seleccionado.set(c);
    this.abierto.set(false);
  }

  cerrar(): void {
    this.abierto.set(false);
  }

  onKeydown(e: KeyboardEvent): void {
    const lista = this.filtrados();
    if (!lista.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.abierto.set(true);
      this.indiceActivo.update((i) => Math.min(i + 1, lista.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.indiceActivo.update((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && this.abierto()) {
      e.preventDefault();
      this.seleccionar(lista[this.indiceActivo()]);
    } else if (e.key === 'Escape') {
      this.abierto.set(false);
    }
  }
}