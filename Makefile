
validate: re lint test

re: clean lib

clean:
	@rm -rf lib

lint:
	@eslint src

test:
	@NODE_ENV=development mocha --compilers js:babel-register --require babel-polyfill

lib:
	@mkdir lib
	@$(shell npm bin)/babel src/index.js > lib/index.js

.PHONY: test
