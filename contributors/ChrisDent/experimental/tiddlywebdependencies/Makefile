# Get dependencies, package them into here.

BASE=tiddlydeps
PLUGINDIR=$(BASE)/plugins
MODULEDIR=$(BASE)/modules

MODULES=BeautifulSoup \
	simplejson \
	selector \
	wikklytext \
	wsgiref \
	elementtree

PLUGINS=http://svn.tiddlywiki.org/Trunk/association/adaptors/TiddlyWebAdaptor.js \
    http://svn.tiddlywiki.org/Trunk/association/plugins/ServerSideSavingPlugin.js \
    http://svn.tiddlywiki.org/Trunk/association/plugins/TiddlyWebConfig.js

clean: cleanplugins cleanmodules

cleanplugins:
	rm -r $(PLUGINDIR) || true

cleanmodules:
	rm -r $(MODULEDIR) || true

plugins: plugindir
	for plugin in $(PLUGINS); do \
	    (cd $(PLUGINDIR) ; wget $$plugin ; wget $$plugin.meta ); \
	done

modules: moduledir getmodules updatepth

getmodules:
	for module in $(MODULES); do \
	    (cd $(MODULEDIR) ; PYTHONPATH="." easy_install -U -z -a -s . -d .  -b . $$module ); \
	done

updatepth:
	(cd $(MODULEDIR) ; (foo=`head -1 easy-install.pth` ; echo $$foo; echo ./elementtree ; \
	    grep -v "$$foo" easy-install.pth ) > new-install.pth && mv new-install.pth easy-install.pth)


plugindir: cleanplugins
	mkdir -p $(PLUGINDIR)

moduledir: cleanmodules
	mkdir -p $(MODULEDIR)

archive: plugins modules
	tar zcf tiddlydeps.tar.gz tiddlydeps
