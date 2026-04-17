.PHONY: install build lint test clean rebuild help link

help:
	@echo "Wise Library Management Commands:"
	@echo "  make install      - Install npm dependencies"
	@echo "  make build        - Build the library (generate dist)"
	@echo "  make lint         - Run ESLint"
	@echo "  make test         - Run tests"
	@echo "  make clean        - Remove dist and node_modules"
	@echo "  make rebuild      - Clean, install and build"
	@echo "  make link         - Link the package locally using npm link"

install:
	npm install

build:
	npm run build

lint:
	npm run lint

test:
	npm test

link: build
	npm link

clean:
	rm -rf dist node_modules

rebuild: clean install build
