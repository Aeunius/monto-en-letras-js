import { describe, expect, it } from 'vitest';
import { Conversor, convertir, NumeroFueraDeRango, NumeroNoValido } from '../src/index.js';
import montos from './datasets/montos.json' with { type: 'json' };

type Caso = [number | string, string];

const MAXIMO_EN_LETRAS =
  'NOVECIENTOS NOVENTA Y NUEVE BILLONES NOVECIENTOS NOVENTA Y NUEVE MIL NOVECIENTOS NOVENTA Y NUEVE MILLONES NOVECIENTOS NOVENTA Y NUEVE MIL NOVECIENTOS NOVENTA Y NUEVE';

describe('convertir', () => {
  it.each(montos as Caso[])('%j → %s', (monto, esperado) => {
    expect(new Conversor().convertir(monto)).toBe(esperado);
  });

  it('convierte con las opciones por defecto', () => {
    expect(convertir(1250.5)).toBe('MIL DOSCIENTOS CINCUENTA CON 50/100 SOLES');
  });

  it.each([-1, -0.01, '-5', ' -5 ', -1n, -Number.MAX_VALUE])('rechaza negativos: %s', (monto) => {
    expect(() => convertir(monto)).toThrow(NumeroFueraDeRango);
    expect(() => convertir(monto)).toThrow('negativos');
  });

  it.each([
    1_000_000_000_000_000,
    1e15,
    1e20,
    1e21,
    Number.MAX_VALUE,
    '1000000000000000',
    '999999999999999.995',
    '99999999999999999999999999',
    1_000_000_000_000_000n,
    2n ** 64n,
  ])('rechaza montos desde mil billones: %s', (monto) => {
    expect(() => convertir(monto)).toThrow(NumeroFueraDeRango);
    expect(() => convertir(monto)).toThrow('supera el máximo');
  });

  it.each([
    '',
    'abc',
    '1,250.50',
    '1 250',
    '1250.',
    '.50',
    '1e3',
    '+5',
    Number.POSITIVE_INFINITY,
    Number.NaN,
  ])('rechaza lo que no es un número: %j', (monto) => {
    expect(() => convertir(monto)).toThrow(NumeroNoValido);
    expect(() => convertir(monto)).toThrow('No es un número válido');
  });

  it('usa los mismos mensajes de error que el paquete PHP', () => {
    expect(() => convertir(-5)).toThrow('No se pueden convertir números negativos: -5.');
    expect(() => convertir('1000000000000000')).toThrow(
      'El número 1000000000000000 supera el máximo que se puede convertir (999 999 999 999 999,99).',
    );
    expect(() => convertir('1,5')).toThrow(
      'No es un número válido: "1,5". Usa dígitos y, si hace falta, un punto decimal (1250.50).',
    );
  });
});

describe('entradas propias de JavaScript', () => {
  it('acepta bigint', () => {
    expect(convertir(1250n)).toBe('MIL DOSCIENTOS CINCUENTA CON 00/100 SOLES');
    expect(convertir(0n)).toBe('CERO CON 00/100 SOLES');
    expect(convertir(999_999_999_999_999n)).toBe(`${MAXIMO_EN_LETRAS} CON 00/100 SOLES`);
  });

  it('lee la notación exponencial de los number', () => {
    expect(String(5e-7)).toBe('5e-7');
    expect(convertir(5e-7)).toBe('CERO CON 00/100 SOLES');
    expect(convertir(Number.MIN_VALUE)).toBe('CERO CON 00/100 SOLES');
    expect(convertir(1e-7)).toBe('CERO CON 00/100 SOLES');
    expect(convertir(1e6)).toBe('UN MILLÓN CON 00/100 SOLES');
  });

  it('trata -0 como cero', () => {
    expect(convertir(-0)).toBe('CERO CON 00/100 SOLES');
  });

  it('redondea por la representación más corta del number', () => {
    // En binario 1.005 es 1.00499999999999989…; se redondea como se escribió.
    expect(convertir(1.005)).toBe('UNO CON 01/100 SOLES');
    expect(convertir(0.1 + 0.2)).toBe('CERO CON 30/100 SOLES');
    expect(convertir(8.345)).toBe('OCHO CON 35/100 SOLES');
  });

  it('usa string para montos grandes con centavos', () => {
    expect(convertir('999999999999999.99')).toBe(`${MAXIMO_EN_LETRAS} CON 99/100 SOLES`);
  });

  it.each([null, undefined, {}, [], true, Symbol('x')])('rechaza otros tipos: %s', (monto) => {
    // @ts-expect-error: llamada desde JavaScript sin tipos.
    expect(() => convertir(monto)).toThrow(NumeroNoValido);
  });
});
