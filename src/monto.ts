import { NumeroFueraDeRango, NumeroNoValido } from './errores.js';
import { MAXIMO } from './palabras.js';

export type ValorMonto = number | string | bigint;

/**
 * Un monto no negativo separado en parte entera y centavos, redondeado a dos
 * decimales con el medio hacia arriba (1.005 → 1.01).
 */
export interface Monto {
  readonly entero: number;
  readonly centavos: number;
}

/**
 * Los `number` se leen por su representación más corta (la de `String()`), así
 * 1.005 se redondea como se escribió y no como se guarda en binario. Un
 * `number` solo es exacto hasta 2^53: para montos con más de 15 cifras conviene
 * pasar un `string` o un `bigint`.
 */
export function leerMonto(valor: ValorMonto): Monto {
  switch (typeof valor) {
    case 'bigint':
      return desdeTexto(String(valor), valor);

    case 'number': {
      if (!Number.isFinite(valor)) {
        throw NumeroNoValido.desde(valor);
      }

      if (valor < 0) {
        throw NumeroFueraDeRango.negativo(valor);
      }

      let texto = String(Math.abs(valor));

      // Notación exponencial: 1e+21 o 5e-7. toFixed() solo la evita debajo de 1e21.
      if (texto.includes('e')) {
        if (valor >= 1e21) {
          throw NumeroFueraDeRango.demasiadoGrande(valor);
        }

        texto = valor.toFixed(3);
      }

      return desdeTexto(texto, valor);
    }

    case 'string':
      return desdeTexto(valor.trim(), valor);

    default:
      throw NumeroNoValido.desde(valor);
  }
}

function desdeTexto(texto: string, original: ValorMonto): Monto {
  if (texto.startsWith('-')) {
    throw NumeroFueraDeRango.negativo(original);
  }

  const partes = /^(\d+)(?:\.(\d+))?$/.exec(texto);

  if (partes === null) {
    throw NumeroNoValido.desde(original);
  }

  const [, enteros = '', fraccion = ''] = partes;
  const decimales = fraccion.padEnd(3, '0');
  let centavos = Number(decimales.slice(0, 2)) + (decimales.charAt(2) >= '5' ? 1 : 0);

  const digitos = enteros.replace(/^0+/, '');

  if (digitos.length > String(MAXIMO).length) {
    throw NumeroFueraDeRango.demasiadoGrande(original);
  }

  let entero = Number(digitos);

  if (centavos === 100) {
    entero++;
    centavos = 0;
  }

  if (entero > MAXIMO) {
    throw NumeroFueraDeRango.demasiadoGrande(original);
  }

  return { entero, centavos };
}
