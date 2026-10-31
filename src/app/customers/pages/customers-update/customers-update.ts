import { Component,effect,inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CustomersService } from '../../services/customers.service';
import { CustomerCreationItem, CustomerItem } from '../../interfaces/customers.interface';
import { switchMap } from 'rxjs';
import { form, FormField, required } from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'customers-update',
  imports: [FormField , JsonPipe],
  templateUrl: './customers-update.html',
  styles: ``,
})
export class CustomersUpdate {
  private router = inject(Router);
  private customerService = inject(CustomersService);
  private route = inject(ActivatedRoute);

   constructor() {

    effect(() => {
      console.log('Effect ejecutado');

      const customer = this.customer();
      console.log('Customer:', customer);

      if (!customer) return;

      const { clientId, ...item } = customer;

      console.log('Antes del set');
      this.registrationModel.set(item);
      console.log('Después del set');
    });
   
    effect(() => {
      console.log('registrationModel cambió', this.registrationModel());
    });
  }

  private customer = toSignal(
    this.route.params.pipe(
      switchMap(({ id }) => this.customerService.customersById(id))
    )
  );


   registrationModel = signal<CustomerCreationItem>({
    nroDocumento: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  //formulario 
  customerForm = form(this.registrationModel, (schemaPath) => {
    required(schemaPath.nroDocumento, { message: 'nroDocumento es requerido.' }),
      required(schemaPath.firstName, { message: 'firstName es requerido.' }),
      required(schemaPath.lastName, { message: 'lastName es requerido.' }),
      required(schemaPath.email, { message: 'email es requerido.' }),
      required(schemaPath.phone, { message: 'phone es requerido.' })
  });

 
    save() {

    const client = this.customer();

    if (!client) {
      return;
    }
    if (!this.customerForm().valid()) {
      return;
    }

    const customer: CustomerItem = {
      clientId: client.clientId,
      ...this.registrationModel()
    };

    if (!customer) {
      return;
    }

    this.customerService.update(customer).subscribe({
      next: () => {
        this.router.navigate(['/customers/list']);
      },
      error: (err) => {
        console.error(err);
        alert('No fue posible registrar el cliente.');
      }
    });
  }
}
