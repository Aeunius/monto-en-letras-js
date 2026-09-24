# Todo corre en Docker con la imagen oficial node:24-alpine: no hace falta Node
# en el equipo. Node 22 lo prueba el CI.
#
# La caché de npm queda en ~/.cache/npm, compartida entre ejecuciones.

TTY   := $(shell [ -t 0 ] && echo -t)
CACHE := $(HOME)/.cache/npm
RUN    = docker run --rm -i $(TTY) -u $$(id -u):$$(id -g) \
         -v $(CURDIR):/app -v $(CACHE):/tmp/cache -e npm_config_cache=/tmp/cache \
         -e npm_config_update_notifier=false -w /app node:24-alpine

.PHONY: help install test typecheck build format lint datasets npm shell

help:           ## Lista los comandos
	@grep -hE '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

$(CACHE):
	@mkdir -p $@

install: | $(CACHE) ## Instala las dependencias
	$(RUN) npm ci

test:           ## Corre Vitest (make test a="-t centavos")
	$(RUN) npx vitest run $(a)

typecheck:      ## Revisa los tipos con tsc
	$(RUN) npm run typecheck

build:          ## Genera dist/ (ESM, CJS y tipos)
	$(RUN) npm run build

format:         ## Formatea y corrige con Biome
	$(RUN) npm run format

lint:           ## Revisa formato y lint sin cambiar nada (como el CI)
	$(RUN) npm run lint

datasets:       ## Descarga los datasets del paquete PHP (make datasets a="--check")
	$(RUN) node scripts/datasets.mjs $(a)

npm: | $(CACHE) ## make npm c="install -D paquete"
	$(RUN) npm $(c)

shell:          ## sh dentro del contenedor
	$(RUN) sh
