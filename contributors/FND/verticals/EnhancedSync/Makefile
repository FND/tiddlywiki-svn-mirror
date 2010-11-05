.PHONY: test kopfloss

test:
	test/kopfloss.sh

kopfloss:
	git clone git://github.com/FND/kopfloss.git test/kopfloss || true
	{ \
		cd test/kopfloss; \
		git pull origin master; \
		ln -s ../../../../../../../core/test/qunit/qunit.js lib/qunit.js; \
		cd -; \
	}
