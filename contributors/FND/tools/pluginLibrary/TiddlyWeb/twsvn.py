import pysvn
import posixpath

class twsvn:
	def __init__(self, host):
		self.svn = pysvn.Client()
		self.host = host
		if self.host[-1] != "/": # XXX: inefficient?
			self.host = self.host + "/"

	def getPlugins(self, dir):
		print "processing " + dir # DEBUG
		items = self.svn.ls(self.host + dir)
		plugins = []
		for item in items:
			if item.kind == pysvn.node_kind.file and item.name[-3:] == ".js":
				plugins.append({
					"name": posixpath.basename(item.name[:-3]),
					"contents": self.svn.cat(item.name)
				})
			elif item.kind == pysvn.node_kind.dir:
				subdir = dir.rstrip("/") + "/" + posixpath.basename(item.name.rstrip("/")) # XXX: inefficient?
				plugins.append(self.getPlugins(subdir))
		return plugins

# DEBUG
svn = twsvn("http://svn.tiddlywiki.org")
print svn.getPlugins("Trunk/association/plugins")

