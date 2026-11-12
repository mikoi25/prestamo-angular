import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomersService } from '../../services/customers.service';
import { rutValidator } from '../../util/rut.validator';
import { formatearRut, limpiarRut } from '../../../utils/rut.util';

@Component({
  selector: 'app-customers-new',
  imports:[ReactiveFormsModule],
  templateUrl: './customers-new.html',
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
export class CustomersNew {

   private fb = inject(FormBuilder);
  private httpCliente = inject(CustomersService);
 
  guardando = signal(false);
  errorServidor = signal('');
  exito = signal('');
 
  form = this.fb.nonNullable.group({
    nroDocumento: ['', [Validators.required, rutValidator]],
    firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    phone: ['', [Validators.pattern(/^\+?[0-9 ]{8,15}$/)]],
    email: ['', [Validators.email]],
  });
 
  get f() { return this.form.controls; }
 
  /** Formatea el RUT mientras el usuario escribe (12.345.678-5). */
  onRutInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    const formateado = formatearRut(limpiarRut(input.value).slice(0, 9)); // máx. 8 dígitos + DV
    input.value = formateado;
    this.f.nroDocumento.setValue(formateado);
    this.errorServidor.set('');
    this.exito.set('');
  }
 
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    const { nroDocumento, firstName,lastName, phone, email } = this.form.getRawValue();
 
    this.guardando.set(true);
    this.errorServidor.set('');
    this.exito.set('');
 
    this.httpCliente.newCustomers({
      nroDocumento: formatearRut(nroDocumento),          // siempre el mismo formato guardado
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() ,
      email: email.trim() ,
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.exito.set('Cliente creado correctamente. ✓');
        this.form.reset();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorServidor.set(
          err.status === 409
            ? 'Ya existe un cliente con ese RUT.'
            : 'No se pudo crear el cliente. Intenta nuevamente.'
        );
      },
    });
  }

}