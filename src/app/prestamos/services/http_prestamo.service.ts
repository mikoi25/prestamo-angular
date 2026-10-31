import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Prestamo, PrestamoCreation, PrestamoItem } from '../interfaces/prestamo.interface';
import {  map, Observable, switchMap, tap } from 'rxjs';
import { CustomerItem } from '../../customers/interfaces/customers.interface';
import {  PrestamoMapper, ToPrestamo } from '../mappers/prestamo.mapper';
import { CustomersService } from '../../customers/services/customers.service';
import { PagedResponse } from '../../shared/service/paginacion.service';
const baseUrl = environment;
@Injectable({providedIn: 'root'})
export class httpPrestamoService {
    private _http = inject(HttpClient);
    private mapper = inject(PrestamoMapper);
    private customerService = inject(CustomersService);

   getAll(page?:number ,take?:number){
    return  this._http.get<Prestamo>(`${baseUrl.PrestamoUrl}v1/prestamo`, {
      params: {
        page: page!,
        take: take!
      },
    })
   }

   getById( IdPrestamo:number){
     return this._http.get<PrestamoItem>(`${baseUrl.PrestamoUrl}v1/prestamo/${IdPrestamo}`)
   }

   newPrestamo(prestamo:PrestamoCreation){
    return this._http.post(`${baseUrl.PrestamoUrl}v1/prestamo`,prestamo)
   }
   Update(prestamo:any){
     return this._http.patch(
        `${baseUrl.PrestamoUrl}v1/prestamo/${prestamo.prestamoId}`,
        prestamo
      );
   }

   Delete(IdPrestamo:number){
     return this._http.delete<PrestamoItem>(`${baseUrl.PrestamoUrl}v1/prestamo/${IdPrestamo}`)
   }


   getPrestamoById( nroDocumento: string):Observable<ToPrestamo> {
    return this._http.get<CustomerItem>(`${baseUrl.CustomerUrl}v1/clients/SearchNroDocumento/${nroDocumento}`).pipe(
       switchMap(customer => this.getById(customer.clientId).pipe(
         map(prestamo => ({
           ...this.mapper.toPrestamo(prestamo),
           name: `${customer.firstName} ${customer.lastName}`,
           nroDocumento: customer.nroDocumento,
         })),
         tap(res => console.log(res))
       )
       )
     );
   }

   getAllPrestamosConNombre(page: number, perPage: number): Observable<PagedResponse<ToPrestamo>> {
  // Traemos TODOS los clientes de una vez (solo para el cruce por clientId,
  // no para paginarlos) — evita el desfase de páginas del Bug 2.
  return this.customerService.GetAll(1, 100).pipe(
    switchMap((customersPage) => {
      const customerList = customersPage.items ?? [];

      return this.getAll(page, perPage).pipe(
        map((prestamosPage) => {
          const prestamoList = prestamosPage.items ?? [];

          const items = prestamoList.map((prestamo) => {
            const customer = customerList.find((c) => c.clientId === prestamo.clientId);
            const name = customer ? `${customer.firstName} ${customer.lastName}` : '';
            const nroDocumento = customer ? customer.nroDocumento : '';
            return {
              ...this.mapper.toPrestamo(prestamo),
              name:name,
              nroDocumento:nroDocumento,
            }
          });

          // Fix Bug 1: devolvemos el mismo shape PagedResponse que espera
          // el consumidor, usando la paginación de PRÉSTAMOS (es la fuente
          // que realmente se está paginando; customers solo se usa como lookup).
          return {
            items,
            page: prestamosPage.page,
            pages: prestamosPage.pages,
            total: prestamosPage.total,
            hasItems: prestamosPage.hasItems,
          };
        })
      );
    })
  );
}



}