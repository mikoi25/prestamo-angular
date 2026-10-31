import { effect, Injectable, signal } from '@angular/core';
import { FormaPago, PrestamoCreation, PrestamoMoneda } from '../interfaces/prestamo.interface';

const INITIAL_PRESTAMO: PrestamoCreation = {
  ClientId: 0,
  Moneda: PrestamoMoneda.Dolares,
  FechaInicioPago: '',
  MontoPrestamo: 0,
  InteresPorcentaje: 0,
  NroCuotas: 0,
  FormaDePago: FormaPago.Diario,
  Items: []
};

@Injectable({ providedIn: 'root' })
export class PrestamoStorageService {

  private readonly STORAGE_KEY = 'prestamo';

  readonly prestamoSignal = signal<PrestamoCreation>(this.load());


  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.prestamoSignal()));
    });
  }

  private load(): PrestamoCreation {
    const saved = localStorage.getItem(this.STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved) as PrestamoCreation;
      } catch {
        console.warn("Error leyendo el prestamo.Reiniciando...");
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }


    return structuredClone(INITIAL_PRESTAMO);
  }


  clear() {

    this.prestamoSignal.set(structuredClone(INITIAL_PRESTAMO));
    localStorage.removeItem(this.STORAGE_KEY);
  }
}