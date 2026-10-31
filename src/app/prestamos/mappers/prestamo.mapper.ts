import { Injectable } from "@angular/core";
import { PrestamoItem } from "../interfaces/prestamo.interface";

export interface ToPrestamo {
  prestamoId: number;
  name: string;
  nroDocumento:string;
  montoPrestamo: number;
  interes: number;
  nroCuotas: number;
  montoCuotas: number;
  montoTotal: number;
  formaDePago: string;
  moneda: string;
  estado:number;
  items: Cuota[];
}

export interface Cuota {
  nroCuota: number;
  fechaPago: string;
  montoCuota: number;
  estado: number;
  fechaPagado: string | null;
}

@Injectable({ providedIn: 'root' })
export class PrestamoMapper {

  toPrestamo(item: PrestamoItem ): ToPrestamo {
    return {
      prestamoId: item.prestamoId,
      name: '', // Se completa desde Customer
      nroDocumento: '',
      montoPrestamo: item.montoPrestamo,
      interes: item.interesPorcentaje,
      nroCuotas: item.nroCuotas,
      montoCuotas: item.valorPorCuota,
      montoTotal: item.valorTotal,
      formaDePago: (item.formaDePago),
      moneda: item.moneda,
      estado:item.estado,
      items: item.items.map(this.toCuota)
    };
  }

  private toCuota(detail: PrestamoItem['items'][number]): Cuota {

    return {
      nroCuota: detail.nroCuota,
      fechaPago:detail.fechaPago,
      montoCuota: detail.montoCuota,
      estado: detail.estado,
      fechaPagado: detail.fechaPagado
        ? detail.fechaPagado
        : null
    };
  }
}