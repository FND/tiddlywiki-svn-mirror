
#$LOAD_PATH.unshift("../r4tw") 
require 'r4tw'


def get_rev
  `svnversion .`.split(':').last
end


make_tw {

  # actually this is an mptw empty file not a bare one
  source_file            'empties/empty.html'

  remove_tiddler         "MptwUpgradeTsURL"  
  remove_tiddler         "MptwUpgradeURL"
  remove_tiddler         "MonkeyPirateTiddlyWiki"

  add_tiddlers_from_dir  "framework"
  add_tiddlers_from_dir  "monkeygtd"
  add_tiddlers_from_dir  "layout"
  add_tiddlers_from_dir  "supporting"
  add_tiddlers_from_dir  "tiddlers"
  add_tiddlers_from_dir  "menus"

  # some demo realms
  add_tiddler_from_scratch('tiddler' => 'Work',     'tags' => ['Realm'],'text'=>"{{hide{\norder:1\n}}}\n")
  add_tiddler_from_scratch('tiddler' => 'Personal', 'tags' => ['Realm'],'text'=>"{{hide{\norder:2\n}}}\n")
  add_tiddler_from_scratch('tiddler' => 'Nerd Stuff',     'tags' => ['Realm'],'text'=>"{{hide{\norder:3\n}}}\n")

  # some demo contexts:
  add_tiddler_from_scratch('tiddler' => 'Weekend', 'tags' => ['Context'])
  add_tiddler_from_scratch('tiddler' => 'Call', 'tags' => ['Context'])
  add_tiddler_from_scratch('tiddler' => 'Home', 'tags' => ['Context'])
  add_tiddler_from_scratch('tiddler' => 'Office', 'tags' => ['Context'])
  add_tiddler_from_scratch('tiddler' => 'Errand', 'tags' => ['Context'])
  add_tiddler_from_scratch('tiddler' => 'Email', 'tags' => ['Context'])
  add_tiddler_from_scratch('tiddler' => 'Offline', 'tags' => ['Context'])
  add_tiddler_from_scratch('tiddler' => 'Low Energy', 'tags' => ['Context'])
  add_tiddler_from_scratch('tiddler' => 'Reading', 'tags' => ['Context'])

  # add some demo projects
  add_tiddler_from_scratch('tiddler' => 'Mow Lawn', 'tags' => ['Project','Yard','Personal','Active'])
  add_tiddler_from_scratch('tiddler' => 'Get some mower fuel',   'tags' => ['Action','Next','Personal','Mow Lawn','Errand'])
  add_tiddler_from_scratch('tiddler' => 'Pick up palm branches', 'tags' => ['Action','Next','Personal','Mow Lawn','Weekend'])
  add_tiddler_from_scratch('tiddler' => 'Mow the lawn already',  'tags' => ['Action','Future','Personal','Mow Lawn','Weekend'])

  add_tiddler_from_scratch('tiddler' => 'Buy snowboard', 'tags' => ['Project','Sports','Personal','Someday/Maybe'])
  add_tiddler_from_scratch('tiddler' => 'Look in phone book for local ski shops', 'tags' => ['Action','Next','Personal','Buy snowboard','Home'])
  add_tiddler_from_scratch('tiddler' => 'Ask Ben for recommendations', 'tags' => ['Action','Next','Personal','Buy snowboard','Call'])

  add_tiddler_from_scratch('tiddler' => 'A project-less task', 'tags' => ['Action','Next','Personal'])

  add_tiddler_from_scratch('tiddler' => 'Next', 'tags' => ['ActionStatus'],'text'=>"{{hide{\norder:1\nbutton:n\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Waiting For', 'tags' => ['ActionStatus'],'text'=>"{{hide{\norder:2\nbutton:w\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Future', 'tags' => ['ActionStatus'],'text'=>"{{hide{\norder:3\nbutton:f\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Active', 'tags' => ['ProjectStatus'],'text'=>"{{hide{\norder:1\nbutton:a\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Someday/Maybe', 'tags' => ['ProjectStatus'],'text'=>"{{hide{\norder:2\nbutton:s/m\n}}}")

  add_tiddler_from_scratch('tiddler' => 'Do Work', 'tags' => ['Sidebar'],'text'=>"{{hide{\norder:1\nbutton:Work\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Process Inbox', 'tags' => ['Sidebar'],'text'=>"{{hide{\norder:2\nbutton:Process\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Review', 'tags' => ['Sidebar'],'text'=>"{{hide{\norder:3\nbutton:Review\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Collect Items', 'tags' => ['Sidebar'],'text'=>"{{hide{\norder:4\nbutton:Collect\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Config', 'tags' => ['Sidebar'],'text'=>"{{hide{\norder:998\nbutton:Conf\nbuttonClass:tiny\n}}}")
  add_tiddler_from_scratch('tiddler' => 'TW', 'tags' => ['Sidebar'],'text'=>"{{hide{\norder:999\nbutton:TW\nbuttonClass:tiny\n}}}")
  add_tiddler_from_scratch('tiddler' => 'MgtdSettings', 'tags' => ['Do Work','Work','Personal'],'text'=>"")
  
  #get_tiddler('MonkeyGTDVersion').text.sub!(/\$timestamp\$/,get_rev)

  #package_as_from_dir    "misc/Dashboards.js", "dashes"
  #package_as_from_dir    "misc/Panels.js", "panels"
  #package_as_from_dir    "misc/MonkeyGTDLists.js", "lists"

  #store_to_file          "upload/upgrade3.html"

  # add non upgrade bits
  #to_file                "upload/empty3.html"
  
  # add many demo bits here
  to_file                "upload/index3.html"
}

