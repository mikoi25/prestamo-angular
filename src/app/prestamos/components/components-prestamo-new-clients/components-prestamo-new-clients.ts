import { Component, effect, inject, linkedSignal, signal} from '@angular/core';
import { SearchInput } from "../../../shared/components/search-input/search-input";
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService } from '../../../customers/services/customers.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { prestamoServiceV2 } from '../../services/prestamo_v2.service';

@Component({
  selector: 'components-prestamo-new-clients',
  imports: [SearchInput, FormField],
  templateUrl: './components-prestamo-new-clients.html',
  styles: `

  `,
})
export class ComponentsPrestamoNewClients {
  private activatedRoute = inject(ActivatedRoute);
 private router = inject(Router);
 private customerService = inject(CustomersService);
 private prestamoService = inject(prestamoServiceV2)

constructor() {

    effect(() => {
      console.log('Effect ejecutado');

      const customer = this.customerResource.value();
      console.log('Customer:', customer);

      if (!customer) return;

      const { clientId, ...item } = customer;
   
      console.log('Antes del set');
      this.registrationModel.set(item);
      console.log('Después del set');
      
      this.prestamoService.setClientId(clientId);
    });
   
    effect(() => {
      console.log('registrationModel cambió', this.registrationModel());
    });

 
  }
private queryParam = this.activatedRoute.snapshot.queryParamMap.get('query') ?? '';
query = linkedSignal(() => this.queryParam);
registrationModel =signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
});
  customerForm = form(this.registrationModel, (schemaPath) => {
      disabled(schemaPath.firstName),
      disabled(schemaPath.lastName),
      disabled(schemaPath.email),
      disabled(schemaPath.phone)
  });


  customerResource = rxResource({
  params: () =>({ query :this.query()}),
  stream: ({params})  =>{
      if (!params.query) return of(undefined);

       this.router.navigate(['/prestamo/new'], {
        queryParams: {
          query: params.query,
        },
      });

    return this.customerService.searchNroDocumentoCustomer(params.query);
  },
})
}
