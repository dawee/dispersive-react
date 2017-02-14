
validate: re lint test

re: clean lib

clean:
	@rm -rf lib

lint:
	@eslint src

test: lib
	@NODE_ENV=development mocha --compilers js:babel-register --require babel-polyfill

lib:
	@babel src --out-dir lib

.PHONY: test
