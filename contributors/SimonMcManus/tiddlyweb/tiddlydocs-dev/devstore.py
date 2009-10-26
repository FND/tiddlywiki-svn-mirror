"""
Dev Store
TiddlyWeb store implementation supporting client-side development

primarily intended for TiddlyWiki plugin development

Features:
* supports Cook-style .recipe files
* supports JavaScript (.js) files
* uses .index files for referencing bag contents
* uses .tid files for non-JavaScript content
* uses .rev files for TiddlyWeb-generated content (via PUT)
* no revisions

TODO:
* Unicode handling
* write locks
"""

import os
import logging

from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.model.bag import Bag
from tiddlyweb.store import NoRecipeError, NoTiddlerError
from tiddlyweb.stores import StorageInterface
from tiddlyweb.serializer import Serializer
from tiddlyweb.util import read_utf8_file, write_utf8_file


__version__ = "0.1.0"


class ConfigurationError(Exception):
	pass


class Store(StorageInterface):

	def __init__(self, environ=None):
		logging.debug("initializing Dev Store")
		super(Store, self).__init__(environ)

		config = self.environ["tiddlyweb.config"]
		store_config = self.environ["tiddlyweb.config"]["server_store"][1]

		self._root = store_config["store_root"]
		try:
			self._index = dict(config["instance_tiddlers"])
		except KeyError:
			raise ConfigurationError("instance_tiddlers not defined")
		self.serializer = Serializer("text")

		if not os.path.exists(self._root):
			os.mkdir(self._root)
		for bag_name in self._index:
			bag_path = os.path.join(self._root, bag_name)
			if not os.path.exists(bag_path):
				os.mkdir(bag_path)

	def recipe_get(self, recipe):
		logging.debug("get recipe %s" % recipe)
		recipe_path = self._recipe_path(recipe.name)
		try:
			contents = read_utf8_file(recipe_path)
		except IOError, exc:
			raise NoRecipeError(exc)
		self.serializer.object = recipe
		return self.serializer.from_string(contents)

	def recipe_put(self, recipe):
		logging.debug("put recipe %s" % recipe)
		recipe_path = self._recipe_path(recipe.name)
		self.serializer.object = recipe
		write_utf8_file(recipe_path, self.serializer.to_string())

	def recipe_delete(self, recipe):
		logging.debug("delete recipe %s" % recipe)
		recipe_path = self._recipe_path(recipe.name)
		try:
			os.remove(recipe_path)
		except IOError, exc:
			raise NoRecipeError(exc)

	def bag_get(self, bag):
		logging.debug("get bag %s" % bag)

		uris = self._index[bag.name]
		for uri in _resolve_references(uris):
			title = _extract_title(uri)
			tiddler = Tiddler(title, bag.name)
			bag.add_tiddler(tiddler) # TODO: ensure unique titles?

		return bag

	def bag_put(self, bag):
		logging.debug("put bag %s" % bag)
		raise StoreMethodNotImplemented

	def bag_delete(self, bag):
		logging.debug("delete bag %s" % bag)
		raise StoreMethodNotImplemented

	def tiddler_get(self, tiddler):
		logging.debug("get tiddler %s" % tiddler)
		try:
			# "local" version; considered secondary source, but taking precedence
			tiddler = self._get_local_tiddler(tiddler)
		except IOError: # "remote" version; considered primary source
			tiddler = self._get_remote_tiddler(tiddler)
		tiddler.revision = 1
		return tiddler

	def tiddler_put(self, tiddler):
		logging.debug("put tiddler %s" % tiddler)

		tiddler_path = self._tiddler_path(tiddler)
		tiddler.revision = 1

		if (tiddler.type and tiddler.type != "None" and
			not tiddler.type.startswith("text/")):
			tiddler.text = b64encode(tiddler.text)

		self.serializer.object = tiddler
		write_utf8_file(tiddler_path, self.serializer.to_string())

		self.tiddler_written(tiddler)

	def tiddler_delete(self, tiddler):
		logging.debug("delete tiddler %s" % tiddler)
		tiddler_path = self._tiddler_path(tiddler)
		os.remove(tiddler_path)

	def user_get(self, user):
		logging.debug("get user %s" % user)
		raise StoreMethodNotImplemented
		return None

	def user_put(self, user):
		logging.debug("put user %s" % user)
		raise StoreMethodNotImplemented

	def user_delete(self, user):
		logging.debug("delete user %s" % user)
		raise StoreMethodNotImplemented

	def list_recipes(self):
		logging.debug("list recipes")
		raise StoreMethodNotImplemented
		return None

	def list_bags(self):
		logging.debug("list bags")
		return [Bag(bag_name) for bag_name in self._index]

	def list_users(self):
		logging.debug("list users")
		raise StoreMethodNotImplemented
		return None

	def list_tiddler_revisions(self, tiddler):
		logging.debug("list revisions %s" % tiddler)
		raise StoreMethodNotImplemented # store is revisionless

	def search(self, search_query):
		logging.debug("search %s" % search_query)
		raise StoreMethodNotImplemented
		return None

	def _get_local_tiddler(self, tiddler):
		tiddler_path = self._tiddler_path(tiddler)
		contents = read_utf8_file(tiddler_path)
		self.serializer.object = tiddler
		return self.serializer.from_string(contents)

	def _get_remote_tiddler(self, tiddler):
		uris = self._index[tiddler.bag]
		candidates = [uri for uri in _resolve_references(uris)
			if _extract_title(uri) == tiddler.title]
		try:
			uri = candidates[-1] # XXX: best guess!?
		except IndexError, exc:
			raise NoTiddlerError("unable to list revisions in tiddler: %s" % exc)

		if uri.endswith(".tid"):
			tiddler = self._parse_tid(uri, tiddler)
		elif uri.endswith(".js"):
			tiddler.bag = tiddler.bag
			tiddler.tags = ["systemConfig"]
			tiddler.text = read_utf8_file(uri)
		else:
			raise ConfigurationError("could not parse URI: %s" % uri)

		return tiddler

	def _parse_tid(self, uri, tiddler):
		"""
		Populate Tiddler from .tid file

		.tid format is TiddlyWeb text serialization
		"""
		contents = read_utf8_file(uri)
		self.serializer.object = tiddler
		self.serializer.from_string(contents)
		return tiddler

	def _recipe_path(self, name):
		return "%s.recipe" % os.path.join(self._root, name)

	def _tiddler_path(self, tiddler):
		return "%s.rev" % os.path.join(self._root, tiddler.bag, tiddler.title)


def _resolve_references(items):
	"""
	returns a list of tiddler references based on list of URIs

	each URI can point to a Cook-style recipe, tiddler or JavaScript file
	"""
	uris = []
	for item in items:
		if item.endswith(".recipe"):
			uris = uris + _expand_recipe(item)
		else:
			uris.append(item)
	return uris


def _expand_recipe(uri):
	"""
	returns list of tiddler references specified in a Cook-style recipe

	supports recursive references to other recipes
	"""
	uris = []
	base_dir = os.path.dirname(uri)
	f = open(uri)
	for line in f:
		if line != "\n":
			uri = line.split(": ")[1].rstrip()
			uri = os.path.join(base_dir, uri)
			if uri.endswith(".recipe"):
				uris = uris + _expand_recipe(uri)
			else:
				uris.append(uri)
	f.close()
	return uris


def _extract_title(uri):
	"""
	determine title from file path
	"""
	return uri.split("/")[-1].rsplit(".", 1)[0]
