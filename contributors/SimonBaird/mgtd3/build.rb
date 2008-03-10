
#$LOAD_PATH.unshift("../r4tw") 
require 'r4tw'


def get_rev
  `svnversion .`.split(':').last
end


demo = [
	['MgtdSettings', "[[Do Work]] Work Personal" ],

  	['Starred',       ''],

  	['Done',          '',  "button:done\n"],

  	['Next',          'ActionStatus',  "order:1\nbutton:n\nbuttonLong:next\n"],
	['Waiting For',   'ActionStatus',  "order:2\nbutton:w\nbuttonLong:waiting for\n"],
	['Future',        'ActionStatus',  "order:3\nbutton:f\nbuttonLong:future\n"],

	['Active',        'ProjectStatus', "order:1\nbutton:a\nbuttonLong:active\n"],
	['Someday/Maybe', 'ProjectStatus', "order:2\nbutton:s/m\nbuttonLong:someday/maybe\n"],

	['Work',          'Realm',         "order:1\npriority:1"],
	['Personal',      'Realm',         "order:2\npriority:2"],

	['Home Maintenance', 'Area'],
	['Recreation',       'Area'],

	['Do Work',       'Sidebar', "order:1\nbutton:Work\n"                     ],
	['Process Inbox', 'Sidebar', "order:2\nbutton:Process\n"                  ],
	['Review',        'Sidebar', "order:3\nbutton:Review\n"                   ],
	['Collect Items', 'Sidebar', "order:4\nbutton:Collect\n"                  ],
	['Config',        'Sidebar', "order:998\nbutton:Conf\nbuttonClass:tiny\n" ],
	['TW',            'Sidebar', "order:999\nbutton:TW\nbuttonClass:tiny\n"   ],

  	['Weekend',       'Context'],
	['Call',          'Context'],
	['Home',          'Context'],
	['Office',        'Context'],
	['Errand',        'Context'],
	['Email',         'Context'],
	['Offline',       'Context'],
	['Low Energy',    'Context'],
	['Reading',       'Context'],

	['Mow Lawn',              "Project [[Home Maintenance]] Personal Active"],
	['Get some mower fuel',   "Action Next Personal [[Mow Lawn]] Errand"],
	['Pick up palm branches', "Action Next Personal [[Mow Lawn]] Weekend"],
	['Mow the lawn already',  "Action Future Personal [[Mow Lawn]] Weekend"],

	['Buy snowboard',                          "Project Recreation Personal Someday/Maybe"],
	['Look in phone book for local ski shops', "Action Next Personal [[Buy snowboard]] Home"],
	['Ask Ben for recommendations',            "Action Next Personal [[Buy snowboard]] Call"],

  ['Hung up bedroom curtains', "Project [[Home Maintenance]] Personal Active"],
  ['Buy curtain rail and screws', "Action Next Personal [[Hung up bedroom curtains]] Errand"],
  ['Drill holes and hung up curtain rail', "Action Future Personal [[Hung up bedroom curtains]] Home"],
  ['Place curtain pins and hung up curtains', "Action Future Personal [[Hung up bedroom curtains]] Home"],
  
  ['Go to theater with Sue', "Project Recreation Personal Active"],
  ['Ring Sue: decide play and dates', "Action Next Personal [[Go to theater with Sue]] Call"],
  ['Ring ticket office and book places', "Action Future Personal [[Go to theater with Sue]] Call"],
  
	['A project-less task',   "Action Next Personal"],

]


make_tw {

  # actually this is an mptw empty file not a bare one
  source_file            'empties/empty.html'

  remove_tiddler         "MptwUpgradeTsURL"  
  remove_tiddler         "MptwUpgradeURL"
  remove_tiddler         "MonkeyPirateTiddlyWiki"

  add_tiddlers_from_dir  "framework"
  add_tiddlers_from_dir  "layout"
  add_tiddlers_from_dir  "supporting"
  add_tiddlers_from_dir  "menus"
  add_tiddlers_from_dir  "views"

  add_tiddlers_from_dir  "tiddlers"

  # should match what's in Dashboard and MonkeyGTDTheme. Uhoh, we have some DRY problems...
  [
    'Action Dashboard',
    'Action Dashboard by Context',
    'Just Next Actions',
    'Just Next Actions by Context',
    'Projects',
  ].each do |t|
	  add_tiddler_from_scratch('tiddler' => t, 'tags' => 'View', 'text' => '')
   end

  # load the demo
  demo.each do |t|
	  t[2] ||= ''
	  add_tiddler_from_scratch('tiddler' => t[0], 'tags' => t[1], 'text' => t[2])
  end

  add_tiddler(get_tiddler('MptwBlue').copy_to('ColorPalette'))

  # add some demo projects
  
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


