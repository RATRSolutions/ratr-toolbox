ROOT := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

.PHONY: dev backend frontend install

dev:
	@trap 'kill 0' EXIT; \
	cd "$(ROOT)backend" && npm run dev & \
	cd "$(ROOT)frontend" && npm run dev & \
	wait

backend:
	cd "$(ROOT)backend" && npm run dev

frontend:
	cd "$(ROOT)frontend" && npm run dev

install:
	cd "$(ROOT)backend" && npm install
	cd "$(ROOT)frontend" && npm install
