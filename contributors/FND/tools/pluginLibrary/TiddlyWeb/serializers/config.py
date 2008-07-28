import tiddlyweb.config

config["extension_types"]["store"] = "text/x-tiddlystore"
config["serializers"]["text/x-tiddlystore"] = ["tiddlyweb.serializations.pureStore",
	"text/html; charset=UTF-8"]
