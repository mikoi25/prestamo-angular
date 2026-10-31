import { Component, inject } from '@angular/core';
import { httpPrestamoService } from '../../services/http_prestamo.service';
import { RouterLink } from '@angular/router';
import { SharedPagination } from '../../../shared/page/shared-pagination/shared-pagination';
import { createPagedSearch } from '../../../shared/service/paginacion.service';
import { ToPrestamo } from '../../mappers/prestamo.mapper';

@Component({
  selector: 'prestamo-list',
  imports: [RouterLink, SharedPagination],
  templateUrl: './prestamo-list.html',
  styleUrl: './prestamo-list.css'
})
export class PrestamoList {

  private prestamoHttp = inject(httpPrestamoService);

  readonly search = createPagedSearch<ToPrestamo>({
    fetchPage: (page, perPage) => this.prestamoHttp.getAllPrestamosConNombre(page, perPage),
    matches: (c, term) =>
      ` ${c.name}`.toLowerCase().includes(term) ||
      String(c.prestamoId).includes(term),
    initialPerPage: 5,
  });

  fmt(n: number): string {
    return n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}