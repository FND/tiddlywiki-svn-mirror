import re

from subprocess import call, Popen, PIPE

cmd = "git svn info association/services/pluginLibrary/" # XXX: future Git versions interpret path as relative to $PWD
info = Popen(cmd.split(" "), stdout = PIPE).communicate()[0]
rev = re.compile(r"Rev: ([0-9]+)").search(info).groups()[0]
timestamp = re.compile(r"Date: (.+?)\s\+").search(info).groups()[0]
build = "%s (%s)" % (rev, timestamp)

filepath = "shadows/SiteSubtitle.tiddler"
f = open(filepath, "r")
subtitle = re.compile("<pre>.*?</pre>").sub("<pre>rev %s</pre>" % build, f.read())
f.close()
f = open(filepath, "w")
f.write(subtitle)
f.close()

call(["ck", "UI"])
call(["rm", "TiddlySaver.jar"])