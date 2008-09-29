"""
wikStore_Q.py: Sharing of store connections across multiple threads.

You can use a wikStore_Q just like any other store (same API) with
two additional requirements:
	1. You must call wikStore_Q.start() before using anything else here.
	   (Typically you would call it when your application starts up.)
	   After this, you can create as many wikStore_Q stores as you need.
	   
	2. You must call wikStore_Q.shutdown() when finished.
	   (Typically you would call this when your application is shutting down.)
	   
Example usage:
	start() # begin queue manager thread
	
	q = wikStore_q('sqlite', 'mystore.db')
	
	# pass 'q' to as many threads as you'd like, it is threadsafe.
	# use 'q' just as you would use any other wikStore.
	
	shutdown() # end queue manager thread

The primary motivation for this module was to be able to share an SQLite
connection to a store, but it works for any store type.
-----------------------------------------------------------------------------
Copyright (C) 2008 Frank McIngvale

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

class WikStoreQError(Exception):
	pass

from threading import Thread, RLock
from Queue import Queue
import cgitb, sys

StoreWorkerThread = None
StoreWorkerThreadLock = RLock()

def start():
	"""
	Start StoreWorker thread. You must call this before using anything else here.
	"""
	global StoreWorkerThread

	StoreWorkerThreadLock.acquire()
	# sanity - make sure thread is not already running
	if StoreWorkerThread is not None:
		StoreWorkerThreadLock.release()
		raise WikStoreQError("start() called while StoreWorkerThread active!")
		
	# start thread
	StoreWorkerThread = StoreWorker()
	StoreWorkerThread.start()
	
	StoreWorkerThreadLock.release()
	
def shutdown():
	"""
	Stop StoreWorker thread (waits until it terminates).
	
	Once you call start() you *must* call shutdown() before
	your application exits, else your application will hang on exit.
	"""
	global StoreWorkerThread, StoreWorkerThreadLock

	StoreWorkerThreadLock.acquire()
	
	if not running():
		# for convenience, this is not an error
		StoreWorkerThread = None
		StoreWorkerThreadLock.release()
		return
		
	# send 'quit' command
	StoreCmdQueue.put(('quit',))
	
	# wait for thread to exit
	StoreWorkerThread.join()
	StoreWorkerThread = None
	
	StoreWorkerThreadLock.release()
	
class wikStore_Q(object):
	"""
	wikStore_Q has the same API as the other stores.
	It wraps any other store type in a thread-safe interface.
	"""
	# general note: all "q.get()" calls have to check if the
	# returned value is a StoreWorkerError. If so, it means
	# the thread has exited so all I can do it raise an
	# exception.
	def __init__(self, kind, pathname):
		ensure_running()
		q = Queue()
		StoreCmdQueue.put(('open_store', q, kind, pathname))
		self.store = q.get()
		if isinstance(self.store, StoreWorkerError):
			raise self.store
 		
		# else, no return value
		
	def info(self):
		"Return a one-line description of the store."
		ensure_running()
		q = Queue()
		StoreCmdQueue.put(('info', q, self.store))
		txt = q.get()
		if isinstance(txt, StoreWorkerError):
			raise txt
		else:
			return txt
		
	def getpath(self):
		"Get the base directory for the store."
		ensure_running()
		q = Queue()
		StoreCmdQueue.put(('getpath', q, self.store))
		base = q.get()
		if isinstance(base, StoreWorkerError):
			raise base
		else:
			return base
		
	def names(self):
		"Return names of all content items in store as a list of strings."
		ensure_running()
		q = Queue()
		StoreCmdQueue.put(('names', q, self.store))
		names = q.get()
		if isinstance(names, StoreWorkerError):
			raise names
		else:
			return names
		
	def getitem(self, name):
		"Load a single content item from the store."
		ensure_running()
		q = Queue()
		StoreCmdQueue.put(('getitem', q, self.store, name))
		item = q.get()
		if isinstance(item, StoreWorkerError):
			raise item
		else:
			return item

	def getall(self):
		"Load all content from store."
		ensure_running()
		q = Queue()
		StoreCmdQueue.put(('getall', q, self.store))
		items = q.get()
		if isinstance(items, StoreWorkerError):
			raise items
		else:
			return items

	def saveitem(self, item, oldname=None):
		"Save a WikklyItem to the store."
		ensure_running()
		q = Queue()
		StoreCmdQueue.put(('saveitem', q, self.store, item, oldname))
		r = q.get()
		if isinstance(r, StoreWorkerError):
			raise r
		
		# else, no return value
		
	def delete(self, item):
		"Delete the given WikklyItem from the store."
		ensure_running()
		q = Queue()
		StoreCmdQueue.put(('delete', q, self.store, item))
		r = q.get()
		if isinstance(r, StoreWorkerError):
			raise r
		
		# else, no return value
		
	def search(self, query):
		"Return a list of items matching query."
		ensure_running()
		q = Queue()
		StoreCmdQueue.put(('search', q, self.store, query))
		res = q.get()
		if isinstance(res, StoreWorkerError):
			raise res
		else:
			return res

#------------------------------------------------------------------------------
# Internal API follows
#------------------------------------------------------------------------------
def running():
	"Is StoreWorkerThread running?"
	global StoreWorkerThread
	StoreWorkerThreadLock.acquire()
	
	if StoreWorkerThread is not None:
		v = StoreWorkerThread.isAlive()
	else:
		v = False
		
	StoreWorkerThreadLock.release()
	return v		
	
def ensure_running():
	if not running():
		raise WikStoreQError("StoreWorkerThread not running - did you forget to call start()?")
		
from wikklytext.store import wikStore_files, wikStore_sqlite, wikStore_tw
from boodebr.util import makeGUID

StoreCmdQueue = Queue()

class StoreWorkerError(Exception):
	pass

"""
Commands:
	('quit',)
		Tell StoreWorker to terminate.
		No return.
		
	('open_store', Q, kind, pathname)
		Open a wikStore. 'kind' is ('text'|'tiddlywiki'|'sqlite').
		'pathname' is a path/filename (as appropriate for the kind).
		
		Pushes storeID to Q.
		
	('info', Q, storeID)
		Get one-line description of store.
		
		Pushes text to Q.
		
	('getpath', Q, storeID)
		Get the base directory for the store.
		
		Pushes text to Q.
	
	('names', Q, storeID)
		Return names of all content items in store as a list of strings.
		
		Pushes list to Q.
		
	('getitem', Q, storeID, name)
		Get an item from the store.
		
		Pushes item to Q.

	('getall', Q, storeID, name)
		Get all items from the store.
		
		Pushes list of items to Q.

	('saveitem', Q, storeID, item, oldname)
		Save/update a WikklyItem to the store.
		
		Pushes True to Q when complete.
	
	('delete', Q, storeID, item)
		Delete a WikklyItem from the store.
		
		Pushes True to Q when complete.
		
	('search', Q, storeID, item)
		Search for items.
		
		Pushes found items to Q.
"""
class StoreWorker(Thread):
	def __init__(self):
		Thread.__init__(self)
		self.storemap = {}
		
	def run(self):
		#print "** StoreWorker thread starting"
		while 1:
			try:
				# wait for next command
				cmd = StoreCmdQueue.get()
				
				if cmd[0] == 'quit':
					#print "** StoreWorker thread exiting"
					names = list(self.storemap.keys())
					# close all stores explicitly
					for name in names:
						del self.storemap[name]
						
					return
					
				elif cmd[0] == 'open_store':
					#print "open_store",cmd[1:]
					Q, kind, pathname = cmd[1:]
					if kind == 'text':
						store = wikStore_files(pathname)
					elif kind == 'tiddlywiki':
						store = wikStore_tw(pathname)
					elif kind == 'sqlite':
						store = wikStore_sqlite(pathname)
			
					sid = makeGUID('%s:%s' % (kind, pathname))
					self.storemap[sid] = store
	
					Q.put(sid)
		
				elif cmd[0] == 'info':
					#print "info",cmd[1:]
					Q, storeID = cmd[1:]
					Q.put(self.storemap[storeID].info())
				
				elif cmd[0] == 'getpath':
					#print "getpath",cmd[1:]
					Q, storeID = cmd[1:]
					Q.put(self.storemap[storeID].getpath())
				
				elif cmd[0] == 'names':
					Q, storeID = cmd[1:]
					Q.put(self.storemap[storeID].names())
		
				elif cmd[0] == 'getitem':
					Q, storeID, name = cmd[1:]
					Q.put(self.storemap[storeID].getitem(name))
		
				elif cmd[0] == 'getall':
					Q, storeID = cmd[1:]
					Q.put(self.storemap[storeID].getall())
		
				elif cmd[0] == 'saveitem':
					Q, storeID, item, oldname = cmd[1:]
					self.storemap[storeID].saveitem(item, oldname)
					Q.put(0)
		
				elif cmd[0] == 'delete':
					Q, storeID, item = cmd[1:]
					self.storemap[storeID].delete(item)
					Q.put(0)
		
				elif cmd[0] == 'search':
					Q, storeID, query = cmd[1:]
					Q.put(self.storemap[storeID].search(query))
			
			# catch ALL unhandled exceptions and pass to caller
			# keep thread alive though in case caller wants to continue
			# (this is nicer since it gives a single exit point)
			except Exception, exc:
				# I'm not sure that exceptions can be passed between threads
				# so for now I'm just passing the text dump of it
				Q.put(StoreWorkerError(cgitb.text(sys.exc_info())))
					
				
