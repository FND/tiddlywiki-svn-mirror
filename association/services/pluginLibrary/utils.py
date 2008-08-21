def trimURI(uri):
	"""
	strip non-essential trailing characters from URI

	@param uri: URI
	@type  uri: str
	@return: uniform URI
	@rtype : str
	"""
	uri = uri.split("#", 1)[0]
	uri = uri.rstrip("/").lower()
	return uri

def addTrailingSlash(path): # XXX: rename?
	"""
	add trailing slash to directory path if not present

	@param path: directory path
	@type  path: str
	@return: directory path
	@rtype : str
	"""
	if path[-1] != "/":
		path = path + "/"
	return path

