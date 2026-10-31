/** Quita todo lo que no sea dígito o K y deja la K en mayúscula. */
export function limpiarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/** Separa cuerpo (solo dígitos) y dígito verificador. */
export function separarRut(rut: string): { cuerpo: string; dv: string } {
  const limpio = limpiarRut(rut);
  return {
    cuerpo: limpio.slice(0, -1).replace(/\D/g, ''), // una K en el cuerpo no es válida
    dv: limpio.slice(-1),
  };
}

/**
 * Formatea como 12.345.678-9.
 * - Funciona con cualquier largo (también mientras el usuario escribe).
 * - Mantiene la K como 'K'. Si tu backend guarda el DV K como '10',
 *   pasa { kComoDiez: true }.
 */
export function formatearRut(rut: string, opts: { kComoDiez?: boolean } = {}): string {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) { return limpio; }

  const { cuerpo, dv } = separarRut(limpio);
  const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const dvFinal = dv === 'K' && opts.kComoDiez ? '10' : dv;

  return `${cuerpoConPuntos}-${dvFinal}`;
}

/** Calcula el dígito verificador (módulo 11) de un cuerpo numérico. */
export function calcularDv(cuerpo: string): string {
  let suma = 0;
  let factor = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) { return '0'; }
  if (resto === 10) { return 'K'; }
  return String(resto);
}

/** Valida largo y dígito verificador. */
export function validarRut(rut: string): boolean {
  const { cuerpo, dv } = separarRut(rut);
  if (cuerpo.length < 7 || cuerpo.length > 8) { return false; }
  return calcularDv(cuerpo) === dv;
}
