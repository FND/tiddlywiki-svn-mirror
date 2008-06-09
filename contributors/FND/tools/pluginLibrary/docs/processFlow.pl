# plugin retrieval
#
# Graph::Easy flowchart
# to be generated with http://bloodgate.com/graph-demo
#
# To Do:
# * custom directions
# * code sanitizing

graph			{ flow: south; }
node.edge		{ shape: rect; fill: #ffbfc9; }
node.action		{ shape: rounded; fill: #8bef91; }
node.decision	{ shape: diamond; fill: #ffff8a; }
node.TBD		{ shape: rect; } # DEBUG


[ Start ] { class: edge; }
-- * --> [ select repository ] { class: action; }
--> [ repository disabled ]

[ repository disabled ] { class: decision; }
	-- Y --> [ skip repository ]
[ repository disabled ]
	-- N --> [ repository available ]

[ repository available ] { class: decision; }
	-- N --> [ skip repository ]
[ repository available ]
	-- Y --> [ initialize repository's plugins ] { class: action; }

--> [ remove repository's entries \n from auxiliary tables ] { class: action; }
--> [ load repository contents ] { class: action; }
--> [ document type \n is TiddlyWiki ]

[ document type \n is TiddlyWiki ] { class: decision; }
	-- N --> [ document type \n is Subversion directory ]
[ document type \n is TiddlyWiki ]
	-- Y --> [ extract plugin tiddlers ] { class: action; }

-- * --> [ select plugin ]

[ document type \n is Subversion directory ] { class: decision; }
	-- Y --> [ ? ] { class: TBD; }
[ document type \n is Subversion directory ]
	-- N --> [ document type \n is JavaScript file ]

[ document type \n is JavaScript file ] { class: decision; }
	-- Y --> [ ?? ] { class: TBD; }
[ document type \n is JavaScript file ]
	-- N --> [ ??? ] { class: TBD; }

[ select plugin ] { class: action; } # DEBUG: heading class?
--> [ retrieve tiddler fields \n (title, tags, created, modified, modifier) ] { class: action; }
--> [ retrieve tiddler text ] { class: action; }
--> [ retrieve metaslices ] { class: action; }
--> [ set tiddler title to Name slice \n (if applicable) ] { class: action; }
--> [ plugin is blacklisted ]

[ plugin is blacklisted ] { class: decision; }
	-- Y --> [ skip plugin ] { class: edge; }
[ plugin is blacklisted ]
	-- N --> [ retrieve keywords ] { class: action; }

--> [ retrieve documentation sections ] { class: action; }
--> [ retrieve code ] { class: action; }
--> [ plugin exists in database ]

[ plugin exists in database ] { class: decision; }
	-- Y --> [ update plugin in database ] { class: action; }
--> [ populate auxiliary tables \n (tiddlerFields, tags, metaslices, keywords) ] { class: action; }
[ plugin exists in database ]
	-- N --> [ add plugin to database ] { class: action; }
--> [ populate auxiliary tables \n (tiddlerFields, tags, metaslices, keywords) ]

[ skip repository ] { class: edge; }
--> [ increase repository's skipped counter ] { class: action; }
