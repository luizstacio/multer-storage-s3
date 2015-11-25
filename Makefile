TESTS = test

test:
	node_modules/.bin/lab -t 5000 -v $(TESTS)

coverage:
	node_modules/.bin/lab -t 5000 -v -r console -o stdout -r html -o coverage.html $(TESTS)

.PHONY: test coverage