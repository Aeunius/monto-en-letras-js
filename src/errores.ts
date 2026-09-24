import { MAXIMO } from './palabras.js';

/**
 * El monto es negativo o pasa del máximo (999 999 999 999 999,99).
 */
export class NumeroFueraDeRango extends Error {
  override name = 'NumeroFueraDeRango';

  static negativo(numero: number | string | bigint): NumeroFueraDeRango {
    return new NumeroFueraDeRango(`No se pueden convertir números negativos: ${numero}.`);
  }

  static demasiadoGrande(numero: number | string | bigint): NumeroFueraDeRango {
    const maximo = String(MAXIMO).replace(/\B(?=(\d{3})+$)/g, ' ');

    return new NumeroFueraDeRango(
      `El número ${numero} supera el máximo que se puede convertir (${maximo},99).`,
    );
  }
}

/**
 * La entrada no es un número: "1,250.50", "abc", NaN, Infinity…
 */
export class NumeroNoValido extends Error {
  override name = 'NumeroNoValido';

  static desde(valor: unknown): NumeroNoValido {
    const texto = typeof valor === 'string' ? `"${valor}"` : String(valor);

    return new NumeroNoValido(
      `No es un número válido: ${texto}. Usa dígitos y, si hace falta, un punto decimal (1250.50).`,
    );
  }
}

/**
 * Una opción del conversor con un valor que no existe.
 */
export class OpcionNoValida extends Error {
  override name = 'OpcionNoValida';

  static moneda(codigo: string, codigos: readonly string[]): OpcionNoValida {
    return new OpcionNoValida(
      `La moneda "${codigo}" no está incluida (${codigos.join(', ')}). Para otra, pasa un objeto que cumpla la interfaz Moneda.`,
    );
  }

  static formatoCentavos(formato: string, formatos: readonly string[]): OpcionNoValida {
    return new OpcionNoValida(
      `El formato de centavos "${formato}" no existe. Usa uno de: ${formatos.join(', ')}.`,
    );
  }

  static conector(conector: string): OpcionNoValida {
    return new OpcionNoValida(`El conector "${conector}" no es válido. Usa "con" o "y".`);
  }
}
