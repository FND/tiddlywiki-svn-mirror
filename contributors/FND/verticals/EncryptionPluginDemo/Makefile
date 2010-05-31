.PHONY: jslib deploy

aes_uri = http://github.com/markpercival/gibberish-aes

jslib:
	curl "$(aes_uri)/raw/master/src/gibberish-aes.min.js" | \
		{ echo "/***"; echo "Name: Gibberish AES"; echo "$(aes_uri)"; echo "***/"; cat -; } \
		> lib/gibberish-aes.min.js

deploy: jslib
	./deploy.sh
