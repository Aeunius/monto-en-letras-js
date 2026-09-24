// Descarga los datasets del paquete PHP, la fuente de verdad de los casos de
// prueba, desde un tag fijo. Con --check no escribe nada: falla si la copia
// versionada en tests/datasets no coincide con la del tag.
//
//   node scripts/datasets.mjs          actualiza tests/datasets
//   node scripts/datasets.mjs --check  solo compara (lo usa el CI)

import { readFile, writeFile } from 'node:fs/promises';

const REPO = 'Aeunius/laravel-numero-a-letras';
const TAG = 'v1.0.0';
const ARCHIVOS = ['enteros', 'apocope', 'femenino', 'montos', 'opciones'];

const destino = new URL('../tests/datasets/', import.meta.url);
const comprobar = process.argv.includes('--check');
let diferencias = 0;

for (const nombre of ARCHIVOS) {
  const url = `https://raw.githubusercontent.com/${REPO}/${TAG}/tests/Datasets/${nombre}.json`;
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`No se pudo descargar ${url}: HTTP ${respuesta.status}`);
  }

  const remoto = await respuesta.text();
  const archivo = new URL(`${nombre}.json`, destino);

  if (comprobar) {
    const local = await readFile(archivo, 'utf8').catch(() => null);

    if (local !== remoto) {
      diferencias++;
      console.error(`✗ ${nombre}.json no coincide con ${REPO}@${TAG}`);
    } else {
      console.log(`✓ ${nombre}.json`);
    }
  } else {
    await writeFile(archivo, remoto);
    console.log(`↓ ${nombre}.json`);
  }
}

if (diferencias > 0) {
  console.error('\nCorre `make datasets` para actualizar la copia.');
  process.exit(1);
}
