"""
wikQuery.py: Wiki searches.

Copyright (C) 2007,2008 Frank McIngvale

Contact: fmcingvale@boodebr.org

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
"""

WikklyQueryAllFields = ['Name', 'Author', 'Content', 'Tags']

class WikklyQueryBase(object):
	"""
	Abstract base class. All query types are subclassed from this.
	"""
	def fieldjoin(self, item, fields):
		"Return combined text of the named fields."
		from wikklytext.store import tags_join
		j = u''
		if 'Name' in fields:
			j += u' ' + item.name
		
		if 'Author' in fields:
			j += u' ' + item.author
			
		if 'Content' in fields:
			j += u' ' + item.content
			
		if 'Tags' in fields:
			j += u' ' + tags_join(item.tags)
			
		return j
		
import re

class WikklyQueryWords(WikklyQueryBase):
	"""
	Query by performing a word search.
	
	'words' is the list of words.
	Set *ONE* of the 'op_' args to True:
		op_and: Require ALL words to match.
		op_or: Require ANY of the words to match.
		
	'no_case' = True/False to make search case-insensitive.
	"""
	def __init__(self, words, op_and=False, op_or=False, no_case=True, fields=WikklyQueryAllFields):
		self.words = words
		self.fields = fields
		self.op_and = op_and
		self.op_or = op_or
		self.no_case = no_case
	
	def explain(self):
		"Return a text description of self as wikitext."
		d = u''
		if self.op_and:
			d += u"Searched for ''all'' of the words: "
		elif self.op_or:
			d += u"Searched for ''any'' of the words: "
		else:
			return u'@@ERROR - Bad query@@'
			
		words = [('"%s"' % w) for w in self.words]
		d += u", ".join(words)
		d += u"<br>"
		
		fields = [('"%s"' % f) for f in self.fields]
		d += u"In fields: %s<br>" % (u", ".join(fields))
		
		if self.no_case:
			d += u"//Case ''insensitive''//"
		else:
			d += u"//Case ''sensitive''//"
			
		return d
		
	def match(self, item):
		joined = self.fieldjoin(item, self.fields)
		if self.no_case:
			joined = joined.lower()
			
		#print "WORD SEARCH in JOINED",repr(joined)
		#print "AND: %s, OR: %s" % (str(self.op_and), str(self.op_or))
		
		if not self.op_and and not self.op_or:
			return False # assumed fail if no-op given
			
		for word in self.words:
			if self.no_case:
				word = word.lower()
				
			#print "WORD",word
			if self.op_and and joined.find(word) < 0:
				#print "FAILED 'AND'"
				return False # one failed to match
			elif self.op_or and joined.find(word) >= 0:
				#print "PASSED 'OR'"
				return True # one matched
			
		if self.op_and:
			#print "PASSED 'AND'"
			return True # all matched
		else: # only other option is op_or from logic above
			#print "FAILED 'OR'"
			return False # none matched
			
class WikklyQueryRegex(WikklyQueryBase):
	"""
	Query store using a regular expression.
	
	'regex' is the raw (uncompiled) regular expression.
	'fields' are the field names to include in the search.
	're_flags' are the 're.compile()' flags if you want to set your own.
	"""
	def __init__(self, regex, fields=WikklyQueryAllFields, re_flags=re.M|re.I):
		self.regex = re.compile(regex, re_flags)
		self.fields = fields
		
	def match(self, item):
		if self.regex.search(self.fieldjoin(item, self.fields)):
			return True
		else:
			return False
		
#------------------------------------------------------------
# Internal API - used by various stores
#------------------------------------------------------------

def generic_query_store(store, query):
	"""
	Run the specified query on the store, returning a list
	of matching items. This is for use by stores that don't
	want to provide a more optimized version.
	"""
	return [item for item in store.getall() if query.match(item)]
	
	
