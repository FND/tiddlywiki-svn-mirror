
#$LOAD_PATH.unshift("../r4tw") 
require 'r4tw'



required = [
	['MgtdSettings', "[[Do Work]] Work Personal" ],

  ['Action', 'GTDComponent'],
  ['Project', 'GTDComponent'],
  ['Area', 'GTDComponent'],
  ['Context', 'GTDComponent'],
  ['Tickler', 'GTDComponent'],
  ['Reference', 'GTDComponent'],

 	['Starred',       ''],

 	['Next',          'ActionStatus',  "order:1\nbutton:n\nbuttonLong:next\n"],
	['Waiting For',   'ActionStatus',  "order:2\nbutton:w\nbuttonLong:waiting for\n"],
	['Future',        'ActionStatus',  "order:3\nbutton:f\nbuttonLong:future\n"],

	['Active',        'ProjectStatus', "order:1\nbutton:a\nbuttonLong:active\n"],
	['Someday/Maybe', 'ProjectStatus', "order:2\nbutton:s/m\nbuttonLong:someday/maybe\n"],

	['Enabled',        'TicklerStatus', "order:1\nbutton:on\nbuttonLong:enabled\n"],
	['Disabled',       'TicklerStatus', "order:2\nbutton:off\nbuttonLong:disabled\n"],

	['Do Work',       'Sidebar', "order:1\nbutton:Do Work\n"                     ],
	['Process Inbox', 'Sidebar', "order:2\nbutton:Process Inbox\n"                  ],
	['Review',        'Sidebar', "order:3\nbutton:Review\n"                   ],
	#['Collect Items', 'Sidebar', "order:4\nbutton:Collect\n"                  ],
	['Config',        'Sidebar', "order:998\nbutton:Conf\nbuttonClass:tiny\n" ],
	['TW',            'Sidebar', "order:999\nbutton:TW\nbuttonClass:tiny\n"   ],

]

initial = [
	['Work',          'Realm',         "order:1\npriority:1"],
	['Personal',      'Realm',         "order:2\npriority:2"],

	['Home Maintenance', 'Area Personal'],
	['Recreation',       'Area Personal'],
	['Family',       'Area Personal'],
	['Friends',       'Area Personal'],
	['Budget',       'Area Work'],
	['Research',       'Area Work'],
	['Training',       'Area Work'],
	['Customer Relations',       'Area Work'],

 	['@Weekend',       'Context'],
	['@Call',          'Context'],
	['@Home',          'Context'],
	['@Office',        'Context'],
	['@Errand',        'Context'],
	['@Email',         'Context'],
	['@Offline',       'Context'],
	['@Low Energy',    'Context'],
	['@Reading',       'Context'],

]

demo = [

  ['Bert',           "Contact"],
  ['Ernie',          "Contact"],
  ['Big Bird',       "Contact"],
  ['Fozzie',         "Contact"],
  ['Miss Piggy',     "Contact"],
  ['Kermit',         "Contact"],

	['Mow Lawn',              "Project [[Home Maintenance]] Personal Active"],
	['Get some mower fuel',   "Action Next Personal [[Mow Lawn]] @Errand"],
	['Pick up palm branches', "Action Next Personal [[Mow Lawn]] @Weekend"],
	['Mow the lawn already',  "Action Future Personal [[Mow Lawn]] @Weekend"],

	['Buy snowboard',                          "Project Recreation Personal Someday/Maybe"],
	['Look in phone book for local ski shops', "Action Next Personal [[Buy snowboard]] @Home"],
	['Ask Ben for recommendations',            "Action Next Personal [[Buy snowboard]] @Call"],

  ['Hang up bedroom curtains', "Project [[Home Maintenance]] Personal Active"],
  ['Buy curtain rail and screws', "Action Next Personal [[Hang up bedroom curtains]] @Errand"],
  ['Drill holes and hung up curtain rail', "Action Future Personal [[Hang up bedroom curtains]] @Home"],
  ['Place curtain pins and hung up curtains', "Action Future Personal [[Hang up bedroom curtains]] @Home"],
  
  ['Go to theatre with Sue', "Project Recreation Personal Active"],
  ['Ring Sue: decide play and dates', "Action Next Personal [[Go to theatre with Sue]] @Call"],
  ['Ring ticket office and book places', "Action Future Personal [[Go to theatre with Sue]] @Call"],
  
	['A project-less task',   "Action Next Personal"],

]


# TODO put into r4tw
class Tiddler
  def get_sections
    @fields['text'].scan(/^!([^\n]+)$/m).map { |m| m[0] }
  end
end 

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


  # generate some content
  content = ""
  get_tiddler('NameDashboards').get_sections.each do |s|
    content += "<div macro=\"showWhenTitleIs '#{s}'\">[[NameDashboards###{s}]]</div>\n"
	  add_tiddler_from_scratch('tiddler' => s, 'tags' => 'View', 'text' => '')
  end
  get_tiddler('TagDashboards').get_sections.each do |s|
    content += "<div macro=\"showWhenTagged '#{s}'\">[[TagDashboards###{s}]]</div>\n"
  end

  add_tiddler_from_scratch ({'tiddler' => 'DashboardSelector', 'text' => content });

  content = ""
  get_tiddler('TitleButtons').get_sections.each do |s|
    content += "<div macro=\"showWhenTagged '#{s}'\">[[TitleButtons###{s}]]</div>\n"
  end
  add_tiddler_from_scratch ({'tiddler' => 'TitleButtonsSelector', 'text' => content });

  # use secret timestamp format for version number. note, can't do two releases in same ten minute period
  get_tiddler('MgtdConf').fields['text'].sub!(/__REV__/,Time.now.strftime('%m%d%H%M')[1..-2])

  # add required tiddlers and write upgrade file.
  required.each { |t| add_tiddler_from_scratch('tiddler' => t[0], 'tags' => t[1], 'text' => t[2]||'') }
  store_to_file          "upload/upgrade3.html"

  # add some intial useful contexts realms and areas and write an empty file.
  add_tiddler(get_tiddler('MptwBlue').copy_to('ColorPalette'))
  initial.each { |t| add_tiddler_from_scratch('tiddler' => t[0], 'tags' => t[1], 'text' => t[2]||'') }
  to_file          "upload/empty3.html"

  # load the demo and write a demo file
  demo.each { |t| add_tiddler_from_scratch('tiddler' => t[0], 'tags' => t[1], 'text' => t[2]||'') }

  # throw in a tickler and some reference
  add_tiddler_from_scratch('tiddler' => 'Theatre Program', 'tags' => "[[Go to theatre with Sue]] Reference Personal", 'text' => '''
Riverway Arts Centre
http://riverway.townsville.qld.gov.au/arts/program
Townsville Civic Theatre
http://previous.townsville.qld.gov.au/theatre/TheatreSeason.asp
  ''')

  add_tiddler_from_scratch('tiddler' => 'Okay to donate blood again', 'tags' => "Tickler Personal Enabled", 'text' => '', 'mgtd_date' => '200806140200' )


  #############
  # load additional demo from the demo_tw. thanks Michael Slay for donating this project for the demo
  demo_tw = make_tw { source_file 'demo/nicedemo.html' }
  add_tiddler demo_tw.get_tiddler("CustCheck Server Install")
  demo_tw.tiddlers_with_tag("CustCheck Server Install").each {|t| add_tiddler t}
  #
  #######################

  to_file                "upload/demo3.html"
}


