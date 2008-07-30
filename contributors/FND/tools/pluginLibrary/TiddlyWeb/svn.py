import pysvn
import posixpath

class twsvn:
	def __init__(self, host):
		self.svn = pysvn.Client()
		self.host = host
		if self.host[-1] != "/": # XXX: inefficient?
			self.host = self.host + "/"

	def getPlugins(self, dir):
		items = self.svn.ls(self.host + dir)
		plugins = []
		for item in items:
			if item.kind == pysvn.node_kind.file and item.name[-3:] == ".js":
				plugins.append({
					"name": posixpath.basename(item.name[:-3]),
					"contents": self.svn.cat(item.name)
				})
		return plugins

svn = twsvn("http://svn.tiddlywiki.org")
print svn.getPlugins("Trunk/association/plugins")

