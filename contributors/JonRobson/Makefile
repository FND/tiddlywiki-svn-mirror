# Simple Makefile for some common tasks. This will get
# fleshed out with time to make things easier on developer
# and tester types.
.PHONY: clean test dist release pypi

clean:
	find . -name "*.jar" | xargs rm || true
	find . -name "*.pyc" | xargs rm || true
	find . -name "*.[0-9]*.[0-9]*.html" | xargs rm || true
	rm verticals/TravelItinerary/*.png || true
  