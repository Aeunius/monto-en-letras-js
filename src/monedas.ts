/**
 * Nombres de una moneda, en minúsculas y con tildes. El conversor aplica las
 * mayúsculas cuando corresponde.
 *
 * Crea un objeto con esta forma para usar una moneda que no está en `MONEDAS`.
 */
export interface Moneda {
  /** "sol", "dólar americano" */
  readonly singular: string;

  /** "soles", "dólares americanos" */
  readonly plural: string;

  /** Si el nombre es femenino ("una libra", "doscientas libras"). */
  readonly femenina: boolean;

  /** "céntimo", "centavo". Se asume masculino. */
  readonly centavoSingular: string;

  /** "céntimos", "centavos" */
  readonly centavoPlural: string;
}

/**
 * Monedas incluidas, por su código ISO 4217 (el mismo del catálogo 02 de la SUNAT).
 */
export const MONEDAS = Object.freeze({
  PEN: Object.freeze({
    singular: 'sol',
    plural: 'soles',
    femenina: false,
    centavoSingular: 'céntimo',
    centavoPlural: 'céntimos',
  }),
  USD: Object.freeze({
    singular: 'dólar americano',
    plural: 'dólares americanos',
    femenina: false,
    centavoSingular: 'centavo',
    centavoPlural: 'centavos',
  }),
  EUR: Object.freeze({
    singular: 'euro',
    plural: 'euros',
    femenina: false,
    centavoSingular: 'céntimo',
    centavoPlural: 'céntimos',
  }),
}) satisfies Record<string, Moneda>;

export type CodigoMoneda = keyof typeof MONEDAS;
