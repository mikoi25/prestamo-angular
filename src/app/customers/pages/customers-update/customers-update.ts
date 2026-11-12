import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CustomersService } from '../../services/customers.service';
import { switchMap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rutValidator } from '../../util/rut.validator';
import { formatearRut, limpiarRut } from '../../../utils/rut.util';

@Component({
  selector: 'customers-update',
  imports: [ReactiveFormsModule],
  templateUrl: './customers-update.html',
  styles: `
    .page-head{ padding:2.25rem 0 1.25rem; }
.page-head h1{ font-size:1.9rem; font-weight:700; }
.toolbar-top{ margin-bottom:1.5rem; }
.table-wrap{ overflow-x:auto; }
.footer-row{
  display:flex; justify-content:space-between; align-items:center;
  margin-top:1.25rem; flex-wrap:wrap; gap:0.75rem;
}
.results-count{ font-family:'JetBrains Mono', monospace; font-size:0.8rem; color:var(--muted); }
  `,
})
export class CustomersUpdate implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private customerService = inject(CustomersService);
  private route = inject(ActivatedRoute);
  private timeoutId?: ReturnType<typeof setTimeout>;

  guardando = signal(false);

  exito = signal('');

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  private customer = toSignal(
    this.route.params.pipe(
      switchMap(({ id }) => this.customerService.customersById(id))
    )
  );


  form = this.fb.nonNullable.group({
    nroDocumento: ['', [Validators.required, rutValidator]],
    firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    phone: ['', [Validators.pattern(/^\+?[0-9 ]{8,15}$/)]],
    email: ['', [Validators.email]],
  });
  constructor() {
    effect(() => {
      const customer = this.customer();

      if (!customer) return;

      this.form.patchValue({
        nroDocumento: customer.nroDocumento,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone
      });
    });
  }

  get f() { return this.form.controls; }

  onRutInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    const formateado = formatearRut(limpiarRut(input.value).slice(0, 9)); // máx. 8 dígitos + DV
    input.value = formateado;
    this.f.nroDocumento.setValue(formateado);

    this.exito.set('');
  }

  save() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const customer = this.customer();

    this.guardando.set(true);

    this.exito.set('');


    if (!customer) return;

    const data = {
      ...this.form.getRawValue(),
      clientId: customer.clientId
    };

    this.customerService.update(data).subscribe({
      next: () => {
        this.guardando.set(false);
        this.exito.set('Cliente actualizado correctamente');
        // Cancelar temporizador anterior si existe
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }

        // Esperar 3 segundos y redirigir
        this.timeoutId = setTimeout(() => {
          this.router.navigate(['/customers/list']);
        }, 500);




      },
      error: (err) => {
        this.guardando.set(false);
        console.error(err);
        alert('No fue posible registrar el cliente.');
      }
    });
  }
}
