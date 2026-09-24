import { describe, expect, it } from 'vitest';
import { MAXIMO, NumeroFueraDeRango, NumeroNoValido, palabras } from '../src/index.js';
import apocope from './datasets/apocope.json' with { type: 'json' };
import enteros from './datasets/enteros.json' with { type: 'json' };
import femenino from './datasets/femenino.json' with { type: 'json' };

type Caso = [number, string];

describe('palabras', () => {
  it.each(enteros as Caso[])('%i → %s', (numero, esperado) => {
    expect(palabras(numero)).toBe(esperado);
  });

  it.each(apocope as Caso[])('%i con apócope → %s', (numero, esperado) => {
    expect(palabras(numero, { apocope: true })).toBe(esperado);
  });

  it.each(femenino as Caso[])('%i en femenino → %s', (numero, esperado) => {
    expect(palabras(numero, { femenino: true })).toBe(esperado);
  });

  it('acepta bigint', () => {
    expect(palabras(21n, { apocope: true })).toBe('veintiún');
    expect(palabras(BigInt(MAXIMO))).toBe(palabras(MAXIMO));
  });

  it.each([-1, -1n])('rechaza negativos: %s', (numero) => {
    expect(() => palabras(numero)).toThrow(NumeroFueraDeRango);
  });

  it.each([MAXIMO + 1, BigInt(MAXIMO) + 1n, 1e21, 2n ** 64n])(
    'rechaza desde mil billones: %s',
    (numero) => {
      expect(() => palabras(numero)).toThrow('supera el máximo');
    },
  );

  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rechaza lo que no es entero: %s',
    (numero) => {
      expect(() => palabras(numero)).toThrow(NumeroNoValido);
    },
  );
});
