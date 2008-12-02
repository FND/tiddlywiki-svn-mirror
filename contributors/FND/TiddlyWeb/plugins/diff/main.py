# To Do
# * extend urls.map instead of overriding
# * alternative diff format

import urllib

from difflib import Differ

from tiddlyweb.model.bag import Bag
from tiddlyweb import control
from tiddlyweb.web.handler.tiddler import Tiddler, _determine_tiddler, _check_bag_constraint
from tiddlyweb.web import util as web


def init(config):
	print "initializing diff plugin"


def get_diff(environ, start_response):
	rev1 = environ["wsgiorg.routing_args"][1].get("rev1", None)
	rev2 = environ["wsgiorg.routing_args"][1].get("rev2", None)
	tiddler = _determine_tiddler(environ, control.determine_tiddler_bag_from_recipe)
	return _send_tiddler_diff(environ, start_response, tiddler, rev1, rev2)


def _send_tiddler_diff(environ, start_response, tiddler, rev1, rev2):
	store = environ["tiddlyweb.store"]
	bag = Bag(tiddler.bag)
	_check_bag_constraint(environ, bag, "read")
	try:
		store.get(tiddler)
	except NoTiddlerError, e:
		raise HTTP404, "%s not found, %s" % (tiddler.title, e)

	if rev1 == None:
		rev1 = tiddler.revision
	if rev2 == None:
		rev2 = str(int(rev1) - 1)

	def getTiddlerText(tiddler):
		try:
			store.get(tiddler)
		except NoTiddlerError, e:
			raise HTTP404, "%s (rev:%s) not found, %s" % (tiddler.title, tiddler.revision, e)
		return tiddler.text.splitlines(1)
	tiddler.revision = rev1
	rev1Text = getTiddlerText(tiddler)
	tiddler.revision = rev2
	rev2Text = getTiddlerText(tiddler)

	d = Differ()
	result = list(d.compare(rev2Text, rev1Text))
	content = "\n".join(result)

	serialize_type, mime_type = web.get_serialize_type(environ)
	cache_header = ("Cache-Control", "no-cache")
	content_header = ("Content-Type", mime_type)
	response = [cache_header, content_header]
	start_response("200 OK", response)

	return [content]
