
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

  add_tiddler_from_scratch('tiddler' => 'Mow Lawn', 'tags' => ['Project','Yard','Personal','Active'])
  add_tiddler_from_scratch('tiddler' => 'Remove Stump', 'tags' => ['Project','Yard','Personal','Active'])
  add_tiddler_from_scratch('tiddler' => 'Buy Skis', 'tags' => ['Project','Sports','Personal','Someday/Maybe'])

  add_tiddler_from_scratch('tiddler' => 'Look in phone book for ski shops', 'tags' => ['Action','Next','Personal','Buy Skis'])
  add_tiddler_from_scratch('tiddler' => 'Call tree stumper', 'tags' => ['Action','Next','Personal','Remove Stump'])
  add_tiddler_from_scratch('tiddler' => 'Buy Petrol', 'tags' => ['Action','Next','Personal','Mow Lawn'])
  add_tiddler_from_scratch('tiddler' => 'Clear palm branches', 'tags' => ['Action','Next','Personal','Mow Lawn'])
  add_tiddler_from_scratch('tiddler' => 'Orphan', 'tags' => ['Action','Next','Personal'])

  add_tiddler_from_scratch('tiddler' => 'Next', 'tags' => ['ActionStatus'],'text'=>"{{hide{\norder:1\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Waiting For', 'tags' => ['ActionStatus'],'text'=>"{{hide{\norder:2\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Future', 'tags' => ['ActionStatus'],'text'=>"{{hide{\norder:3\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Active', 'tags' => ['ProjectStatus'],'text'=>"{{hide{\norder:1\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Someday/Maybe', 'tags' => ['ProjectStatus'],'text'=>"{{hide{\norder:2\nbutton:s/m\n}}}")

  add_tiddler_from_scratch('tiddler' => 'Do Work', 'tags' => ['Sidebar'],'text'=>"{{hide{\norder:1\nbutton:Work\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Process Inbox', 'tags' => ['Sidebar'],'text'=>"{{hide{\norder:2\nbutton:Process\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Review', 'tags' => ['Sidebar'],'text'=>"{{hide{\norder:3\nbutton:Review\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Collect Items', 'tags' => ['Sidebar'],'text'=>"{{hide{\norder:4\nbutton:Collect\n}}}")
  add_tiddler_from_scratch('tiddler' => 'TW', 'tags' => ['Sidebar'],'text'=>"{{hide{\norder:5\nbutton:TW\nbuttonClass:tiny\n}}}")
  add_tiddler_from_scratch('tiddler' => 'Config', 'tags' => ['Sidebar'],'text'=>"{{hide{\norder:6\nbutton:Conf\nbuttonClass:tiny\n}}}")
  add_tiddler_from_scratch('tiddler' => 'MgtdSettings', 'tags' => ['Do Work'],'text'=>"")
  
  add_tiddler_from_scratch('tiddler' => 'Work', 'tags' => ['Realm'],'text'=>"{{hide{\norder:1\nbutton:Work\n}}}\n")
  add_tiddler_from_scratch('tiddler' => 'Personal', 'tags' => ['Realm'],'text'=>"{{hide{\norder:2\nbutton:Personal\n}}}\n")
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

