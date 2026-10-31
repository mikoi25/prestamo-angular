import { computed, inject, Injectable } from '@angular/core';
import { PrestamoStorageService } from './prestamo_storage.service';
import { FormaPago, PrestamoCreation, PrestamoDetailCreation, PrestamoEstado } from '../interfaces/prestamo.interface';

@Injectable({ providedIn: 'root' })
export class prestamoServiceV2 {
    private prestamoStorage = inject(PrestamoStorageService);
    readonly prestamo = computed(() => this.prestamoStorage.prestamoSignal())

    updatePrestamo(data: Partial<PrestamoCreation>) {
        this.prestamoStorage.prestamoSignal.update(prestamo => ({
            ...prestamo,
            ...data
        }));
    }

    agregarCuota(cuota: PrestamoDetailCreation) {
        this.prestamoStorage.prestamoSignal.update(prestamo => {
            if (!prestamo) return prestamo;

            return {
                ...prestamo,
                Items: [...prestamo.Items, cuota]
            }
        })
    }
    setCuotas(items: PrestamoDetailCreation[]) {
        this.prestamoStorage.prestamoSignal.update(prestamo => ({
            ...prestamo,
            Items: items
        }));
    }
    eliminarCuota(NroCuota: number) {

        this.prestamoStorage.prestamoSignal.update(prestamo => {

            if (!prestamo) return prestamo;

            return {
                ...prestamo,
                Items: prestamo.Items.filter(
                    item => item.NroCuota !== NroCuota
                )
            };
        });
    }

    pagarCuota(NroCuota: number) {
        this.prestamoStorage.prestamoSignal.update(prestamo => {
            if (!prestamo) return prestamo;

            return {
                ...prestamo,
                Items: prestamo.Items.map(item => {

                    if (item.NroCuota !== NroCuota) {
                        return item;
                    }

                    return {
                        ...item,
                        Estado: PrestamoEstado.Pagado,
                        FechaPagado: new Date().toISOString()
                    }
                })
            }
        })
    }

    valorInteres = computed(() => {
        const { MontoPrestamo, InteresPorcentaje } = this.prestamo();

        return Number(MontoPrestamo) * (Number(InteresPorcentaje) / 100);
    });

    valorTotal = computed(() => {
        const { MontoPrestamo } = this.prestamo();

        return Number(MontoPrestamo) + this.valorInteres();
    });

    valorPorCuota = computed(() => {
        const { NroCuotas } = this.prestamo();

        return NroCuotas > 0
            ? this.valorTotal() / NroCuotas
            : 0;
    });

    generarCuotas() {
        const items: PrestamoDetailCreation[] = [];
        const [year, month, day] = this.prestamo().FechaInicioPago
            .split('T')[0]
            .split('-')
            .map(Number);

        const fechaInicio = new Date(year, month - 1, day);

        for (
            let i = 1; i <= this.prestamo().NroCuotas; i++
        ) {


            items.push({
                NroCuota: i,
                FechaPago: this.calcularFechaPago(
                    fechaInicio,
                    i,
                    this.prestamo().FormaDePago as FormaPago
                ),
                MontoCuota: this.valorPorCuota()
            })


        }

        return items;
    }

    private calcularFechaPago(
        fechaInicio: Date,
        nroCuota: number,
        formaPago: FormaPago
    ): string {

        const fecha = new Date(fechaInicio);

        switch (formaPago) {

            case FormaPago.Diario:
                fecha.setDate(fecha.getDate() + (nroCuota - 1));
                break;

            case FormaPago.Semanal:
                fecha.setDate(fecha.getDate() + ((nroCuota - 1) * 7));
                break;
            case FormaPago.Quincenal:
            fecha.setDate(fecha.getDate() + (nroCuota - 1) * 15);
            break;
            case FormaPago.Mensual:
                fecha.setMonth(fecha.getMonth() + (nroCuota - 1));
                break;
        }
        const fechaFormateada = [
            fecha.getDate().toString().padStart(2, '0'),
            (fecha.getMonth() + 1).toString().padStart(2, '0'),
            fecha.getFullYear()
        ].join('/');
        return fechaFormateada.toString();
    }

    //pendiente , para eliminar  @input , @output
    setClientId(ClientId:number){
        this.prestamoStorage.prestamoSignal.update(state => ({
            ...state,
             ClientId:ClientId
        }))
    }
   
  
}




