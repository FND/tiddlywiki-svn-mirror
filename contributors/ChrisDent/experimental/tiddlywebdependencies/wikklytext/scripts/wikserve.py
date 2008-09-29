"""
wikklytext.scripts.wikserve: WikklyWiki server.

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

import cherrypy, os, sys
from cherrypy.lib.static import serve_file
from cherrypy import HTTPRedirect, HTTPError
from wikklytext.wiki import WikklyWiki
from wikklytext.store import tags_split, makeFSname, WikklyItem, WikklyDateTime
import time
from urllib import urlencode
from wikklytext.util import get_CSS_element_names, load_CSS_element
from wikklytext.wiki.layout import layoutAdminPage, layoutDeleteItem, layoutEditItem, \
		layoutEditUser, layoutLoginPage, layoutErrorPage, layoutSearchResults, \
		layoutLogRecentHits, layoutLogHitsByPage, layoutDebugPage, layoutNeedUpdateMeta, \
		layoutLogHitsByDates
from boodebr.util import makeGUID
import wikklytext.wiki.metadata as metadata

# split cherrypy version number for later use.
# __version__ is assumed to be a string of "MAJOR.MINOR.UNUSED"
CPY_VER = tuple([int(s) for s in cherrypy.__version__.split('.')[:2]])

class wikklyserve(object):
	def __init__(self, path):
		"Serve wiki living in 'path'"
		self.wiki = WikklyWiki(path)
		self.wiki_needs_update = metadata.wiki_needs_update(self.wiki)
		# do not try to open metadb until after server is running.
		# (thread will not be running until engine starts)
		self.metadb = None	
	
	"""
	** IMPLEMENTATION NOTE **
	
	ALL requests go through default(), to simplify security & logging.
	
	DO NOT add any more .exposed methods without thinking carefully about
	the implications of changing this.
	"""
	
	def ensure_metadb(self):
		if self.metadb is None:
			self.metadb = metadata.opendb(self.wiki.metadata_dbname())		
	
	def initted(self):
		return self.wiki.initted()
		
	def sessiondir(self):
		return os.path.join(self.wiki.confdir(), 'sessions')
		
	def server_addr(self):
		return self.wiki.get_server_addr()
	
	def server_port(self):
		return self.wiki.get_server_port()
	
	def session_storage(self):
		return self.wiki.get_session_storage()

	def session_timeout(self):
		return self.wiki.get_session_timeout()
		
	def fpath(self, *names):
		return os.path.join(self.wiki.get_path(), *names)

	def get_css_path(self):
		return self.wiki.get_css_path()
		
	def index(self):
		return self.default('index.html')		
		
	index.exposed = True

	def redirect_to_name(self, itemname):
		"Redirect to an item, by name."
		if itemname == 'DefaultTiddlers':
			fsname = makeFSname('index') + '.html'
		else:
			fsname = makeFSname(itemname) + '.html'
				
		raise HTTPRedirect(fsname)
		
	def handle_cmd(self, args, kwargs):
		'All requests for "DoServerCmd" are passed here.'
		if args[0] != 'DoServerCmd.html':
				return ''
				
		cmd = kwargs.get('cmd',None)
		metadata.log_servercmd(self.metadb, cmd, cherrypy.session.get('UID',None), args, kwargs)
		
		if cmd is None:
			return ''				
		if cmd == 'editItem':
			return self.beginEditItem(unicode(kwargs['name'],'utf-8'))
		elif cmd == 'newItem':
			return self.beginEditItem(u'New Item, %s' % time.ctime())
		elif cmd == 'search':
			if len(kwargs['words'].rstrip().lstrip()) == 0:
				return
				
			from wikklytext.store import WikklyQueryWords
			q = WikklyQueryWords(kwargs['words'].split(), op_and=True)
			return layoutSearchResults(self.wiki, q)
			
		elif cmd == 'debug':
			if not self.wiki.get_debug_flag():
				return self.errormsg('The administrator has disabled this command. (It can be enabled on the wiki administration page by turning on the debug flag.)', args, kwargs)
			else:
				return layoutDebugPage(self.wiki)
			
		elif cmd == 'setDebugFlag':
			if self.loginUID() != '0':
				return self.errormsg('Only the root user can set this flag.', args, kwargs)
			
			if kwargs['debug_flag'] == 'on':
				self.wiki.set_debug_flag(True)
			else:
				self.wiki.set_debug_flag(False)
			
			# don't have to restart for flag to take effect
			raise HTTPRedirect('DoServerCmd.html?cmd=admin')
		
		elif cmd == 'admin':
			if self.loginUID() != '0':
				return self.errormsg('Only the root user can access this page. [1]', args, kwargs)
			
			if kwargs.get('need_restart',None) == 'True':
				need_restart = True
			else:
				need_restart = False
				
			return layoutAdminPage(self.wiki, self.loginUID(), need_restart)
			
		elif cmd == 'logRecentHits':
			logtype = kwargs.get('type',None)
			if self.loginUID() != '0':
				return self.errormsg('Only the root user can access this page. [2]', args, kwargs)
			
			return layoutLogRecentHits(self.wiki, self.metadb, logtype)
			
		elif cmd == 'logHitsByPage':
			if self.loginUID() != '0':
				return self.errormsg('Only the root user can access this page. [3]', args, kwargs)
			
			return layoutLogHitsByPage(self.wiki, self.metadb)
			
		elif cmd == 'logHitsByDates':
			if self.loginUID() != '0':
				return self.errormsg('Only the root user can access this page. [5]', args, kwargs)
			
			return layoutLogHitsByDates(self.wiki, self.metadb)
			
		elif cmd == 'setSessionStorage':
			if self.loginUID() != '0':
				return self.errormsg('Only the root user can access this page. [4]', args, kwargs)
				
			self.wiki.set_session_storage(kwargs['storage_type'])
			raise HTTPRedirect('DoServerCmd.html?cmd=admin&need_restart=True')
		
		elif cmd == 'setSessionTimeout':
			if self.loginUID() != '0':
				return self.errormsg('Only the root user can access this page.', args, kwargs)
				
			self.wiki.set_session_timeout(int(kwargs['timeout']))
			raise HTTPRedirect('DoServerCmd.html?cmd=admin&need_restart=True')
		
		elif cmd == 'editUser':
			uid = kwargs['uid']
			if not self.wiki.user_valid_UID(uid):
				uid = None
			
			if uid is None and self.loginUID() != '0':
				return self.errormsg("Only root can create users. [1]", args, kwargs)
				
			if self.loginUID() not in ['0', uid]:
				return self.errormsg("You can only edit your own profile (unless you are root).", args, kwargs)
				
			return layoutEditUser(self.wiki, self.loginUID(), uid)
			
		elif cmd == 'saveUser':
			# note user does NOT have to be logged-in to get here, so be careful
			# about verifying UIDs
			name = kwargs['username']
			if not len(name):
				# no logging
				return layoutErrorPage(self.wiki, "Username not given, try again.", self.loginUID())
				
			email = kwargs['email']
			pA = kwargs['password1']
			pB = kwargs['password2']
			if pA != pB:
				return self.errormsg("Passwords don't match, try again.", args, kwargs)
				
			# only root user can change safe mode -- control won't even be on the
			# page for other users
			if kwargs.has_key('safe_mode') and self.loginUID() == '0':
				if kwargs['safe_mode'] == 'Full':
					safe_mode = False
				else:
					safe_mode = True
				
			uid = kwargs['uid']
			
			if len(uid) == 0:
				# create new UID
				if '0' not in self.wiki.user_all_UIDs():
					# root user doesn't exist -- current user becomes root
					# also, log self in a root so code below will succeed
					metadata.log_setuid(self.metadb, '0', cherrypy.session.get('UID',None), args, kwargs)
					cherrypy.session['UID'] = '0'
					uid = '0'
				else:		
					uid = makeGUID(name)

			if uid == '0':
				safe_mode = False # root must always be in full mode due to autocontent

			# does user already exist, or new user?
			if not self.wiki.user_valid_UID(uid):
				# new user - only root user is allowed to create
				if self.loginUID() != '0':
					return self.errormsg("Non-root users cannot create accounts.", args, kwargs)
					
				if len(pA) == 0:
					# do not log
					return layoutErrorPage(self.wiki, "Password cannot be empty.",
							self.loginUID())
					
				self.wiki.user_create(uid, name, email, can_login=True, 
									password=pA, safe_mode=safe_mode)
									
				# create a default page for user (if doesn't already exist)
				if uid not in self.wiki.names():
					item = WikklyItem(uid, "This is your personal page for any background information you'd like to share.",
								author=uid)
					# set 'norss' flag by default
					item.tag_add('norss')
					self.wiki.saveitem(item)
			else:
				# existing user, update information - must either be logged-in
				# as UID, or be the root user, to do this
				if self.loginUID() not in [uid, '0']:
					return self.errormsg("Users can only edit their own accounts", args, kwargs)
					
				self.wiki.user_set_username(uid, name)
				self.wiki.user_set_email(uid, email)
				# only set new password if user provided it
				if len(pA):
					self.wiki.user_set_password(uid, pA)
					
				# ONLY root user can set safe_mode, but don't raise error since
				# regular user can change above items
				if self.loginUID() == '0':
					self.wiki.user_set_safemode(uid, safe_mode)
				
			self.goto_stored_URL()
			
		elif cmd == 'doLogin':
			name = kwargs['username']
			passwd = kwargs['password']
			
			cherrypy.log.error("GOT DO LOGIN (%s,%s)" % (name, passwd))
			
			uids = self.wiki.user_getUIDs(name)
			if len(uids) > 1:
				# race happened -- need to let user select correct UID
				return "Uh-oh, more than one user has this username. Need code to handle this!"
				
			if len(uids) == 0:
				# do not call self.errormsg() - I need a different message to show up
				# in the logs vs. on the screen
				metadata.log_errormsg(self.metadb, "Bad username (%s,%s)" % (name,passwd), 
							cherrypy.session.get('UID',None), args, kwargs)
				# don't tell user whether username exists or not
				return layoutErrorPage(self.wiki, "Bad login", self.loginUID())
			elif not self.wiki.user_check_password(uids[0], passwd):
				# as above, do not call self.errormsg()
				metadata.log_errormsg(self.metadb, "Bad password (%s,%s)" % (name,passwd), 
							cherrypy.session.get('UID',None), args, kwargs)
				return layoutErrorPage(self.wiki, "Bad login", self.loginUID())				
			else:
				metadata.log_setuid(self.metadb, uids[0], cherrypy.session.get('UID',None), args, kwargs)					
				cherrypy.session['UID'] = uids[0]
				self.goto_stored_URL()
				
		elif cmd == 'logout':
			metadata.log_setuid(self.metadb, None, cherrypy.session.get('UID',None), args, kwargs)					
			del cherrypy.session['UID']
			raise HTTPRedirect('index.html')
			
		elif cmd == 'completeEdit':
			# check which button was pressed
			if 'btn_delete' in kwargs:
				# show confirmation page
				# delete the ORIGINAL name, not any new name user might have entered
				oname = unicode(kwargs['oldItemName'], 'utf-8')
				if len(oname):
					return layoutDeleteItem(self.wiki, oname, self.loginUID())
				else:
					return self.errormsg("Trying to delete non-existant item!", args, kwargs)
					
			if 'btn_save' not in kwargs:
				return self.errormsg("Unknown button pressed.", args, kwargs)
				
			# remember to decode back to unicode (utf-8 was displayed on edit page)
			name = unicode(kwargs['itemName'],'utf-8')
			content = unicode(kwargs['content'],'utf-8')
			tags = tags_split(unicode(kwargs['tags'],'utf-8'))
			
			# does item exist?
			oitem = self.wiki.getitem(name)
			if oitem is not None:
				# see if user trying to overwrite someone else's item
				if self.loginUID() not in [oitem.author, '0']:
					return self.errormsg("You can only edit your own pages (unless you are the root user).",
								args, kwargs)
						
				# do NOT change item author, even if root is editing (want item
				# to keep 'safe' setting, not get root's value)
				author = oitem.author
			else:
				# new item, get author from session since user could pass e.g. UID=0 to
				# overwrite content they don't own
				author = cherrypy.session['UID']
				
			item = WikklyItem(name, content,
						tags, author,
						WikklyDateTime(from_store=kwargs['ctime']), 
						content_type=kwargs['content_type'])
			if len(kwargs['oldItemName']):
				self.wiki.store().saveitem(item, kwargs['oldItemName'])
			else:
				self.wiki.store().saveitem(item) # new item, nothing to replace
		
			self.redirect_to_name(item.name)
			
		elif cmd == 'deleteItem':
			# remember to decode back to unicode (utf-8 was displayed on edit page)
			name = unicode(kwargs['itemName'],'utf-8')
			
			# see which button was pressed
			if 'btn_yes' not in kwargs:
				self.redirect_to_name(name)
			
			item = self.wiki.store().getitem(name)
			if item is None:
				return self.errormsg( 
						"Trying to delete non-existant item '%s'" % name.encode('utf-8'),
						args, kwargs)
						
			self.wiki.store().delete(item)
			self.redirect_to_name('DefaultTiddlers')
		else:
			return self.errormsg("ERROR - Unknown command %s" % cmd, args, kwargs)
			
	def beginLogin(self):
		# check whether root user exists (UID="0")
		if '0' not in self.wiki.user_all_UIDs():
			return layoutEditUser(self.wiki, '0', None)
			
		return layoutLoginPage(self.wiki)
		
	def beginEditItem(self, itemname):
		from wikklytext import WikklyItem
			
		item = self.wiki.getitem(itemname)
		if item is not None and self.loginUID() not in [item.author, '0']:
			# this is checked again when saving item
			return self.errormsg(
						"You can only edit your own items (unless you are the root user).",
						args, kwargs)
						
		defaultItem = WikklyItem(itemname, author=self.loginUID())		
		return layoutEditItem(self.wiki, itemname, defaultItem, self.loginUID())
		
	def loginUID(self):
		return cherrypy.session.get('UID',None)
		
	def loggedIn(self):
		return self.loginUID() is not None

	def set_stored_URL(self, args, kwargs):
		"Store the given URL (given *args and **kwargs) as the 'saved URL'"
		url = '/'.join(args)
		if len(kwargs):
			url += '?' + urlencode(kwargs)
			
		cherrypy.log.error("*** STORING URL: %s ***" % url)
		cherrypy.session['LastStoredURL'] = url
		
	def goto_stored_URL(self):
		"Redirect to the last URL saved with set_stored_URL"
		url = cherrypy.session['LastStoredURL']
		cherrypy.log.error("*** REDIRECTING TO: %s ***" % url)
		raise HTTPRedirect(url)
					
	def serve_css_element(self, name):
		# I do not try to create missing elements here. they should
		# have been taken care of during engine startup (see below)
		if name in get_CSS_element_names():			
			full = self.fpath(self.get_css_path(), name)
			if os.path.isfile(full):				
				return serve_file(full)			
			else:
				return ''
		else:
			return ''
			
	def errormsg(self, msg, args, kwargs):
		metadata.log_errormsg(self.metadb, msg, cherrypy.session.get('UID',None), args, kwargs)
		return layoutErrorPage(self.wiki, msg, self.loginUID())
			
	def default(self, *args, **kwargs):
		"""
		ALL requests go through 'default' (even .index redirects here).
		This simplifies logon and logging.
		
		Before adding any more methods with .exposed=True, try
		adding them here instead.
		"""
		from wikklytext.store import makeFSname
		
		# let wiki know its base URL
		baseurl = cherrypy.request.base + cherrypy.request.script_name
		#print "SETTING BASEURL",baseurl
		self.wiki.setRT_baseurl(baseurl)
		
		# check requests for css/* files (always allow these requests so basic error
		# pages can do styling)
		if len(args) == 2 and args[0] == 'css':
			if self.metadb != metadata.NeedsUpdate:
				metadata.log_staticfile(self.metadb, args[1], cherrypy.session.get('UID',None), args, kwargs)
				
			return self.serve_css_element(args[1])
		
		# check error conditions first
		self.ensure_metadb()
		if self.metadb == metadata.NeedsUpdate or self.wiki_needs_update:
			return layoutNeedUpdateMeta(self.wiki)
			#s += '<hr>'
			#s += 'Headers: %s\n' % str(cherrypy.request.headers)
			#s += 'Remote: %s, %s\n' % (str(cherrypy.request.remote.ip),str(cherrypy.request.remote.port))
			#return s
			
		#cherrypy.log.error("DEFAULT, args=%s, kwargs=%s" % (str(args),str(kwargs)))
		
		# /favicon.png (lives in css/, but I make links to /favicon.png in <HEAD>
		if len(args) == 1 and args[0] == 'favicon.png':
			metadata.log_staticfile(self.metadb, args[0], cherrypy.session.get('UID',None), args, kwargs)
			return self.serve_css_element(args[0])
			
		# some browsers ask for favicon.ico, ignoring what is given in <HEAD>
		if len(args) == 1 and args[0] == 'favicon.ico':
			# don't log since this is a known condition
			raise HTTPError(status=404, message='Browser bug: Your browser is asking for favicon.ico even though favicon.png is specified in the document HEAD.')
			
		# /rss.xml
		if len(args) == 1 and args[0] == 'rss.xml':
			from wikklytext.wiki.rss import create_rss_xml
			metadata.log_feed(self.metadb, args[0], cherrypy.session.get('UID',None), args, kwargs)
			url_site = cherrypy.request.base + cherrypy.request.script_name
			xml = create_rss_xml(self.wiki, url_site)
			cherrypy.response.headers['Content-Type'] = 'text/xml'
			return xml
		
		# /robots.txt
		if len(args) == 1 and args[0] == 'robots.txt':
			metadata.log_staticfile(self.metadb, args[0], cherrypy.session.get('UID',None), args, kwargs)
			
			# for now, allow robots to access everything
			robots = """
User-agent: *
Disallow:
"""
			cherrypy.response.headers['Content-Type'] = 'text/plain'
			return robots
		
		# serve all files under files/
		if len(args) > 0 and len(kwargs) == 0 and args[0] == 'files':
			#print "GET FILE",self.wiki.get_path(),args
			name = os.path.join(self.wiki.get_path(), *args)
			subpath = os.path.join(*args)
			#print "FULL",name
			# watch for suspicious-looking file requests (possibly trying to request files
			# outside of files/ tree). Catch names containing '..', '~', or paths that
			# don't begin with my files/ directory.
			if '..' in name or '~' in name or name[:len(self.wiki.get_path())] != self.wiki.get_path():
				# don't show full name to user - potential info leak
				msg = "Ignoring suspicious file request: %s" % subpath
				metadata.log_errormsg(self.metadb, msg, cherrypy.session.get('UID',None), args, kwargs)
				raise HTTPError(status=400, message=msg)
				
			if os.path.isfile(name):
				metadata.log_staticfile(self.metadb, name, cherrypy.session.get('UID',None), args, kwargs)
				return serve_file(name)
			else:
				# don't show full name to user - potential info leak
				msg = "Request for unknown file: %s" % subpath
				metadata.log_errormsg(self.metadb, msg, cherrypy.session.get('UID',None), args, kwargs)
				raise HTTPError(status=404, message=msg)
				
		# now for more general content requests
		if len(args) == 1 and len(kwargs) == 0:
			base,ext = os.path.splitext(args[0])
			if ext.lower() == '.html':
				# store URL if needed later
				self.set_stored_URL(args, kwargs)
				
				# if root user does not yet exist, it must be created
				# before doing anything else (put this here so that requests
				# for i.e. CSS items still succeed)
				if '0' not in self.wiki.user_all_UIDs():
					return self.beginLogin()				
			
				# make sure a valid item is being requested, not just
				# a spare .html file that's sitting there
				iname = self.wiki.itemname_from_fsname(base)
				if iname is None:
					return self.errormsg('No such item "%s"' % base, args, kwargs)
					
				# sanity - regenerate to make sure caller isn't trying to
				# force me to use a bad name
				full = self.fpath(makeFSname(iname)+'.html')
				
				# render as needed
				rendered = self.wiki.render(namelist=[iname], uid=self.loginUID(),
							logfunc=cherrypy.log.error)
				
				# sanity
				if len(rendered) != 1 or not rendered.has_key(iname):
					return self.errormsg(
						'Error: Trying to render "%s", got "%s"' % (iname, str(rendered.keys())),
						args, kwargs)
					
				# turn off IE caching of response (Firefox knows not to cache without this)
				cherrypy.response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
				#if os.path.isfile(full):
				cherrypy.log.error("Serving %s" % rendered[iname][0])
				metadata.log_pageview(self.metadb, args[0], cherrypy.session.get('UID',None), args, kwargs)
				cherrypy.response.headers['Content-Type'] = 'text/html'
				return rendered[iname][1]
					
				#else:
				#	return 'Unable to generate "%s"' % args[0]

			elif ext.lower() in ['.jpg', '.png', '.gif', '.jpeg']:
				# assume other images are OK to serve
				full = self.fpath(makeFSname(args[0]))
				if os.path.isfile(full):
					metadata.log_staticfile(self.metadb, full, cherrypy.session.get('UID',None), args, kwargs)
					return serve_file(full)
				else:
					return ''
				
			elif len(ext) == 0:
				# might be a content item missing the '.html' -- try it
				iname = self.wiki.itemname_from_fsname(base)
				if iname is not None:
					# yep, valid name missing .html - redirect
					# (I prefer this to rendering directly under the basename because
					# people will be less likely to bookmark the non-.html file. So bookmarks
					# won't break if you switch to static rendering with 'wik render'.)
					raise HTTPRedirect(base + '.html')
					
		# check for commands that do not require the user to be logged in
		if len(args) == 1 and len(kwargs) > 0 and \
			args[0] == 'DoServerCmd.html' and \
			kwargs.get('cmd',None) in ['doLogin', 'saveUser', 'search', 'debug']:
				return self.handle_cmd(args, kwargs)			
		
		# process commands sent via 'DoServerCmd.html?cmd=NAME'
		if len(args) == 1 and len(kwargs) > 0:
			if args[0] == 'DoServerCmd.html':

				cmd = kwargs.get('cmd',None)
				if cmd is None:
					# don't bother logging
					return layoutErrorPage(self.wiki, 'No command given to DoServerCmd!', self.loginUID())
			
				# all other commands require user to be logged in
				# (also, if root user does not exist, force user to create)
				if not self.loggedIn() or '0' not in self.wiki.user_all_UIDs():
					# remember original request so I can redirect after login
					# (exclude some commands where this would give weird behavior)
					if cmd not in ['doLogin', 'saveUser', 'completeEdit', 'deleteItem']:
						self.set_stored_URL(args, kwargs)
						
					return self.beginLogin()		

				return self.handle_cmd(args,kwargs)
		
		msg = "ERROR - Cannot handle request\n\nargs=%s\n\nkws=%s\n\nheaders\n%s\n\nrequest-line\n%s" % \
				(args,kwargs,str(cherrypy.request.headers),str(cherrypy.request.request_line))
		return self.errormsg(msg, args, kwargs)				
		
	default.exposed = True

def on_startup():
	import wikklytext.store.wikStore_Q as wikStore_Q
	import boodebr.sql.sqliteQ as sqliteQ
	cherrypy.log.error("Starting wikStore_Q worker thread")
	#print "** My startup func **"
	wikStore_Q.start() # start wikStore_Q worker thread
	cherrypy.log.error("Starting sqliteQ worker thread")
	sqliteQ.start() # start sqliteQ worker thread
	
def on_shutdown():
	#print "** My shutdown func **"
	import wikklytext.store.wikStore_Q as wikStore_Q
	import boodebr.sql.sqliteQ as sqliteQ
	cherrypy.log.error("Shutting down wikStore_Q worker thread")
	wikStore_Q.shutdown() # stop wikStore_Q worker thread
	cherrypy.log.error("Shutting down sqliteQ worker thread")
	sqliteQ.shutdown()
	cherrypy.log.error("Finished shutting down thread")

def build_cfg(root):
	cfg = {
		'global': {
			'server.socket_host': str(root.server_addr()),
			'server.socket_port': root.server_port(),
			
			'engine.autoreload_on': True,
		}
	}
	
	# configure sessions per user settings
	skind = root.session_storage()
	sdir = root.sessiondir()

	cfg['global']['tools.sessions.on'] = True
	cfg['global']['tools.expires.secs'] = 0
	if skind == 'file':
		cfg['global']['tools.sessions.storage_type'] = 'file'
		cfg['global']['tools.sessions.storage_path'] = sdir
		if not os.path.isdir(sdir):
			os.makedirs(sdir)		
			
		cherrypy.log.error("Using 'file' session storage in '%s'" % sdir) 
	elif skind == 'ram':
		cfg['global']['tools.sessions.storage_type'] = 'ram'
		cherrypy.log.error("Using 'ram' session storage")
	else:
		raise Exception("Unknown session storage type '%s'" % skind)
		
	cfg['global']['tools.sessions.timeout'] = root.session_timeout()		
	cherrypy.log.error("Session timeout = %s" % root.session_timeout())
	return cfg	
	
def setup_engine(wikipath):
	root = wikklyserve(wikipath)
	if not root.initted():
		raise Exception("No wiki has been initted here.")
		
	cfg = build_cfg(root)
	
	# for CherryPy 3.0.x
	if CPY_VER == (3,0):
		cherrypy.log.error("** initting for CherryPy 3.0.x")
		cherrypy.engine.on_start_engine_list.append(on_startup)
		cherrypy.engine.on_stop_engine_list.append(on_shutdown)
	# for CherryPy 3.1.x
	elif CPY_VER == (3,1):
		cherrypy.log.error("** initting for CherryPy 3.1.x")
		cherrypy.engine.subscribe('start', on_startup)
		cherrypy.engine.subscribe('stop', on_shutdown)
	else:
		raise Exception("Unknown CherryPy version: %s" % cherrypy.__version__)
		
	# when starting engine, check for any out-of-date CSS files.
	# much better than checking each time a file is served.
	if not os.path.isdir(root.get_css_path()):
		#print "Creating %s" % root.get_css_path()
		os.makedirs(root.get_css_path())
				
	#print "Checking for updates to %s" % root.get_css_path()
	for name in get_CSS_element_names():
		src = load_CSS_element(name)
		dest = os.path.join(root.get_css_path(), name)
		if not os.path.isfile(dest) or \
			open(dest,'rb').read() != src:
			#print "** UPDATING %s" % dest
			open(dest,'wb').write(src)
		#else:
		#	print "** OK %s" % dest
			
	return (root,cfg)
	
def run_standalone(wikipath):
	"Run as a standalone CherryPy server."
	import wikklytext.version as V
	
	# log to screen when running standalone
	cherrypy.config['log.screen'] = True
	
	cherrypy.log.error("** WikklyText version %s" % V.VSTR)
	cherrypy.log.error("** wikserve serving wiki: %s" % wikipath)
	cherrypy.log.error("** running from: %s" % os.getcwd())

	root,cfg = setup_engine(wikipath)
	# this is what quickstart() does, but I write the steps out so
	# it is clear what the difference is in the mod_python case below
	cherrypy.config.update(cfg)
	cherrypy.tree.mount(root, '/', cfg)
	
	# for CherryPy 3.0.x
	if CPY_VER == (3,0):
		cherrypy.server.quickstart()
		cherrypy.engine.start(blocking=True)
	# for CherryPy 3.1.x
	elif CPY_VER == (3,1):
		cherrypy.engine.start()
		cherrypy.engine.block()
	else:
		raise Exception("Unknown CherryPy version: %s" % cherrypy.__version__)
	
def run_modpython(wikipath, webpath):
	"Run as a WSGI server behind mod_python"
	# log to a file when running behind mod_python
	cherrypy.config['log.error_file'] = os.path.join(wikipath, 'py_error.log')

	cherrypy.log.error("** running in %s" % os.getcwd())
	cherrypy.log.error("** run_modpython in '%s'" % wikipath)
	cherrypy.log.error("** serving on web path '%s'" % webpath)
	root,cfg = setup_engine(wikipath)
	
	cherrypy.log.error('** config: %s' % repr(cfg))

	# Adapted from:
	#   http://www.electricmonk.nl/log/2007/10/13/cherrypy-on-apache2-with-mod_python/

	# mod_python specific setup
	cherrypy.engine.SIGHUP = None
	cherrypy.engine.SIGTERM = None
	
	cherrypy.config.update(cfg)
	cherrypy.tree.mount(root, webpath, cfg)
	# no cherrypy.server.quickstart() -- that would start the standalone server
	# for CherryPy 3.0.x
	if CPY_VER == (3,0):
		cherrypy.engine.start(blocking=False)
	# for CherryPy 3.1.x
	elif CPY_VER == (3,1):
		cherrypy.engine.start()
	else:
		raise Exception("Unknown CherryPy version: %s" % cherrypy.__version__)
	
if __name__ == '__main__':
	run_standalone(os.getcwd())
	

