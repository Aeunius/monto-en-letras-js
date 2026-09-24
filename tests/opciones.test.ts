import { describe, expect, it } from 'vitest';
import { Conversor, MONEDAS, type Moneda, OpcionNoValida } from '../src/index.js';
import opciones from './datasets/opciones.json' with { type: 'json' };

interface Opciones {
  moneda?: string;
  caja?: string;
  centavos?: string;
  conector?: string;
  soloTexto?: boolean;
}

interface Caso {
  monto: number | string;
  opciones: Opciones;
  esperado: string;
}

/** Aplica las opciones en el orden en que vienen, como el test del paquete PHP. */
function conversorCon(opciones: Opciones): Conversor {
  let conversor = new Conversor();

  for (const [opcion, valor] of Object.entries(opciones)) {
    switch (opcion) {
      case 'moneda':
        conversor = conversor.moneda(valor);
        break;
      case 'caja':
        conversor = valor === 'minusculas' ? conversor.minusculas() : conversor.mayusculas();
        break;
      case 'centavos':
        conversor = conversor.formatoCentavos(valor);
        break;
      case 'conector':
        conversor = conversor.conector(valor);
        break;
      case 'soloTexto':
        conversor = conversor.soloTexto(valor);
        break;
      default:
        throw new Error(`Opción desconocida en el dataset: ${opcion}`);
    }
  }

  return conversor;
}

describe('opciones', () => {
  it.each(opciones as Caso[])(
    '$monto con $opciones → $esperado',
    ({ monto, opciones, esperado }) => {
      expect(conversorCon(opciones).convertir(monto)).toBe(esperado);
    },
  );

  it('tiene atajos para las monedas incluidas', () => {
    const conversor = new Conversor();

    expect(conversor.dolares().convertir(1)).toBe('UNO CON 00/100 DÓLARES AMERICANOS');
    expect(conversor.euros().convertir(1)).toBe('UNO CON 00/100 EUROS');
    expect(conversor.dolares().soles().convertir(1)).toBe('UNO CON 00/100 SOLES');
  });

  it('acepta las monedas de MONEDAS', () => {
    expect(new Conversor().moneda(MONEDAS.USD).formatoCentavos('texto').convertir(2)).toBe(
      'DOS DÓLARES AMERICANOS',
    );
  });

  it('es inmutable', () => {
    const base = new Conversor();
    base.dolares().minusculas().soloTexto().formatoCentavos('texto').conector('y');

    expect(base.convertir(1.5)).toBe('UNO CON 50/100 SOLES');
  });

  it('no deja modificar las monedas incluidas', () => {
    expect(Object.isFrozen(MONEDAS)).toBe(true);
    expect(Object.isFrozen(MONEDAS.PEN)).toBe(true);
  });

  it('acepta monedas propias', () => {
    const libra: Moneda = {
      singular: 'libra esterlina',
      plural: 'libras esterlinas',
      femenina: true,
      centavoSingular: 'penique',
      centavoPlural: 'peniques',
    };

    const conversor = new Conversor().moneda(libra);
    const texto = conversor.formatoCentavos('texto');

    expect(conversor.convertir(21)).toBe('VEINTIUNO CON 00/100 LIBRAS ESTERLINAS');
    expect(texto.convertir(1)).toBe('UNA LIBRA ESTERLINA');
    expect(texto.convertir(21.01)).toBe('VEINTIUNA LIBRAS ESTERLINAS CON UN PENIQUE');
    expect(texto.convertir(200000)).toBe('DOSCIENTAS MIL LIBRAS ESTERLINAS');
    expect(texto.convertir(200000000)).toBe('DOSCIENTOS MILLONES DE LIBRAS ESTERLINAS');
    expect(texto.convertir(1_000_001)).toBe('UN MILLÓN UNA LIBRAS ESTERLINAS');
  });

  it('rechaza monedas que no conoce', () => {
    expect(() => new Conversor().moneda('GBP')).toThrow(OpcionNoValida);
    expect(() => new Conversor().moneda('GBP')).toThrow(
      'La moneda "GBP" no está incluida (PEN, USD, EUR)',
    );
    expect(() => new Conversor().moneda('toString')).toThrow(OpcionNoValida);
  });

  it('rechaza formatos de centavos que no existen', () => {
    // @ts-expect-error: llamada desde JavaScript sin tipos.
    expect(() => new Conversor().formatoCentavos('palabras')).toThrow(
      'Usa uno de: fraccion, texto',
    );
  });

  it.each(['e', 'CON', ''])('rechaza conectores que no sean "con" o "y": %j', (conector) => {
    // @ts-expect-error: llamada desde JavaScript sin tipos.
    expect(() => new Conversor().conector(conector)).toThrow('Usa "con" o "y"');
  });
});
