import { Conversor } from './conversor.js';
import type { ValorMonto } from './monto.js';

export { type Conector, Conversor, type FormatoCentavos } from './conversor.js';
export { NumeroFueraDeRango, NumeroNoValido, OpcionNoValida } from './errores.js';
export { type CodigoMoneda, MONEDAS, type Moneda } from './monedas.js';
export type { ValorMonto } from './monto.js';
export { MAXIMO, type OpcionesPalabras, palabras } from './palabras.js';

const porDefecto = new Conversor();

/**
 * convertir(1250.50) → "MIL DOSCIENTOS CINCUENTA CON 50/100 SOLES"
 *
 * Con las opciones por defecto. Para cambiarlas, usa `new Conversor()`.
 */
export function convertir(monto: ValorMonto): string {
  return porDefecto.convertir(monto);
}
