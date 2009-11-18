from inboxparser import InboxParser
from tiddlyweb.manage import make_command
    
@make_command()
def getmail(args): 
  """<[bag]> look in the inbox referenced in tiddlywebconfig for new emails. Map the subject to a tiddler title, the body to tiddler text, the from address to the modifier"""   
  m = InboxParser(config)
  bag = args[0]
  m.process_messages(bag)

def init(config_in):
    global config
    config = config_in