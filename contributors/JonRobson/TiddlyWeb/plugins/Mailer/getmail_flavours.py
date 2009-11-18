from inboxparser import InboxParser
from tiddlyweb.manage import make_command
from tiddlyweb.model.tiddler import Tiddler
class HashTagInboxParser(InboxParser):
  def get_tags_and_title(self,subject):
    import re
    tags = []
    try:
      i = subject.index("#")
      title = subject[:i].rstrip()
      matches = re.findall("#[^#]*",subject[i:])
      for tag in matches:
        tag = tag[1:].rstrip()
        tags.append(tag)
    except ValueError:
      title = subject

    return (title,tags)

  def process_email(self,fromAddress,toAddress,subject,body):
    title,tags = self.get_tags_and_title(subject)

    tiddler = Tiddler(title)
    tiddler.tags = tags
    tiddler.modifier = fromAddress
    tiddler.text =body
    return tiddler

@make_command()
def getmail_hashtags(args): 
  """<[bag]> look in the inbox referenced in tiddlywebconfig for new emails. Map the subject to a tiddler title but parse it for hash tags which it will use as tiddler tags. eg 'alice in wonderland #book #lewis caroll' will create a tiddler called 'alice in wonderland' with tags book and lewis caroll , the body to tiddler text, the from address to the modifier"""   
  m = HashTagInboxParser(config)
  bag = args[0]
  m.process_messages(bag)

def init(config_in):
    global config
    config = config_in