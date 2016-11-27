# set following environment variable to enable log messages for AST traversal.
#export DEBUG=traversal

.PHONY: test

test:
	node_modules/.bin/mocha test/
