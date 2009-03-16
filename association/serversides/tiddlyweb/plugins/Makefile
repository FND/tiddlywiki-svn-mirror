
# Simple Makefile for some common tasks. This will get 
# fleshed out with time to make things easier on developer
# and tester types.
.PHONY: test dist upload

clean:
	find . -name "*.pyc" |xargs rm
	rm -r dist
	rm -r tiddlyweb_plugins.egg-info

dist: test
	python setup.py sdist

upload: test
	python setup.py sdist upload
	scp dist/tiddlywebplugins-*.gz cdent@peermore.com:public_html/peermore.com/tiddlyweb/dist
