import { Component, inject, signal } from '@angular/core';
import { form, required, FormField } from '@angular/forms/signals'

import { FormaPago, PrestamoMoneda } from '../../interfaces/prestamo.interface';
import { prestamoServiceV2 } from '../../services/prestamo_v2.service';

@Component({
  selector: 'components-prestamo-new-detalle',
  imports: [ FormField],
  templateUrl: './components-prestamo-new-detalle.html',
  styles: ``,
})
export class ComponentsPrestamoNewDetalle {
  prestamoService = inject(prestamoServiceV2);
   registrationModel = signal({
     Moneda:PrestamoMoneda.Euros,
     FechaInicioPago: '',
     MontoPrestamo:0,
     InteresPorcentaje:0,
     NroCuotas:1,
     FormaDePago: FormaPago.Diario

   })
  
   protected readonly PrestamoMoneda = PrestamoMoneda;
   prestamoForm = form(this.registrationModel , (schemaPath) => {
    required(schemaPath.Moneda, { message: 'Requiere ingresar moneda'});
    required(schemaPath.FechaInicioPago, { message: 'Requiere ingresar fecha inicio de pago'});
    required(schemaPath.MontoPrestamo, { message: 'Requiere ingresar monto prestamo'});
    required(schemaPath.InteresPorcentaje, { message: 'Requiere ingresar el interes del prestamo'});
    required(schemaPath.NroCuotas, { message: 'Requiere ingresar las cuotas'});
    required(schemaPath.FormaDePago, { message: 'Requiere forma de pago si es dia,mensual o anual'});
   })
  

  calcular() {
    const prestamo = this.registrationModel();

    if (!prestamo ) return;

    this.prestamoService.updatePrestamo({
        ...prestamo
    });
    const cuotas = this.prestamoService.generarCuotas();
    this.prestamoService.setCuotas(cuotas);
  }
 
}