import { NumeroFueraDeRango, NumeroNoValido } from './errores.js';

/** Justo debajo de mil billones. Cabe en un `number` sin perder precisión (< 2^53). */
export const MAXIMO = 999_999_999_999_999;

export interface OpcionesPalabras {
  /**
   * El número termina en "un" o "veintiún" en lugar de "uno" o "veintiuno",
   * como corresponde delante de un sustantivo ("veintiún soles"). Delante de
   * "mil", "millones" y "billones" se aplica siempre.
   */
  apocope?: boolean;

  /**
   * Concuerda con un sustantivo femenino: "una", "veintiuna", "doscientas".
   * Alcanza a los miles ("doscientas mil libras") pero no a los millones ni
   * billones, que concuerdan con "millón", masculino ("doscientos millones de
   * libras").
   */
  femenino?: boolean;
}

// biome-ignore format: tabla
const BASICOS = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
] as const;

// biome-ignore format: tabla
const DECENAS = [
  '', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa',
] as const;

// biome-ignore format: tabla
const CENTENAS = [
  '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
] as const;

/**
 * Enteros a palabras en español, en minúsculas y con escala larga
 * (millón = 10^6, billón = 10^12): 21 → "veintiuno".
 */
export function palabras(numero: number | bigint, opciones: OpcionesPalabras = {}): string {
  if (typeof numero === 'bigint') {
    if (numero < 0n) {
      throw NumeroFueraDeRango.negativo(numero);
    }

    if (numero > BigInt(MAXIMO)) {
      throw NumeroFueraDeRango.demasiadoGrande(numero);
    }

    numero = Number(numero);
  }

  if (!Number.isInteger(numero)) {
    throw NumeroNoValido.desde(numero);
  }

  return deEntero(numero, opciones.apocope ?? false, opciones.femenino ?? false);
}

/** Para uso interno: el número ya viene validado como entero. */
export function deEntero(numero: number, apocope = false, femenino = false): string {
  if (numero < 0) {
    throw NumeroFueraDeRango.negativo(numero);
  }

  if (numero > MAXIMO) {
    throw NumeroFueraDeRango.demasiadoGrande(numero);
  }

  if (numero === 0) {
    return 'cero';
  }

  const billones = Math.floor(numero / 1e12);
  const millones = Math.floor((numero % 1e12) / 1e6);
  const resto = numero % 1e6;

  return unir(
    escala(billones, 'un billón', 'billones'),
    escala(millones, 'un millón', 'millones'),
    resto > 0 ? menorQueUnMillon(resto, apocope, femenino) : '',
  );
}

function escala(cantidad: number, singular: string, plural: string): string {
  if (cantidad === 0) {
    return '';
  }

  return cantidad === 1 ? singular : `${menorQueUnMillon(cantidad, true, false)} ${plural}`;
}

function menorQueUnMillon(numero: number, apocope: boolean, femenino: boolean): string {
  const miles = Math.floor(numero / 1000);
  const resto = numero % 1000;

  let parteMiles = '';

  if (miles === 1) {
    parteMiles = 'mil';
  } else if (miles > 1) {
    parteMiles = `${menorQueMil(miles, true, femenino)} mil`;
  }

  return unir(parteMiles, resto > 0 ? menorQueMil(resto, apocope, femenino) : '');
}

function menorQueMil(numero: number, apocope: boolean, femenino: boolean): string {
  if (numero === 100) {
    return 'cien';
  }

  const centenas = Math.floor(numero / 100);
  const resto = numero % 100;

  let centena: string = CENTENAS[centenas] ?? '';

  // doscientos → doscientas; "ciento" no cambia.
  if (femenino && centenas > 1) {
    centena = `${centena.slice(0, -2)}as`;
  }

  return unir(centena, resto > 0 ? menorQueCien(resto, apocope, femenino) : '');
}

function menorQueCien(numero: number, apocope: boolean, femenino: boolean): string {
  if (numero < 30) {
    if (femenino && numero === 1) return 'una';
    if (femenino && numero === 21) return 'veintiuna';
    if (apocope && numero === 1) return 'un';
    if (apocope && numero === 21) return 'veintiún';

    return BASICOS[numero] ?? '';
  }

  const decena = DECENAS[Math.floor(numero / 10)] ?? '';
  const unidad = numero % 10;

  if (unidad === 0) return decena;
  if (femenino && unidad === 1) return `${decena} y una`;
  if (apocope && unidad === 1) return `${decena} y un`;

  return `${decena} y ${BASICOS[unidad]}`;
}

function unir(...partes: string[]): string {
  return partes.filter((parte) => parte !== '').join(' ');
}
