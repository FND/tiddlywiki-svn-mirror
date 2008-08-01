def normalizeURI(uri):
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

