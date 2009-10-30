#!/usr/bin/env python
from jinja2 import Template
from jinja2 import Environment, FileSystemLoader
from sys import argv
import os

##############################################################################
# Inject Initial Trail
##############################################################################

class FakeTiddler:
  title="Learn Podcasting"
  owner="mahemoff"

class Resource:
  def __init__(self, url, title, note):
    self.url=url
    self.title=title
    self.note=note

class FakeTrail:
  resources=[
    Resource("http://odeo.com", "Odeo", "Before you make a podcast, first familiarise yourself with the podcasts that are out there already. A good place to start is Odeo. Navigate around the site, find some episodes, and listen to them in the browser."),
    Resource("http://infopeople.org/resources/itunespodcasting.html", "ITunes Podcasting", "I know you're eager to get started, but I recommend you spend a few weeks listening to podcasts first. Get a feel for the medium. This tutorial will show you the easiest way to do that, which is to subscribe via iTunes."),
    Resource("http://audioboo.fm/", "AudioBoo", "Alright already! Let's get going. If you have an iPhone, AudioBoo is a great way to dip your toes - you can record straight from the phone and publish podcast episodes automatically. The catch is you can only record short episodes and you can't edit them later, control metadata, or provide your own landing page."),
    Resource("http://www.wikihow.com/Record-a-Podcast-with-Audacity", "Recording", "Let's now go the full monty, with a manually recorded podcast. This tutorial shows you how to make a recording, and you'll end up with an MP3 file."),
    Resource("http://www.libsyn.com", "LibSyn", "You'll need somewhere to stick the MP3 files. You can actually use almost any blogging framework, but LibSyn has a lot of stuff built in for you."),
    Resource("http://www.webraw.com/quixtar/archives/2005/02/blogging_101_podcasting.php", "Hosting", "If you're hosting your own, say on your wordpress blog, you should familiarise yourself with the technical details in this tutorial. You'll probably want to look around for plugins to fit your blogging framework."),
    Resource("http://www.how-to-podcast-tutorial.com/25-podcast-uploading.htm", "Uploading", "Now you have a file on your machine and a host in the cloud. This tutorial will help you get the former up to the later, and then people can subscribe. Yay!"),
    Resource("http://www.blogarithms.com/index.php/archives/2007/12/23/skype-for-interviews/", "Skype Interviews", "Now, some specialised topics to make your podcasts even better. First, recording interviews with skype."),
    Resource("http://www.jakeludington.com/gadget_envy/20050313_upgrade_your_podcast_for_under_200.html", "Equipment", "Some fairly cheap equipment to improve your audio quality"),
    Resource("http://www.amazon.co.uk/Podcast-Solutions-Complete-Guide-Podcasting/dp/1590599055/", "Book", "Remember, it's more than audio quality. Your content and how you cover it is really the king. This book takes you through all the details of making a successful podcast, from two guys who were podcasting right from the start."),
  ]

env = Environment(loader=FileSystemLoader(['.']))
(in_file, out_file) = (argv[1], argv[2])
template = env.get_template(in_file)
file = open(out_file, "w")
file.write(template.render(tiddler=FakeTiddler(), trail=FakeTrail(), editable=False, static_path="static"))
file.close()
