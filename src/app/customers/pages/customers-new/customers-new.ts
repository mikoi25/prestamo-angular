import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CustomersService } from '../../services/customers.service';
import { form, FormField, required } from '@angular/forms/signals';
import { CustomerCreationItem } from '../../interfaces/customers.interface';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-customers-new',
  imports:[FormField,JsonPipe],
  templateUrl: './customers-new.html',
  styles: ``,
})
export class CustomersNew {
 private router = inject(Router);
 private customerService = inject(CustomersService);
  registrationModel =signal<CustomerCreationItem>({
    nroDocumento: '',
    firstName: '' ,
    lastName : '',
    email: '',
    phone: ''
  })
  //formulario 
  customerForm = form(this.registrationModel ,(schemaPath) =>{
    required(schemaPath.nroDocumento ,{message : 'nroDocumento es requerido.'}),
    required(schemaPath.firstName,{message : 'firstName es requerido.'}),
    required(schemaPath.lastName,{message : 'lastName es requerido.'}),
    required(schemaPath.email,{message : 'email es requerido.'}),
    required(schemaPath.phone,{message : 'phone es requerido.'})
  });

  save() {
    if(!this.customerForm().valid()) return;

    this.customerService.newCustomers(this.registrationModel()).subscribe({
      next: () => this.router.navigate(['/customers/list']),
      error: (err) => console.error(err)
    });
  }
}
