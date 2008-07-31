import httplib2
import posixpath

from BeautifulSoup import BeautifulSoup

class dirScraper:
	def __init__(self, url):
		self.url = addTrailingSlash(url)
		self.results = []

	def getPlugins(self, dir):
		print "processing " + self.url + dir # DEBUG
		dir = addTrailingSlash(dir)
		print "processing " + self.url + dir # DEBUG
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
				self.results.append({
					"source": posixpath.basename(href[:-3]),
					"name": dir + href,
					"content": self._get(self.url + dir + href)
				})
			elif href.endswith("/"): # plugin
				self.getPlugins(dir + href)

	def _get(self, url):
		http = httplib2.Http()
		reponse, content = http.request(url, method="GET")
		return content

def addTrailingSlash(path): # XXX: rename?
	if path[-1] != "/":
		path = path + "/"
	return path

# DEBUG
tw = httpReadDir("http://svn.tiddlywiki.org")
tw.getPlugins("Trunk/association/plugins")
print tw.results

