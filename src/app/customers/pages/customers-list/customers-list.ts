import { Component, inject} from '@angular/core';

import { RouterLink } from "@angular/router";
import { CustomersService } from '../../services/customers.service';
import { CustomerItem } from '../../interfaces/customers.interface';

import { createPagedSearch } from '../../../shared/service/paginacion.service';
import { SharedPagination } from '../../../shared/page/shared-pagination/shared-pagination';

@Component({
  selector: 'app-customers-list',
  
  imports: [RouterLink,SharedPagination ],
  templateUrl: './customers-list.html',
 styleUrl : './customers-list.css'
})
export class CustomersList {
  private customersService = inject(CustomersService);
  readonly search = createPagedSearch<CustomerItem>({
    fetchPage: (page, perPage) => this.customersService.GetAll(page, perPage),
    matches: (c, term) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
      String(c.nroDocumento).includes(term),
    initialPerPage: 5,
  });


}














