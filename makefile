# Remove the following comment to enable log messages for AST traversal,
# AST simplification, AST printing or AST mutation. Use 'esreduce' to log
# messages about when a successful mutation has happened.
#export DEBUG=traversal,simplify,ast,mutate,esreduce

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
