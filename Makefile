run:
	npm run start

install:
	npm i

build:
	npm run build

.PHONY: run build install

revision := $(shell git rev-parse --short HEAD)
image := "kinecosystem/jwt-service"

build-image:
	docker build -t ${image} -f Dockerfile \
		--build-arg BUILD_COMMIT="${revision}" \
		--build-arg BUILD_TIMESTAMP="$(shell date -u +"%Y-%m-%dT%H:%M:%SZ")" .
	docker tag ${image} ${image}:${revision}

push-image:
	docker push ${image}:latest
	docker push ${image}:${revision}

up:
	docker-compose up

