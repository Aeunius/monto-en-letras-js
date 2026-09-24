# Changelog

Todos los cambios importantes de este paquete se registran aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el
proyecto usa [versionado semántico](https://semver.org/lang/es/). La versión
mayor sigue a la del paquete PHP
[`aeunius/laravel-numero-a-letras`](https://github.com/Aeunius/laravel-numero-a-letras)
cuyo resultado reproduce.

## [Sin publicar]

### Agregado

- `convertir()` y `Conversor`: montos a letras con el formato de la SUNAT
  (`MIL DOSCIENTOS CINCUENTA CON 50/100 SOLES`), con el mismo texto que
  `aeunius/laravel-numero-a-letras` 1.0.0. Se prueba contra sus datasets.
- Opciones del conversor, inmutable: `moneda()`, `soles()`, `dolares()`,
  `euros()`, `mayusculas()`, `minusculas()`, `soloTexto()`,
  `formatoCentavos()` y `conector()`.
- `palabras()`: enteros de cero a 999 999 999 999 999 en palabras, con
  apócope y femenino opcionales.
- `MONEDAS` con soles (`PEN`), dólares (`USD`) y euros (`EUR`), y la interfaz
  `Moneda` para usar cualquier otra.
- Acepta `number`, `string` o `bigint`. Los `number` en notación exponencial
  (`5e-7`, `1e+21`) también se leen.
- Errores `NumeroFueraDeRango`, `NumeroNoValido` y `OpcionNoValida`, con los
  mismos mensajes que el paquete PHP.
- Build ESM y CommonJS con tipos, sin dependencias.

[Sin publicar]: https://github.com/Aeunius/monto-en-letras-js/commits/main
