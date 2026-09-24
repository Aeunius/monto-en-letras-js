# Monto en letras

Convierte montos a letras con el formato de los comprobantes peruanos de la
SUNAT: `1250.50` → `MIL DOSCIENTOS CINCUENTA CON 50/100 SOLES`.

Es el gemelo en TypeScript de
[`aeunius/laravel-numero-a-letras`](https://github.com/Aeunius/laravel-numero-a-letras):
da **exactamente** el mismo texto, porque se prueba contra los mismos datasets.
Sirve para mostrar el monto en letras en el navegador sin llamar al servidor, o
en un sistema de facturación en Node.

[![tests](https://github.com/Aeunius/monto-en-letras-js/actions/workflows/tests.yml/badge.svg)](https://github.com/Aeunius/monto-en-letras-js/actions/workflows/tests.yml)
[![Versión en npm](https://img.shields.io/npm/v/@aeunius/monto-en-letras.svg)](https://www.npmjs.com/package/@aeunius/monto-en-letras)
[![Licencia](https://img.shields.io/npm/l/@aeunius/monto-en-letras.svg)](LICENSE.md)

## Requisitos

- Node 22 o superior, o cualquier navegador actual (ES2022)
- Sin dependencias

## Instalación

```bash
npm install @aeunius/monto-en-letras
```

## Uso

```ts
import { convertir } from '@aeunius/monto-en-letras';

convertir(1250.50);      // "MIL DOSCIENTOS CINCUENTA CON 50/100 SOLES"
convertir('1250.50');    // lo mismo
convertir(0.5);          // "CERO CON 50/100 SOLES"
convertir(21);           // "VEINTIUNO CON 00/100 SOLES"
convertir(21000);        // "VEINTIÚN MIL CON 00/100 SOLES"
convertir(1000000);      // "UN MILLÓN CON 00/100 SOLES"
```

Con CommonJS:

```js
const { convertir } = require('@aeunius/monto-en-letras');
```

### Opciones

`convertir()` usa las opciones por defecto. Para cambiarlas, usa un
`Conversor`. Es inmutable: cada opción devuelve uno nuevo y el original no
cambia, así que puedes guardarlo y reutilizarlo.

```ts
import { Conversor } from '@aeunius/monto-en-letras';

const conversor = new Conversor();

conversor.moneda('USD').convertir(99.90);
// "NOVENTA Y NUEVE CON 90/100 DÓLARES AMERICANOS"

conversor.soles().minusculas().convertir(5);
// "cinco con 00/100 soles"

conversor.soloTexto().convertir(21);
// "VEINTIUNO"

conversor.formatoCentavos('texto').convertir(1250.50);
// "MIL DOSCIENTOS CINCUENTA SOLES CON CINCUENTA CÉNTIMOS"

conversor.formatoCentavos('texto').convertir(21.01);
// "VEINTIÚN SOLES CON UN CÉNTIMO"

conversor.conector('y').convertir(1858.59);
// "MIL OCHOCIENTOS CINCUENTA Y OCHO Y 59/100 SOLES"
```

| Opción | Efecto |
|---|---|
| `moneda(string \| Moneda)` | Código ISO 4217 (`'PEN'`, `'USD'`, `'EUR'`), una de `MONEDAS` o una moneda propia. Por defecto, soles |
| `soles()`, `dolares()`, `euros()` | Atajos de `moneda()` |
| `mayusculas()` / `minusculas()` | Por defecto, mayúsculas |
| `soloTexto()` | Solo la parte entera en palabras, sin moneda ni centavos. Descarta los decimales después de redondear: `21.75` → `VEINTIUNO` |
| `formatoCentavos('fraccion' \| 'texto')` | `CON 50/100 SOLES` (por defecto) o `SOLES CON CINCUENTA CÉNTIMOS` |
| `conector('con' \| 'y')` | La palabra entre el entero y los centavos. Por defecto, `con` |

### Monedas

| Código | Singular | Plural | Centavos |
|---|---|---|---|
| `PEN` | SOL | SOLES | CÉNTIMOS |
| `USD` | DÓLAR AMERICANO | DÓLARES AMERICANOS | CENTAVOS |
| `EUR` | EURO | EUROS | CÉNTIMOS |

Para otra moneda, pasa un objeto con la forma de `Moneda`, con los nombres en
minúsculas:

```ts
import { Conversor, type Moneda } from '@aeunius/monto-en-letras';

const libra: Moneda = {
  singular: 'libra esterlina',
  plural: 'libras esterlinas',
  femenina: true,
  centavoSingular: 'penique',
  centavoPlural: 'peniques',
};

new Conversor().moneda(libra).formatoCentavos('texto').convertir(21.01);
// "VEINTIUNA LIBRAS ESTERLINAS CON UN PENIQUE"
```

### Solo las palabras

Si solo necesitas las palabras de un entero, en minúsculas:

```ts
import { palabras } from '@aeunius/monto-en-letras';

palabras(1250);                       // "mil doscientos cincuenta"
palabras(21, { apocope: true });      // "veintiún", delante de un sustantivo
palabras(200201, { femenino: true }); // "doscientas mil doscientas una"
```

## Reglas

| Caso | Resultado |
|---|---|
| Centavos | Siempre dos dígitos como fracción: `CON 05/100` |
| Cero | `0.50` → `CERO CON 50/100 SOLES` |
| Cien | `CIEN`, pero `CIENTO UNO` |
| Mil | `MIL`, no `UN MIL` |
| "Uno" al final, en fracción | `VEINTIUNO CON 00/100 SOLES`: la moneda va después de la fracción, así que el número no se apocopa |
| "Uno" delante de la moneda, en texto | `UN SOL`, `VEINTIÚN SOLES`, `UN DÓLAR AMERICANO` |
| "Uno" delante de mil, millón o billón | `VEINTIÚN MIL`, `UN MILLÓN`, `TREINTA Y UN MILLONES` |
| Millón o billón exactos, en texto | `UN MILLÓN DE SOLES`, pero `UN MILLÓN CIEN SOLES` |
| Moneda femenina, en texto | `VEINTIUNA LIBRAS`, `DOSCIENTAS MIL LIBRAS`, pero `DOSCIENTOS MILLONES DE LIBRAS` (concuerda con "millón") |
| Escala | Larga, la del español: `MIL MILLONES` (10⁹), `UN BILLÓN` (10¹²) |
| Tildes | Se escriben: `DIECISÉIS`, `VEINTIDÓS`, `MILLÓN` |

### Qué acepta

- `number`, `bigint` o `string` con dígitos y, si hace falta, un punto decimal:
  `1250`, `1250.5`, `1250n`, `'1250.50'`, `' 1250.50 '`.
- No acepta separadores de miles (`'1,250.50'`), comas decimales, signos ni
  notación científica en texto (`'1e3'`). Lanza `NumeroNoValido`, igual que con
  `NaN`, `Infinity`, `null` u otros tipos.
- Los negativos lanzan `NumeroFueraDeRango`. Una opción inválida (moneda,
  formato o conector desconocidos) lanza `OpcionNoValida`.

```ts
import { convertir, NumeroNoValido } from '@aeunius/monto-en-letras';

try {
  convertir(entrada);
} catch (error) {
  if (error instanceof NumeroNoValido) {
    // mostrar el mensaje al usuario
  }
}
```

### Redondeo

A dos decimales, con el medio hacia arriba: `1.005` → `UNO CON 01/100`,
`0.995` → `UNO CON 00/100`.

Un `number` se redondea tal como se escribió, no como lo guarda la máquina:
en binario `1.005` es en realidad `1.00499999…`, pero aquí se toma como `1.005`.
Lo mismo pasa con `0.1 + 0.2`, que da `CERO CON 30/100`.

### Máximo

`999 999 999 999 999,99` (justo debajo de mil billones). Por encima se lanza
`NumeroFueraDeRango`.

Un `number` pierde precisión en los centavos a partir de unos 15 dígitos en
total. Para montos tan grandes, pasa el monto como `string` (o como `bigint`, si
no tiene centavos).

## En el comprobante electrónico

El monto en letras va en la leyenda con código `1000` del catálogo 52
(`<cbc:Note languageLocaleID="1000">`). La SUNAT no fija la redacción: la leyenda
es opcional y sus propias guías usan tanto `CON 59/100 Soles` como `Y 00/100`.
Por eso el conector se puede cambiar.

Lo que sí fija es el largo: `cbc:Note` admite **hasta 100 caracteres**. Hasta
999 999,99 el texto nunca pasa de 86, pero desde las decenas de millones
puede superarlo (`777777777.77` da 113 caracteres, y los dólares suman 13 más
que los soles). El paquete no recorta el texto, porque un monto cortado sería
un monto equivocado: si emites comprobantes por esos montos, comprueba el largo
antes de enviarlo.

## Desarrollo

Todo corre en Docker; no hace falta Node instalado.

```bash
make install
make test
make lint
make typecheck
make build
```

Los casos de prueba vienen del paquete PHP, que es la fuente de verdad. La
copia en `tests/datasets/` está fijada a un tag de ese repositorio
(`scripts/datasets.mjs`). Para cambiar una regla: se cambia primero el dataset
en el paquete PHP, se publica un tag, y aquí se sube el tag y se ajusta el
código hasta que pasen los tests. `make datasets` descarga la copia y
`make datasets a=--check` comprueba que esté al día, como el CI.

## Licencia

MIT. Ver [LICENSE.md](LICENSE.md).
