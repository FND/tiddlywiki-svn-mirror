import httplib2
import posixpath

from BeautifulSoup import BeautifulSoup

class dirScraper:
	def __init__(self, url):
		self.url = addTrailingSlash(url)

	def getPlugins(self, dir):
		results = []
		print "processing " + self.url + dir # DEBUG
		dir = addTrailingSlash(dir)
		content = self._get(self.url + dir)
		soup = BeautifulSoup(content)
		list = soup.find("ul")
		items = list.findChildren("li")
		for item in items:
			anchor = item.findChild("a")
			href = anchor["href"]
			if href == "../":
				continue
			if href.endswith(".js"): # directory
				results.append({
					"name": posixpath.basename(href[:-3]),
					"source": self.url + dir + href,
					"content": self._get(self.url + dir + href)
				})
			elif href.endswith("/"): # plugin
				results.extend(self.getPlugins(dir + href))
		return results

	def _get(self, url):
		http = httplib2.Http()
		reponse, content = http.request(url, method="GET")
		return content

def addTrailingSlash(path): # XXX: rename?
	if path[-1] != "/":
		path = path + "/"
	return path

# DEBUG
repo = dirScraper("http://svn.tiddlywiki.org")
plugins = repo.getPlugins("Trunk/association/plugins")
for plugin in plugins:
	print plugin["name"], plugin["source"]
	#print plugin["content"]

