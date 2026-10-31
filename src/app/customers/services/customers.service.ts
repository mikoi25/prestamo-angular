import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { Observable, catchError, tap, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import { Customer, CustomerCreationItem, CustomerItem } from "../interfaces/customers.interface";

@Service()
export class CustomersService {

  private http = inject(HttpClient);
  private readonly apiCustomerUrl = environment.CustomerUrl;

  GetAll(page?: number ,take?:number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiCustomerUrl + 'v1/clients'}`, {
      params: {
        page: page!,
        take: take!
      },
    }).pipe(
      tap( resp => console.log(resp))
    )
  }

  newCustomers(customer: CustomerCreationItem) {
    return this.http.post<CustomerCreationItem>(`${this.apiCustomerUrl + 'v1/clients'}`, customer)
  }

  update(customer: CustomerItem) {
    return this.http.patch(
      `${this.apiCustomerUrl}v1/clients/${customer.clientId}`,
      customer
    );
  }

  customersById(id: number) {
    return this.http.get<CustomerItem>(`${this.apiCustomerUrl}v1/clients/${id}`);
  }
  searchNroDocumentoCustomer(query: string) {
    return this.http.get<CustomerItem>(`${this.apiCustomerUrl}v1/clients/SearchNroDocumento/${query}`).pipe(

      catchError((error) => {

        return throwError(() => ({
          message: 'Error obteniendo clientes',
          original: error
        }));
      })

    );
  }

}