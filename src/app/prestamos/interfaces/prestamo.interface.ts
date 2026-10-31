export interface Prestamo {
      hasItems: boolean;
      items:    PrestamoItem[];
      total:    number;
      page:     number;
      pages:    number;
}

export interface PrestamoItem{
     prestamoId:number;
     clientId:number;
     moneda:PrestamoMoneda;
     fechaInicioPago:string;
     montoPrestamo:number;
     interesPorcentaje:number;
     nroCuotas:number;
     formaDePago:string;
     valorPorCuota:number;
     valorInteres:number;
     valorTotal:number;
     estado:PrestamoEstado;
     fechaCreacion:string;
     items:PrestamoItemDetail[];

}

export interface PrestamoItemDetail{
    prestamoDetailId:number;
    fechaPago:string;
    nroCuota:number;
    montoCuota:number;
    estado:PrestamoEstado;
    fechaPagado:string  |  null;
}

export enum PrestamoEstado {
    Pendiente,
    Pagado
}

export enum PrestamoMoneda {
    Soles = 'Soles',
    Dolares ='Dolares',
    Euros ='Euros'
}

export interface PrestamoCreation{
  ClientId:number;
  Moneda:PrestamoMoneda;
  FechaInicioPago:string;
  MontoPrestamo:number;
  InteresPorcentaje:number;
  NroCuotas:number;
  FormaDePago:FormaPago;    
  Items:PrestamoDetailCreation[];
}

export interface PrestamoDetailCreation{
    FechaPago:string;
    NroCuota:number;
    MontoCuota:number;
}



export enum FormaPago {
  Diario = 'Diario',
  Semanal = 'Semanal',
  Mensual = 'Mensual',
  Quincenal = 'Quincenal',

}