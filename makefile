# Remove the following comment to enable log messages for AST traversal, or AST
# simplification.
#export DEBUG=traversal,simplify,esreduce

.PHONY: build test test-basic test-traversal test-simplify

build:
	npm run build

test:
	npm test

test-basic:
	node_modules/.bin/mocha test/basic.js

test-traversal:
	node_modules/.bin/mocha test/traversal.js

test-simplify:
	node_modules/.bin/mocha test/simplify.js
