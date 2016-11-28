# Remove the following comment to enable log messages for AST traversal.
#export DEBUG=traversal

.PHONY: build test test-basic test-traversal

build:
	npm run build

test:
	npm test

test-basic:
	node_modules/.bin/mocha test/basic.js

test-traversal:
	node_modules/.bin/mocha test/traversal.js
