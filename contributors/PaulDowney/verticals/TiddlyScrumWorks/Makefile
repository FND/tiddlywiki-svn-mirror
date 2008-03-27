# ScrumWorks 1.8.1 database dump:
DUMP=backups/scrumworks.script

index.html:	TeamTasksScrum.html tiddlers.html inject.sh
	inject.sh TeamTasksScrum.html $@ tiddlers.html 

TeamTasksScrum.html:	TeamTasksScrum.html.recipe 
	cook TeamTasksScrum
	rm -f TiddlySaver.jar

tiddlers.html:	t.pm dump.pl
	dump.pl > tiddlers.html

t.pm:	scrumworks.pl $(DUMP)
	scrumworks.pl < $(DUMP) > $@

