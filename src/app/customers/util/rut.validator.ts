import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { validarRut } from "../../utils/rut.util";

/** Valida RUT chileno completo (largo + dígito verificador módulo 11). */
export const rutValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = (control.value ?? '').toString().trim();
  if (!valor) { return null; } // el vacío lo maneja Validators.required
  return validarRut(valor) ? null : { rutInvalido: true };
};