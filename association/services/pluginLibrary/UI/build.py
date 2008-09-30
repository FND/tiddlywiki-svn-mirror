import re

from subprocess import call, Popen, PIPE

cmd = "git svn info ./association/services/pluginLibrary/" # XXX: future Git versions interpret path as relative to $PWD
info = Popen(cmd.split(" "), stdout = PIPE).communicate()[0]
rev = re.search(r"Rev: ([0-9]+)", info).groups()[0]
timestamp = re.search(r"Date: (.+?)\s\+", info).groups()[0]
build = "alpha demo (revision %s, %s)" % (rev, timestamp)

filepath = "shadows/SiteSubtitle.tiddler"
f = open(filepath, "r")
subtitle = re.compile("<pre>.*?</pre>").sub("<pre>%s</pre>" % build, f.read())
f.close()
f = open(filepath, "w")
f.write(subtitle)
f.close()

call(["ck", "UI"])
