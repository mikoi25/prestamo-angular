import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService } from '../../../customers/services/customers.service';
import { prestamoServiceV2 } from '../../services/prestamo_v2.service';
import { form, disabled, FormField, required } from '@angular/forms/signals';
import {  takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormaPago, PrestamoMoneda } from '../../interfaces/prestamo.interface';
import { httpPrestamoService } from '../../services/http_prestamo.service';



@Component({
  selector: 'prestamo-new',
  imports: [FormField],
  templateUrl: './prestamo-new.html',
  styleUrl: './prestamo-new.css'
})
export class PrestamoNew {
private readonly activatedRoute = inject(ActivatedRoute);
private readonly router = inject(Router);
private readonly customerService = inject(CustomersService);
private readonly destroyRef = inject(DestroyRef); // nuevo: para cancelar subscripciones al destruir el componente

readonly prestamoService = inject(prestamoServiceV2);
readonly prestService = inject(httpPrestamoService);

readonly searchTerm = signal('');
readonly buscandoCliente = signal(false);
readonly clienteNoEncontrado = signal(false);
readonly registrando = signal(false);
readonly errorRegistro = signal<string | null>(null); // nuevo: para mostrar el error en el template

readonly formaPagoOptions = [
  { label: 'Diario', value: FormaPago.Diario },
  { label: 'Semanal', value: FormaPago.Semanal },
  { label: 'Quincenal', value: FormaPago.Quincenal },
  { label: 'Mensual', value: FormaPago.Mensual }
];

readonly registrationModelCustomer = signal({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
});

readonly customerForm = form(this.registrationModelCustomer, (schemaPath) => {
  // ANTES: estas 4 líneas estaban separadas por comas en vez de punto y coma,
  // lo que las convertía en UNA sola sentencia (operador coma). Funcionaba
  // "por casualidad" porque cada llamada igual se ejecuta de izquierda a
  // derecha, pero es fácil que alguien borre una línea del medio sin darse
  // cuenta de que rompe la sintaxis. Separado explícitamente:
  disabled(schemaPath.firstName);
  disabled(schemaPath.lastName);
  disabled(schemaPath.email);
  disabled(schemaPath.phone);
});

readonly registrationModelPrestamoDetalle = signal({
  Moneda: PrestamoMoneda.Euros,
  FechaInicioPago: '',
  MontoPrestamo: 0,
  InteresPorcentaje: 0,
  NroCuotas: 1,
  FormaDePago: FormaPago.Diario
});

readonly prestamoForm = form(this.registrationModelPrestamoDetalle, (schemaPath) => {
  required(schemaPath.Moneda, { message: 'Requiere ingresar moneda' });
  required(schemaPath.FechaInicioPago, { message: 'Requiere ingresar fecha inicio de pago' });
  required(schemaPath.MontoPrestamo, { message: 'Requiere ingresar monto prestamo' });
  required(schemaPath.InteresPorcentaje, { message: 'Requiere ingresar el interes del prestamo' });
  required(schemaPath.NroCuotas, { message: 'Requiere ingresar las cuotas' });
  required(schemaPath.FormaDePago, { message: 'Requiere forma de pago si es dia, mensual o anual' });
});

buscarCliente(): void {
  const doc = this.formatearRut(this.searchTerm().trim());
  if (!doc) { return; }

  this.buscandoCliente.set(true);
  this.clienteNoEncontrado.set(false);

  // Limpiar el formulario ANTES de buscar, para que no quede pintado
  // el cliente anterior mientras esperamos la respuesta (o si esta falla).
  this.registrationModelCustomer.set({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  this.customerService.searchNroDocumentoCustomer(doc)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (client) => {
        const { clientId, ...item } = client;
        this.buscandoCliente.set(false);
        this.registrationModelCustomer.set(item);
        this.prestamoService.setClientId(clientId);
      },
      error: () => {
        this.clienteNoEncontrado.set(true);
        this.buscandoCliente.set(false);
        // El modelo ya quedó vacío arriba, así que no hace falta limpiar de nuevo acá.
      }
    });
}

calcular(): void {
  const prestamo = this.registrationModelPrestamoDetalle();
  if (!prestamo) { return; }

  this.prestamoService.updatePrestamo({ ...prestamo });
  const cuotas = this.prestamoService.generarCuotas();
  this.prestamoService.setCuotas(cuotas);
}

registrar(): void {
  // ANTES: declarabas la signal "registrando" pero nunca la usabas — el botón
  // de registrar no tenía forma de saber que la petición estaba en curso
  // (podían hacer doble clic y disparar dos registros).
  this.registrando.set(true);
  this.errorRegistro.set(null);

  this.prestService.newPrestamo(this.prestamoService.prestamo())
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.registrando.set(false);
        this.router.navigateByUrl('/prestamo/list');
      },
      error: () => {
        // ANTES: en error navegaba a '/prestamo/new', es decir, recargaba el
        // mismo formulario vacío sin explicarle al usuario qué pasó — perdía
        // todo lo que había llenado. Ahora se queda en la pantalla actual y
        // expone el error mediante una signal para mostrarlo en el template.
        this.registrando.set(false);
        this.errorRegistro.set('Ocurrió un error al registrar el préstamo. Intenta nuevamente.');
      }
    });
}

actualizarState(e: Event): void {
  const input = e.target as HTMLInputElement;
  if (input.validity.valid) {
    this.searchTerm.set(input.value);
  } else {
    input.value = this.searchTerm();
  }
}

fmt(n: number): string {
  return n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

private formatearRut(rut: string): string {
  const limpio = rut.replace(/[^0-9kK]/g, '');
  if (limpio.length < 2) { return limpio; }

  const dv = limpio.substring(limpio.length - 1);
  const cuerpo = limpio.substring(0, limpio.length - 1);

  let rutFormateado = '';
  let i = 0;
  let j = cuerpo.length;

  while (i < cuerpo.length) {
    rutFormateado = cuerpo.charAt(j - 1) + rutFormateado;
    i++;
    if (i % 3 === 0 && i < cuerpo.length) {
      rutFormateado = '.' + rutFormateado;
    }
    j--;
  }

  return `${rutFormateado}-${dv.toUpperCase()}`;
}
}
