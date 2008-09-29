"""
The wikStore encapsulates various methods of loading, storing and rendering wikitext.
Rendering is part of the wikStore interface to allow caching to be implemented as part
of the store.

The WikklyItem is the object passed to/from the wikStore.

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

import os
import datetime as DT

class WikklyDateTime(object):
	"""
	This is the timestamp object used for WikklyItems (item.ctime and
	item.mtime). Always use the public interface in case the underlying
	implementation changes.
	"""
	# Implementation note: datetimes are handled internally in UTC and
	# saved/loaded from the store in UTC (to match TW's handling)
	def __init__(self, from_store=None, from_localtime=None):
		"""
		from_store: If given, a string in store format to set time from.
		from_localtime: If given, a datetime in localtime to set time from.
		
		It is an error to specify more than one of the from_* flags.
		
		If none given, time is not initially set - you must call one
		of the from_* functions to set it.
		"""
		# sanity
		if len(filter(lambda x: x is not None, [from_store, from_localtime])) > 1:
			raise Exception("You can only pass one from_* flag here.")
			
		# get current time as local & UTC and compute my offset.
		# I only care about adjusting for hours & minutes, so loop
		# until seconds don't change (to avoid missing a clock tick
		# between the calls to now() and utcnow())
		
		n = 100 # give up after 100 loops so I don't hang
		while n > 0:
			local = DT.datetime.now()
			utc = DT.datetime.utcnow()
			if local.second == utc.second:
				break
					
			n -= 1
		
		# generally this will take 1 try
		#print "GOT UTC offset in %d tries" % (100-n+1)
		
		# zero out other fields
		local = DT.datetime(local.year, local.month, local.day, local.hour)	
		utc = DT.datetime(utc.year, utc.month, utc.day, utc.hour)
		
		self.utcofs = local - utc
		
		# if given initial time, set self now
		if from_store is not None:
			self.from_store(from_store)
			
		if from_localtime is not None:
			self.from_localtime(from_localtime)
			
		# else leave .utc undefined so an error will occur if caller forget to set

	def __cmp__(self, other):
		if self.utc is None or other.utc is None:
			raise Exception("Trying to compare invalid WikklyDateTimes")
			
		return cmp(self.utc, other.utc)
		
	def to_display(self):
		"""
		Return self as a string for display.
		
		This value is *NEVER* reparsed so feel free to
		change this to whatever format you like.
		"""
		return self.to_localtime().strftime("%d %B %Y")
	
	def to_YMD(self):
		"""
		Return just 'YYYYMMDD' portion (in localtime)
		"""
		return self.to_localtime().strftime('%Y%m%d')
		
	def to_localtime(self):
		"""
		Return self as a datetime object in local time.
		"""
		return self.utc + self.utcofs
		
	def from_localtime(self, dt=None):
		"""
		Set self from a datetime object in local time.
		"""
		if dt is None:
			dt = DT.datetime.now()
			
		self.utc = dt - self.utcofs
		
	def from_utc(self, dt):
		"""
		Set self from a datetime object in UTC
		
		(Mainly for test purposes, but nothing wrong with using it.)
		"""
		self.utc = dt
		
	def to_store(self):
		"""
		Return self as a string ready to be placed in the store.
		"""
		# must be in this format to remain compatible with TiddlyWiki
		return self.utc.strftime('%Y%m%d%H%M')
		
	def from_store(self, sstr):
		"""
		Set self from a time string retrieved from the store.
		"""
		if len(sstr) != 12:
			raise Exception("Expecting YYYYMMDDHHMM")
			
		# TW has some botched datetime strings, so take apart
		# and handle a piece at a time
		year = int(sstr[0:4])
		month = int(sstr[4:6])
		# adjust year if month out of range
		while month > 12:
			month -= 12
			year += 1
			
		dout = DT.datetime(year, month, 1)
		#print "DOUT NOW",dout
		day = int(sstr[6:8])
		# add days to dout in case out of range for month
		# (day currently == 1, so subtract 1 here)
		dout += DT.timedelta(days=day-1)
		
		#print "DOUT NOW",dout
		
		hour = int(sstr[8:10])
		# like days, add hours in case out of range
		dout += DT.timedelta(hours=hour)	
		
		#print "DOUT NOW",dout
		
		minute = int(sstr[10:12])
		# ditto for minutes
		dout += DT.timedelta(minutes=minute)
	
		#print "DOUT NOW",dout
		self.utc = dout
		
	def from_file_mtime(self, filename):
		"""
		Set self from the mtime of a file.
		
		It is assumed that os.stat(filename) returns local times.
		"""
		import stat
		self.from_localtime(DT.datetime.fromtimestamp(os.stat(filename)[stat.ST_MTIME]))

	def from_file_ctime(self, filename):
		"""
		Set self from the ctime of a file.
		
		It is assumed that os.stat(filename) returns local times.
		"""
		import stat
		self.from_localtime(DT.datetime.fromtimestamp(os.stat(filename)[stat.ST_CTIME]))

	def to_rfc822(self):
		"""
		Return self as an RFC822 compliant string.
		"""
		return self.utc.strftime('%a, %d %b %Y %H:%M:%S +0000')
		
def tags_split(tagstring):
	"""
	Take a string like "One Two [[Three Four]] FiveSix" and
	split and return as list of strings.
	
	This also works to split things like DefaultTiddlers that
	use a similar wordlist.
	"""
	import re
	#print "TAGS SPLIT",repr(tagstring)
	# allow multiline text by replacing EOLs so this same code can
	# work with DefaultTiddlers, etc.
	tagstring = tagstring.replace('\n',' ').replace('\r',' ')	
	# first, separate out the '[[..]]' tags
	r = re.compile(r'\[\[(.+?)\]\]')
	parts = r.split(tagstring)
	# parts = [text, '[[..]]', text, '[[..]]', text]
	tags = []
	text = 1
	for p in parts:
		if text: # a space-seperated list of tags
			tags += p.split()
			text = 0
		else: # the inner part of [[..]]
			tags.append(p)
			text = 1
	
	#print "TAGS RETURN",tags
	
	return tags
			
def tags_join(tags):
	"""
	Take a list of tags (e.g. from tags_split) and rejoin them.
	"""
	import re
	
	parts = []
	for t in tags:
		 # if it contains space, place inside [[ .. ]]
		if re.search(r'\s', t):
			parts.append(u'[[%s]]' % t)
		else:
			parts.append(t)
			
	return u' '.join(parts)
	
def makeFSname(name):
	"""
	Given a WikklyItem name, convert it to a name that can
	safely be used as a filename (across platforms).
	
	Returns filename (basename only - no extension or path).
	"""
	#print "CALC STORED NAME",repr(name)

	# convert to plain ASCII, replacing bad chars
	if isinstance(name,unicode):
		name = name.encode('ascii','replace')
		
	# invalid under (at least) win32: \/:*?"<>|
	for c in '\\/*?<>|':
		name = name.replace(c, '_')
		
	# replace all with '_' except these two ...
	name = name.replace('"', "'")
	name = name.replace(':', "-")
	
	# other problem chars
	name = name.replace('\n', '_').replace('\r','_')
	
	#print "NAME OUT",repr(name)
	return name

def detect(path):
	"""
	Detect all WikklyText/TiddlyWiki content in the given directory,
	returning a list of wikStore_* instances to handle it.
	
	Returns [] if no content found.
	
	Does NOT recurse subdirectories.
	"""
	import wikStore_files, wikStore_sqlite, wikStore_tw_re
	instances = []
	detectors = [wikStore_files.detect, wikStore_sqlite.detect, wikStore_tw_re.detect]
	searchlist = [path]
	if os.path.isdir(path):
		searchlist += [os.path.join(path,n) for n in os.listdir(path)]
		
	for full in searchlist:
		instances += [d(full) for d in detectors]
		
	# remove Nones
	instances = [i for i in instances if i is not None]
			
	return instances

class WikklyItem(object):
	"""
	A WikklyItem represents a single piece of raw (unrendered) wikitext content.
	"""
	def __init__(self, name, content=u'', tags=None, author=None,  
				ctime=None, mtime=None, 
				content_type='WikklyText', revision=None):
		# For ALL text members: Text has already been decoded/unescaped.
		
		# sanity checks
		assert(ctime is None or isinstance(ctime, WikklyDateTime))
		assert(mtime is None or isinstance(mtime, WikklyDateTime))
		
		# name/title of this item (not filename)
		self.name = name        
		# author of this item (unicode)
		self.author = author or u'Unknown'     
		# creation time (WikklyDateTime)
		self.ctime = ctime or WikklyDateTime(from_localtime=DT.datetime.now())
		# modification time (WikklyDateTime)
		self.mtime = mtime or WikklyDateTime(from_localtime=DT.datetime.now())   
		# tags (list of unicode strings)
		self.tags = tags or []        
		
		# wikitext content as unicode.
		self.content = content   

		# Remember where wikitext came from, since different flags need to
		# be set to render each correctly with the WikklyText engine.
		#
		# Valid types:
		#   'WikklyText': Native WikklyText.
		#   'TiddlyWiki': Wikitext from TiddlyWiki HTML file.
		self.content_type = content_type

		# a store-specific 'revision' number (set to None if not used for store)
		# (this does NOT imply any ability to go back to a previous revision!)
		self.revision = revision

	def tag_add(self, tag):
		"Add a tag to item, if not already present."
		if tag not in self.tags:
			self.tags.append(tag)
				
	def tag_del(self, tag):
		"Remove a tag from item, if present."
		if tag in self.tags:
			del self.tags[self.tags.index(tag)]
		
	def tag_toggle(self, tag):
		"Toggle a tag on/off."
		if tag in self.tags:
			self.tag_del(tag)
		else:
			self.tag_add(tag)
		
	def digest(self, extra=''):
		"""
		Generate and return a hexdigest (string) for item. Includes all metadata.
		
		Caller can pass 'extra' string to include any other metadata that
		needs to be including in digest. ('extra' must be a bytestring)
		"""
		from boodebr.util import makeSHA
		d = makeSHA()
		d.update(extra)
		d.update(self.name.encode('utf-8'))
		d.update(self.author.encode('utf-8'))
		d.update(self.ctime.to_store())
		d.update(self.mtime.to_store())
		d.update(u''.join(self.tags).encode('utf-8'))		
		d.update(self.content.encode('utf-8'))
		d.update(self.content_type.encode('utf-8'))
		d.update(str(self.revision).encode('utf-8'))
		return d.hexdigest()
		
	def __getstate__(self):
		from copy import copy
		d = copy(self.__dict__)
		# only pickle to the resolution that I'm storing, for clarity
		d['ctime'] = self.ctime.to_store()
		d['mtime'] = self.mtime.to_store()
		return d
		
	def __setstate__(self, state):
		from copy import copy
		for k,v in state.items():
			self.__dict__[k] = v
			
		self.ctime = WikklyDateTime(from_store=self.ctime)
		self.mtime = WikklyDateTime(from_store=self.mtime)
		
	def __str__(self):
		s =  u'WikklyItem:\n'
		s += u'-----------\n'
		s += u'Name: %s\n' % repr(self.name)
		s += u'Author: %s\n' % repr(self.author)
		s += u'Created: %s\n' % self.ctime.to_display()
		s += u'Modified: %s\n' % self.mtime.to_display()
		s += u'Tags: %s\n' % repr(self.tags)
		s += u'Content-type: %s\n' % self.content_type
		s += u'Revision: %s\n' % self.revision
		s += u'Content:\n%s\n' % repr(self.content)
		return s

