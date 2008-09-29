"""
wikklytext.wiki.core: Core wiki functionality.

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

from boodebr.config import *
import os, sys
from wikklytext.store import WikklyItem, makeFSname
from boodebr.util import makeSHA
from wikklytext.port import *

def nopfunc(*args, **kwargs):
	pass

# root directory for config files (subdir of wiki path)
WIKIROOT = '.wik'

# wiki settings are stored here (relative to WIKIROOT)
CONFNAME = 'conf'
ROOTKEY = 'WikklyWikiConfig'

# cache of rendered texts is stored in the subdir
RENDERCACHE = 'rendercache'

# valid users are stored here (relative to WIKIROOT)
USERDB = 'users'
USERDBKEY = 'WikiUsers'

class WikklyRenderCacheStats(object):
		def __init__(self):
			
			self.nr_renders = 0   # total number of renders items (cached + uncached)
			
			self.nr_tried_cache = 0     # nr times I looked in the cache
			self.nr_cache_hits = 0      # nr of items found in cache
			
			self.bytes_cached_in = 0    # bytes of wikitext found in cache
			self.bytes_cached_out = 0   # bytes of HTML served from cache
			
			self.bytes_uncached_in = 0  # bytes of wikitext not found in cache
			self.bytes_uncached_out = 0 # bytes of HTML not served from cache
			
			self.secs_uncached = 0   # seconds spent processing uncached items
			self.secs_cached = 0     # seconds spent processing cached items
			
		def addstat(self, tried_cache, cache_hit, bytes_in, bytes_out, secs):
			"""
			Add run statistics to the total:
				tried_cache: True/False if I looked in the cache
				cache_hit: True/False if item was found in cache
				bytes_in: Size of wikitext
				bytes_out: Size of rendered HTML
				secs: Processing time
			"""
			self.nr_renders += 1
			cached = tried_cache and cache_hit
			
			if tried_cache:
				self.nr_tried_cache += 1
				
			if cached:
				self.nr_cache_hits += 1
				self.bytes_cached_in += bytes_in
				self.bytes_cached_out += bytes_out
				self.secs_cached += secs
			else:
				self.bytes_uncached_in += bytes_in
				self.bytes_uncached_out += bytes_out
				self.secs_uncached += secs
				
class WikklyWiki(object):
	def __init__(self, path):
		self.path = path
		
		# These do NOT automatically create file, so can go ahead
		# and create them here but not use till I'm sure I should
		self.cfg = configfile(os.path.join(path,WIKIROOT,CONFNAME))
		self.userdb = configfile(os.path.join(path,WIKIROOT,USERDB))
		self.cache_stats = WikklyRenderCacheStats()
		
		self.baseurl = ''
		
	def get_path(self):
		return self.path
		
	def get_css_path(self):
		"Where are my CSS files stored?"
		return os.path.join(self.get_path(), 'css')

	def metadata_dbname(self):
		return os.path.join(self.confdir(), 'wikidata.db')

	def fpath(self, name):
		return os.path.join(self.get_path(), name)
		
	def setRT_baseurl(self, url):
		"""
		Inform wiki of its base URL in the runtime environment.
		
		For example, if 'index.html' of the wiki is served as:
			http://MYSITE.COM/MY/PATH/index.html
			
		Then set baseurl='http://MYSITE.COM/MY/PATH'.
		
		This value is *NOT* saved permanently, it exists only as
		long as this instance does.
		"""
		self.baseurl = url
		
	def getRT_baseurl(self):
		return self.baseurl
		
	#--------------------------------------------------------------
	# User-defined settings (in CONFNAME)
	#--------------------------------------------------------------
	def initted(self):
		"Has the wiki been initted?"
		return os.path.isfile(os.path.join(self.get_path(),WIKIROOT,CONFNAME))

	def confdir(self):
		return self.fpath(WIKIROOT)
		
	def do_init(self):
		"Create my directory structure."
		if not os.path.isdir(self.confdir()):
			os.makedirs(self.confdir())
			
	def set_kind(self, kind):
		"One of {text, tiddlywiki, sqlite}."
		assert(kind in ('text','tiddlywiki','sqlite'))
		self.cfg.set_str(ROOTKEY, 'kind', kind)

	def get_kind(self):
		return self.cfg.get_str(ROOTKEY, 'kind', None)
	
	def set_filename(self, name):
		"""
		For kind={tiddlywiki|sqlite}, the filename to use for storage.
		This sets the basename only, in case you are running from
		another location.
		"""
		self.cfg.set_str(ROOTKEY, 'filename', os.path.basename(name))

	def get_filename(self):
		"""
		For kind={tiddlywiki|sqlite}, the filename to use for storage.
		Returns the full path, in case you are running from another location.
		"""
		name = self.cfg.get_str(ROOTKEY, 'filename', None)
		if name is not None:
			name = os.path.join(self.get_path(), name)
			
		return name
		
	def set_server_addr(self, addr):
		self.cfg.set_str(ROOTKEY+'/wikserve', 'address', addr)
	
	def get_server_addr(self):
		return self.cfg.get_str(ROOTKEY+'/wikserve', 'address', '127.0.0.1')
	
	def set_server_port(self, port):
		self.cfg.set_int(ROOTKEY+'/wikserve', 'port', port)
	
	def get_server_port(self):
		return self.cfg.get_int(ROOTKEY+'/wikserve', 'port', '8080')
	
	def get_session_storage(self):
		return self.cfg.get_str(ROOTKEY+'/wikserve', 'session_storage', 'ram')		
	
	def set_session_storage(self, kind):
		"kind = 'ram' or 'file'"
		assert(kind in ('ram', 'file'))
		return self.cfg.set_str(ROOTKEY+'/wikserve', 'session_storage', kind)		
	
	def get_session_timeout(self):
		"Get session timeout, in minutes."
		return self.cfg.get_int(ROOTKEY+'/wikserve', 'session_timeout', 60)
	
	def set_session_timeout(self, timeout):
		"Set session timeout, in minutes."
		return self.cfg.set_int(ROOTKEY+'/wikserve', 'session_timeout', timeout)
	
	def get_debug_flag(self):
		"Is the 'debug' flag set? (allowing access to debug commands)"
		return self.cfg.get_bool(ROOTKEY+'/wikserve', 'debug_flag', False)
		
	def set_debug_flag(self, value):
		self.cfg.set_bool(ROOTKEY+'/wikserve', 'debug_flag', value)
	
	def get_skiplist(self):
		from wikklytext.wiki.render import get_item_skiplist
		return get_item_skiplist(self)

	def set_skiplist(self, namelist):
		from wikklytext.store import tags_join
		
		if 'DoNotRender' not in namelist:
			namelist.append('DoNotRender')
			
		item = WikklyItem('DoNotRender', tags_join(namelist), author='AutoContent')
		self.store().saveitem(item)

	# These next two provide a hook for the external caller to record updates
	# they have performed on the wiki. It is entirely up to the caller to define
	# what these updates mean. This is just for getting/recording them by name.
	def get_applied_updates(self):
		"""
		Get the set of updates that have been applied. 
		(The meaning of the updates is defined by the caller.)
		"""
		return set_(self.cfg.get_list(ROOTKEY, 'applied_updates', []))
		
	def add_applied_update(self, name):
		"""
		Add an update to the set of applied updates.
		(The meaning of the updates is defined by the caller.)
		"""
		s = self.get_applied_updates()
		s.add(name)
		self.cfg.set_list(ROOTKEY, 'applied_updates', list(s))
		
	#----------------------------------------------------------------
	# Wiki users (stored in USERDB)
	#
	# Users are identified by one of the following strings (in
	# WikklyItem.author):
	#    "0"            - UID for wiki admin/superuser. Look up name,
	#                     password, privs, etc. in USERDB.
	#    Other string   - Look up in USERDB. If exists, use name, password,
	#                     privs, etc. for user. If not found, assume 
	#                     non-priviledged user and show name as-is in rendered content.
	#
	# Most user_* routines take a UID to provide unambiguous lookup
	# in case of duplicate usernames.
	#----------------------------------------------------------------
	def user_create(self, UID, username, email, can_login, password, safe_mode):
		"""
		Create a new user:
			UID: UID for user:
			       Pass "0" for superuser.
				   For normal users, this can be any other string.
				   In a multiuser/multithreaded setting, it is strongly recommended that
				   you generate UIDs with boodebr.util.guid.makeGUID().
				   In a single-threaded setting, you can pass anything for UID,
				   just make sure it is not already used (with user_valid_UID()).
			username: User name
			email: Email address
			can_login: True/False - is this user allowed to login?
			password: Plaintext password (only used if can_login is True)
			safe_mode: True/False if this user's content should be
			           rendered in safe mode.
					   
		Returns True if created OK.
		Returns False if not (username already exists).
		"""
		# The code below tries to not create a duplicate username, but
		# it could still be possible in a race condition. However, the two users 
		# will still have separate UIDs, so its just an issue on how they log in.
		
		# check before creating
		if self.user_exists(username):
			return False
		
		self.userdb.set_str(USERDBKEY+'/'+UID, 'username', username)
		self.userdb.set_str(USERDBKEY+'/'+UID, 'email', email)
		
		if can_login:
			self.userdb.set_str(USERDBKEY+'/'+UID, 'pwdhash', makeSHA(password).hexdigest())
		else: # set to impossible hash value to prevent user from logging in
			self.userdb.set_str(USERDBKEY+'/'+UID, 'pwdhash', '')
			
		self.userdb.set_bool(USERDBKEY+'/'+UID, 'safe_mode', safe_mode)

		# check again after creating
		if len(self.user_getUIDs(username)) > 1:
			# >1 UID with my username; delete self and try again
			self.userdb.delete_path(USERDBKEY, UID)
			return False
			
		# created OK
		return True

	def user_all_UIDs(self):
		"""
		Return a list of all UIDs in userdb.
		"""
		return self.userdb.list_paths(USERDBKEY)
		
	def user_valid_UID(self, UID):
		"Does the given UID exist?"
		return UID in self.user_all_UIDs()
		
	def user_getUIDs(self, username):
		"""
		Return all UIDs associated with username (normally only zero or one, 
		but caller should assume that more than one is possible).
		"""
		uids = []
		for uid in self.user_all_UIDs():
			if self.userdb.get_str(USERDBKEY+'/'+uid, 'username', None) == username:
				uids.append(uid)
				
		return uids
		
	def user_exists(self, username):
		"Convenience: Does the given username exist?"
		return len(self.user_getUIDs(username)) > 0
	
	def user_set_username(self, UID, username):
		"Set user's username."		
		self.userdb.set_str(USERDBKEY+'/'+UID, 'username', username)
	
	def user_get_username(self, UID):
		"""
		Try to lookup username given a UID.
		
		If invalid UID given, returns UID as-is.
		"""
		# do NOT do lookup without verifying it is a valid UID.
		# this prevents creating empty users when looking up
		# non-UIDs.
		if not self.user_valid_UID(UID):
			return UID
			
		return self.userdb.get_str(USERDBKEY+'/'+UID, 'username', None)
	
	def user_set_password(self, UID, password):
		"Set user's password to given (cleartext) password."		
		self.userdb.set_str(USERDBKEY+'/'+UID, 'pwdhash', makeSHA(password).hexdigest())
	
	def user_set_email(self, UID, email):
		"Set user's email address."		
		self.userdb.set_str(USERDBKEY+'/'+UID, 'email', email)
	
	def user_get_email(self, UID):
		uids = self.user_all_UIDs()
		if UID not in uids:
			return None
			
		return self.userdb.get_str(USERDBKEY+'/'+UID, 'email', None)
			
	def user_set_safemode(self, UID, safe_mode):
		"Set True/False if user's content should render in safe mode."		
		self.userdb.set_bool(USERDBKEY+'/'+UID, 'safe_mode', safe_mode)
	
	def user_get_safemode(self, UID):
		"Return True/False if users content should be rendered in 'safe' mode."
		uids = self.user_all_UIDs()
		if UID not in uids:
			return True # use safe mode for any unknown users
		
		return self.userdb.get_bool(USERDBKEY+'/'+UID, 'safe_mode', True)
	
	def user_can_login(self, UID):
		"Is the given user allowed to login (assuming they know the username/password)?"
		return len(self.userdb.get_str(USERDBKEY+'/'+UID, 'pwdhash', None)) > 0
		
	def user_check_password(self, UID, password):
		"""
		Check a users password (given plaintext password).
		
		Returns True if matches, False if not.
		"""		
		s = self.userdb.get_str(USERDBKEY+'/'+UID, 'pwdhash', None)
		if s is None:
			return False # no such user
			
		return makeSHA(password).hexdigest() == s
			
	# Convenience - bring these up from the wikStore
	def names(self):
		"""
		Return names of all content items in store as a list of strings.
		"""
		return self.store().names()
		
	def getitem(self, name):
		"""
		Load a single content item from the store.
		
		Returns WikklyItem, or None if item not found.
		
		NOTE: If you are looping over all items, you should
		use getall() instead of getitem() since it is a lot
		faster for some store types.
		"""
		return self.store().getitem(name)
		
	def getall(self):
		"""
		Load all content from store.
		
		Returns list of WikklyItems.
		"""
		return self.store().getall()
		
	def saveitem(self, item, oldname=None):
		"""
		Save a WikklyItem to the store.
		
		If oldname != None, passed item replaces the item of the given name.
		Notes:
			* Passing oldname=None is the way to store a new item, or
			  overwrite an existing item.
			* Passing oldname=item.name is the same as passing oldname=None
		"""
		self.store().saveitem(item, oldname)
		
	def search(self, query):
		"Return a list of items matching query."
		return self.store().search(query)
		
	# cache
	def cache_clear_all(self):
		import shutil
		shutil.rmtree(self.rendercache())
		
	def rendercache(self):		
		"Creates rendercache dir, so only call when you are ready to write to it!"
		d = os.path.join(self.confdir(),RENDERCACHE)
		if not os.path.isdir(d):
			os.makedirs(d)
			
		return d
		
	# cache stats (set by renderer)
	def cache_get_stats(self):
		return self.cache_stats
		
	def cache_set_stats(self, st):
		self.cache_stats = st
		
	def reserved_names(self):
		"""
		Names reserved by renderer and cannot be used as
		item names by user.
		"""
		return set_(['DoNotRender','index','index-Names','index-Tags',
					'index-Timeline'])
					
	def renderable_items(self, logfunc=nopfunc):
		"""
		Return a list of all renderable items in the store.
		
		Returns list of:
			(item, html_name)
		"""
		items = []
		skipset = set_(self.get_skiplist())
		regen_all = False
		
		# much faster to use getall() for some store types
		for item in self.store().getall():
			if item.name in skipset:
				# ignore item
				continue
			
			if item.name in self.reserved_names():
				print "*** WARNING - Name '%s' is reserved by WikklyText. Will not render." % item.name
				continue
				
			# make HTML filename
			if item.name == 'DefaultTiddlers':
				fsname = self.fpath('index.html')
			else:
				fsname = self.fpath(makeFSname(item.name) + '.html')
			
			items.append((item, fsname))
		
		# if DefaultTiddlers does not exist, make empty one
		allnames = [i[0].name for i in items]
		if 'DefaultTiddlers' not in allnames:
			d = WikklyItem('DefaultTiddlers')
			items.append((d, self.fpath('index.html')))
		
		return items
		
	def render(self, namelist=None, uid=None, logfunc=nopfunc):
		"""
		Can pass namelist to only render a certain set of items.
		   namelist=None means to render ALL items and indexes.
		   
		   namelist can include special names like 'index', 'index-Timeline', etc.,
		   to render the indexes.
		   
		uid, if given, is the logged-in UID (for customizing display)
		None means no logged-in user.
		
		All items are rendered to memory and returned as a map of:
			map[item_name] = (fsname, rendered_html)
			
		Where 'fsname' is the full path name (if the caller wants to save
		the rendered file). 'rendered_html' is the HTML, ready to be served.
		"""
		from wikklytext.wiki.layout import layoutPage, layoutTimelinePage, \
				layoutNameIndexPage, layoutTagIndexPage  
		from time import time
		
		rendered = {}
		
		# turn 'index' into 'DefaultTiddlers'
		if namelist is not None:
			try:
				i = namelist.index('index')
				namelist[i] = 'DefaultTiddlers'
				replaced_index = True
			except ValueError:
				replaced_index = False
		else:
			replaced_index = False
			
		logfunc("Info: ")
		logfunc(self.store().info())
		logfunc("Rendering ...")
		for item,fsname in self.renderable_items(logfunc):
			# if caller provided a namelist, and item.name not in it, skip
			if namelist is not None and item.name not in namelist:
				continue
		
			t0 = time()		
			logfunc("   Rendering %s ..." % os.path.basename(fsname))
			html = layoutPage(self, item, uid)
			t1 = time()
			
			#sys.stdout.write("\b\b\b %.1f secs\n" % (t1-t0))
			#t0 = time()
			# turn 'DefaultTiddlers' into 'index' as needed
			if item.name == 'DefaultTiddlers' and replaced_index:
				rendered['index'] = (fsname, html) # caller asked for 'index' not 'DefaultTiddlers'
			else:
				rendered[item.name] = (fsname, html)
				
			#t1 = time()
			#print "\b\b\b %.1f secs  " % (t1-t0)
		
		# NOTE: Don't change the names of the index-* files without
		# changing the URLResolved in wiki/render.py also.
		
		# write timeline index
		if namelist is None or 'index-Timeline' in namelist:
			logfunc("   Writing timeline index")
			html = layoutTimelinePage(self, uid)
			rendered['index-Timeline'] = (self.fpath('index-Timeline.html'), html)
			
		# write name index
		if namelist is None or 'index-Names' in namelist:
			logfunc("   Writing name index")
			html = layoutNameIndexPage(self, uid)
			rendered['index-Names'] = (self.fpath('index-Names.html'), html)
			
		# write tag index
		if namelist is None or 'index-Tags' in namelist:		
			logfunc("   Writing tag index")
			html = layoutTagIndexPage(self, uid)
			rendered['index-Tags'] = (self.fpath('index-Tags.html'), html)
		
		return rendered
		
	def store(self, logfunc=nopfunc):
		"Open and return my wikStore."
		if hasattr(self, '_my_store'):
			return self._my_store
			
		from wikklytext.store.wikStore_Q import wikStore_Q
		
		# note: do NOT cache results - this causes errors in wikStore_sqlite when
		# multiple threads try and access the same connection
		#from wikklytext.store import wikStore_files, wikStore_sqlite, wikStore_tw
	
		if not self.initted():
			raise Exception("** No wiki here - run 'wik init' first.")
			
		kind = self.get_kind()
		if kind == 'text':
			logfunc("OPENING STORE (%s,%s)" % (kind, self.get_path()))
			store = wikStore_Q('text', self.get_path())
		elif kind == 'tiddlywiki':
			logfunc("OPENING STORE (%s,%s)" % (kind, self.get_filename()))
			store = wikStore_Q('tiddlywiki', self.get_filename())
		elif kind == 'sqlite':
			logfunc("OPENING STORE (%s,%s)" % (kind, self.get_filename()))
			store = wikStore_Q('sqlite', self.get_filename())
		else:
			raise Exception("Bad kind")

		self._my_store = store
		return store
	
	def itemname_from_fsname(self, fsname):
		"""
		Given a fsname (from makeFSname, i.e. no extension), return the 
		corresponding item name, or None if not found.
		"""
		# check special names
		if fsname in ['index','index-Names','index-Tags','index-Timeline']:
			return fsname
			
		for item in self.store().getall():
			if makeFSname(item.name) == fsname:
				return item.name
				
		return None
	
