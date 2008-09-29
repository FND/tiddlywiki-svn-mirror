"""
metadata.py: Wiki metadata.

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

"""
For all, the 'sql' parameter is an sqliteQ object.
"""

'''
Size check:
	state						size
	original					961k (2571 entries, 383 total bytes/entry)
	drop idxServerLogType		936k (10 bytes/entry, 3%)
	drop idxServerLogResource	773k (65 bytes/entry, 17%)
	clear fullquery				596k (70 bytes/entry, 18%)
	clear resource				504k (37 bytes/entry, 10%)
	clear user_agent			238k (106 bytes/entry, 28%)
	clear datetime				166k (29 bytes/entry, 7%)
	clear remote_addr			130k (14 bytes/entry, 4%)
	clear request_line			44k  (34 bytes/entry, 9%)
	clear logtype				43k  (0.4 bytes/entry, 0.1%)
'''

import datetime as DT
import cPickle
import os
from wikklytext.port import *

# different types of log entries
LOG_PAGEVIEW = 0   # normal pageview
LOG_SERVERCMD = 1  # DoServerCmd URL
LOG_STATICFILE = 2 # static content requests (whether valid or not)
LOG_ERRORMSG = 3   # errors
LOG_SETUID = 4     # when setting UID (ie logons)
LOG_FEED = 5       # feed request (ie rss.xml)

LOG_TYPES = {
	LOG_PAGEVIEW: "PageView",
	LOG_SERVERCMD: "ServerCmd",
	LOG_STATICFILE: "StaticFile",
	LOG_ERRORMSG: "ErrorMsg",
	LOG_SETUID: "SetUID",
	LOG_FEED: "Feed",
	}
	
"""
There are two things that need to be updated over the life of
a wiki:
	* The metadata db (wikidata.db)
	* The wiki itself
"""

class _NeedsUpdate(object):
	pass

# special return value from opendb that means user needs
# to run 'wik updatemeta'
NeedsUpdate = _NeedsUpdate()

def opendb(filename):
	from boodebr.sql import load_pysqlite
	from boodebr.sql.sqliteQ import sqliteQ

	# if no pysqlite support found, no need to worry about it further
	if load_pysqlite() is None:
		return None

	if not os.path.isfile(filename):
		return NeedsUpdate
		
	db = sqliteQ(filename)
	
	if getversion(db) != CURRENT_VERSION:
		# assume this is not safe to do within the threaded server
		return NeedsUpdate
		
	return db
	
# bump this up when I add more to 'updatedb()' below
CURRENT_VERSION = 2
def getversion(sql):
	rows = sql.getrows('select value from metadata where key=?', ('version',))
	v = int(rows[0][0])
	return v
	
def updatedb(sql):
	"""
	Apply any needed updates to the metadata database.
	"""
	# allow None for convenience when pysqlite missing
	if sql is None:
		return
		
	v = getversion(sql)
	
	if v == 1:
		print "Updating metadata to version 2"
		update_v1v2(sql)
		v = getversion(sql)
		
	if v != CURRENT_VERSION:
		raise Exception("Don't know how to handle version %d metadata" % v)
		
	# might as well do this while I'm at it to save space
	# (do not use .run since that starts a transaction and you cannot vacuum
	# inside a transaction)
	sql.getrows('VACUUM',None)
	
def update_v1v2(sql):
	# column deleted
	sql.delete_table_columns('ServerLog', ['fullheaders'])

	# that also dropped the indexes, so recreate them
	sql.run(('create index idxServerLogType on ServerLog (logtype)',None))
	sql.run(('create index idxServerLogResource on ServerLog (resource)',None))

	qs = 'update metadata set value="2" where key="version"'
	sql.run((qs,None))

# this gets updated whenever a new update is added to wiki_apply_updates()
ALL_WIKI_UPDATES = set_(['init_norss_tag', 'create_files_dir'])

def wiki_needs_update(wiki):
	return wiki.get_applied_updates() != ALL_WIKI_UPDATES
	
def wiki_apply_updates(wiki):
	cur = wiki.get_applied_updates()
	
	if 'init_norss_tag' not in cur:
		print "Updating wiki: init_norss_tag"
		wiki_update_norss(wiki)
	
	if 'create_files_dir' not in cur:
		print "Updating wiki: create_files_dir"
		wiki_update_createfiles(wiki)
		
	if wiki_needs_update(wiki):
		raise Exception("Failed to apply all wiki updates!")
		
def wiki_update_norss(wiki):
	# update the wiki to add 'norss' to items that generally shouldn't go in the RSS feed
	# (this is to avoid surprising users with existing wikis)
	special = ['DefaultTiddlers', 'SiteTitle', 'SiteSubtitle', 'DoServerCmd',
			'MarkupReference', 'MultiLingual', 'StyleSheet', 'MainMenu',
			'MarkupPreHead', 'MarkupPostHead', 'MarkupPreBody', 'MarkupPostBody']
			
	for item in wiki.getall():
		if item.name in special or wiki.user_valid_UID(item.name):
			item.tag_add('norss')
			wiki.saveitem(item)
			
	# mark update as applied
	wiki.add_applied_update('init_norss_tag')

def wiki_update_createfiles(wiki):
	path = os.path.join(wiki.get_path(), 'files')
	if not os.path.isdir(path):
		os.makedirs(path)

	readme = os.path.join(path,'README-files.txt')
	if not os.path.isfile(readme):
		msg = """

WikklyText will serve all files found here, including subdirectories,
so use caution when placing files here.

"""
		open(readme, 'w').write(msg)
		
	# mark update as applied
	wiki.add_applied_update('create_files_dir')
	
def createdb(sql):
	"This assumes it is running single-threaded. Should only be called from 'wik'"
	# I always create a version 1 db here and then update it afterwards
	cmds = []

	print "Creating metadata version 1"
	# log of all server hits
	qs = 'create table ServerLog ('
	qs += 'id integer not null primary key autoincrement,'
	# a LOG_... value
	qs += 'logtype integer not null,'
	# timestamp of log entry
	qs += 'datetime datetime,'
	# the requested resource, typically the page, i.e. 'MyPage.html', or None if invalid request
	qs += 'resource text,'
	# logged-in user id, or None if not logged in
	qs += 'uid text,'
	# remote IP address
	qs += 'remote_addr text,'
	# Header: User-Agent
	qs += 'user_agent text,'
	# the raw request line, like "GET /path/to/page?cmd=aaa HTTP/1.1"
	qs += 'request_line text,'
	# ** Deleted in version 2 - takes too much space for little benefit **
	qs += 'fullheaders blob,'
	# binary cPickle of (*args, **kwargs)
	# (in case I received some extra data that did not appear on the request_line)
	qs += 'fullquery blob)'
	
	cmds.append((qs,None))
	
	qs = 'create index idxServerLogType on ServerLog (logtype)'
	cmds.append((qs,None))
	qs = 'create index idxServerLogResource on ServerLog (resource)'
	cmds.append((qs,None))
	
	# simple key:value pairs for metadata (version info, etc.)
	qs = 'create table metadata ('
	qs += 'key text,'
	qs += 'value text)'
	cmds.append((qs,None))
	
	qs = 'insert into metadata (key,value) values (?,?)'
	cmds.append((qs, ('version', 1)))
	
	# run all or run none
	sql.run(cmds)
	
def log_staticfile(sql, filename, uid, args, kwargs):
	generic_log(sql, LOG_STATICFILE, filename, uid, args, kwargs)

def log_feed(sql, feedurl, uid, args, kwargs):
	generic_log(sql, LOG_FEED, feedurl, uid, args, kwargs)

def log_setuid(sql, new_uid, uid, args, kwargs):
	generic_log(sql, LOG_SETUID, new_uid, uid, args, kwargs)

def log_servercmd(sql, command, uid, args, kwargs):
	generic_log(sql, LOG_SERVERCMD, command, uid, args, kwargs)
	
def log_pageview(sql, pagename, uid, args, kwargs):
	generic_log(sql, LOG_PAGEVIEW, pagename, uid, args, kwargs)
	
def log_errormsg(sql, errormsg, uid, args, kwargs):
	generic_log(sql, LOG_ERRORMSG, errormsg, uid, args, kwargs)
	
def do_pickle(obj):
	# returning 'buffer' tells pysqlite that this is binary data.
	# tried zlib here, but it was either not much help or a loss.
	return buffer(cPickle.dumps(obj,-1))
	
def generic_log(sql, logtype, resource, uid, args, kwargs):
	import cherrypy

	if sql is None: # allow None for convenience
		return
		
	#print "LOGGING %s " % LOG_TYPES[logtype], resource, args, kwargs
	
	qs = 'insert into ServerLog '
	qs += '(logtype,datetime,resource,uid,remote_addr,user_agent,request_line,fullquery) '
	qs += 'values (?,?,?,?,?,?,?,?)'
	
	vals = (logtype, DT.datetime.now(), resource, uid, 
			# headers['Remote-Addr'] doesn't work behind WSGI
			cherrypy.request.remote.ip,
			cherrypy.request.headers['User-Agent'], cherrypy.request.request_line,
			do_pickle((args,kwargs)))
	
	sql.run((qs, vals))
	
def get_recent_logs(sql, max_nr=None, logtype=None):
	"""
	sql = sqliteQ object.
	max_nr = Maximum number of entries to return, or None to get all.
	logtype = None for all, or a LOG_* value to get a single type.
	
	Returns a list of entries as objects.
	"""
	if sql is None:
		return []
		
	vals = []
	qs = 'select logtype,datetime,resource,uid,remote_addr,request_line from ServerLog '
	if logtype is not None:
		qs += 'where logtype=? '
		vals.append(logtype)
		
	qs += 'order by datetime desc '
	
	if max_nr is not None:
		qs += 'limit %d ' % int(max_nr)
		
	return sql.getobjs(qs, vals)
	
def get_hits_by_page(sql):
	"""
	Returns a map of:
		page[name] = nr_hits
	"""
	if sql is None:
		return {}
	
	pages = {}
	qs = 'select resource from ServerLog where logtype=?'
	for row in sql.getrows(qs, (LOG_PAGEVIEW,)):
		pages[row[0]] = pages.get(row[0], 0) + 1 
		
	return pages
	
def get_hits_between_dates(sql, start, end):
	counts = {}
	
	# all hits
	qs = 'select count(*) from ServerLog where datetime>=? and datetime <=?'
	vals = (start, end)
	counts['ALL'] = sql.getrows(qs, vals)[0][0]
	
	# now just the pageviews
	qs = 'select count(*) from ServerLog where logtype=? and datetime>=? and datetime <=?'
	vals = (LOG_PAGEVIEW, start, end)
	counts['PAGEVIEWS'] = sql.getrows(qs, vals)[0][0]
	
	# errors
	qs = 'select count(*) from ServerLog where logtype=? and datetime>=? and datetime <=?'
	vals = (LOG_ERRORMSG, start, end)
	counts['ERRORS'] = sql.getrows(qs, vals)[0][0]

	# feed hits
	qs = 'select count(*) from ServerLog where logtype=? and datetime>=? and datetime <=?'
	vals = (LOG_FEED, start, end)
	counts['FEED'] = sql.getrows(qs, vals)[0][0]

	# static files
	qs = 'select count(*) from ServerLog where logtype=? and datetime>=? and datetime <=?'
	vals = (LOG_STATICFILE, start, end)
	counts['STATICFILES'] = sql.getrows(qs, vals)[0][0]

	# server commands
	qs = 'select count(*) from ServerLog where logtype=? and datetime>=? and datetime <=?'
	vals = (LOG_SERVERCMD, start, end)
	counts['SERVERCMDS'] = sql.getrows(qs, vals)[0][0]

	# setuid commands
	qs = 'select count(*) from ServerLog where logtype=? and datetime>=? and datetime <=?'
	vals = (LOG_SETUID, start, end)
	counts['SETUID'] = sql.getrows(qs, vals)[0][0]

	return counts
	
def get_hits_by_dates(sql):
	hits = []
	if sql is None:
		return hits
		
	now = DT.datetime.now()
	
	# set start to 12:00 am this morning
	start = DT.datetime(now.year, now.month, now.day, 0, 0, 0)
	end = now
	
	# get data for each of last 7 days
	for i in range(7):
		hits.append((start.strftime('%a, %Y-%m-%d'), get_hits_between_dates(sql, start, end)))
		end = start
		start = end - DT.timedelta(days=1)
		
	# get data for range of recent days
	for i in [7, 15, 30]:
		end = now
		start = end - DT.timedelta(days=i)
		hits.append(('Last %d days' % i, get_hits_between_dates(sql, start, end)))
		
	# get data for past months
	end = now
	start = DT.datetime(end.year, end.month, 1)
	for i in range(6):
		hits.append((start.strftime('%B %Y'), get_hits_between_dates(sql, start, end)))
		end = start
		y = end.year
		m = end.month
		m -= 1
		if m == 0:
			y -= 1
			m = 12
			
		start = DT.datetime(y, m, end.day)
		
	return hits
	
	
