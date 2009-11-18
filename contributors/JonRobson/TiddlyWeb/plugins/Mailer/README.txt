!To install
Stick this into your tiddlywebconfig and smoke it..

'getmail':{
  'server': 'your smtp mailbox',
  'user':'username_to_connect_to_mailbox',
  'password': '????'
},

'twanager_plugins': ['getmail']

!To run
run twanager getmail common

This will load all emails from your mailbox into the common bag with the default mappings (subject>title,text>text,from address>modifier)

To try an alternative flavour of the plugin add getmail_flavours to your twanager_plugins in the config.
Using this method instead will allow you to parse the subject of an e-mail for hash tags which will be converted to tiddler tags.