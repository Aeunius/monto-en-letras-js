import { OpcionNoValida } from './errores.js';
import { type CodigoMoneda, MONEDAS, type Moneda } from './monedas.js';
import { leerMonto, type Monto, type ValorMonto } from './monto.js';
import { deEntero } from './palabras.js';

const FORMATOS_CENTAVOS = ['fraccion', 'texto'] as const;
const CONECTORES = ['con', 'y'] as const;

/**
 * "fraccion": "CON 50/100 SOLES", el de los comprobantes de la SUNAT.
 * "texto": "SOLES CON CINCUENTA CÉNTIMOS".
 */
export type FormatoCentavos = (typeof FORMATOS_CENTAVOS)[number];

export type Conector = (typeof CONECTORES)[number];

interface Opciones {
  moneda: Moneda;
  mayusculas: boolean;
  soloTexto: boolean;
  formatoCentavos: FormatoCentavos;
  conector: Conector;
}

/**
 * Inmutable: cada opción devuelve un conversor nuevo.
 */
export class Conversor {
  #opciones: Readonly<Opciones> = {
    moneda: MONEDAS.PEN,
    mayusculas: true,
    soloTexto: false,
    formatoCentavos: 'fraccion',
    conector: 'con',
  };

  /**
   * 1250.50 → "MIL DOSCIENTOS CINCUENTA CON 50/100 SOLES"
   */
  convertir(monto: ValorMonto): string {
    const leido = leerMonto(monto);
    const { soloTexto, formatoCentavos, mayusculas } = this.#opciones;

    let texto: string;

    if (soloTexto) {
      texto = deEntero(leido.entero);
    } else if (formatoCentavos === 'texto') {
      texto = this.#enTexto(leido);
    } else {
      texto = this.#enFraccion(leido);
    }

    return mayusculas ? texto.toLocaleUpperCase('es') : texto;
  }

  /** Por código ISO 4217 ("USD", sin importar mayúsculas) o con un objeto `Moneda` propio. */
  moneda(moneda: CodigoMoneda | (string & {}) | Moneda): Conversor {
    if (typeof moneda === 'string') {
      const codigo = moneda.trim().toUpperCase();

      if (!Object.hasOwn(MONEDAS, codigo)) {
        throw OpcionNoValida.moneda(moneda, Object.keys(MONEDAS));
      }

      moneda = MONEDAS[codigo as CodigoMoneda];
    }

    return this.#con({ moneda });
  }

  soles(): Conversor {
    return this.moneda(MONEDAS.PEN);
  }

  dolares(): Conversor {
    return this.moneda(MONEDAS.USD);
  }

  euros(): Conversor {
    return this.moneda(MONEDAS.EUR);
  }

  mayusculas(): Conversor {
    return this.#con({ mayusculas: true });
  }

  minusculas(): Conversor {
    return this.#con({ mayusculas: false });
  }

  /**
   * Solo la parte entera en palabras, sin moneda ni centavos: 21 → "VEINTIUNO".
   * Los decimales se descartan después de redondear a dos: 21.999 → "VEINTIDÓS".
   */
  soloTexto(soloTexto = true): Conversor {
    return this.#con({ soloTexto });
  }

  formatoCentavos(formato: FormatoCentavos): Conversor {
    if (!FORMATOS_CENTAVOS.includes(formato)) {
      throw OpcionNoValida.formatoCentavos(formato, FORMATOS_CENTAVOS);
    }

    return this.#con({ formatoCentavos: formato });
  }

  /**
   * La palabra que une la parte entera con los centavos: "con" (por defecto) o "y".
   */
  conector(conector: Conector): Conversor {
    if (!CONECTORES.includes(conector)) {
      throw OpcionNoValida.conector(conector);
    }

    return this.#con({ conector });
  }

  #con(cambios: Partial<Opciones>): Conversor {
    const copia = new Conversor();
    copia.#opciones = { ...this.#opciones, ...cambios };

    return copia;
  }

  /**
   * "mil doscientos cincuenta con 50/100 soles"
   */
  #enFraccion({ entero, centavos }: Monto): string {
    const { conector, moneda } = this.#opciones;

    return `${deEntero(entero)} ${conector} ${String(centavos).padStart(2, '0')}/100 ${moneda.plural}`;
  }

  /**
   * "mil doscientos cincuenta soles con cincuenta céntimos"
   */
  #enTexto({ entero, centavos }: Monto): string {
    const { conector, moneda } = this.#opciones;

    const texto = [
      deEntero(entero, true, moneda.femenina),
      // "un millón de soles", pero "un millón cien soles".
      ...(entero > 0 && entero % 1_000_000 === 0 ? ['de'] : []),
      entero === 1 ? moneda.singular : moneda.plural,
    ].join(' ');

    if (centavos === 0) {
      return texto;
    }

    return [
      texto,
      conector,
      deEntero(centavos, true),
      centavos === 1 ? moneda.centavoSingular : moneda.centavoPlural,
    ].join(' ');
  }
}
