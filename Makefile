.PHONY: dev build deploy restart stop logs db-push

dev:
	npm run dev

build:
	npm run build

deploy: build
	pm2 restart my-recipes

restart:
	pm2 restart my-recipes

stop:
	pm2 stop my-recipes

logs:
	pm2 logs my-recipes

db-push:
	npx drizzle-kit push
