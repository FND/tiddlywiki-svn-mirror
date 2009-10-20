import poplib
import email
server = 'mail.jonrobson.me.uk'
user = 'myidea@jonrobson.me.uk'
password = '0smosoft'

session = poplib.POP3(server)
# if your SMTP server doesn't need authentications,
# you don't need the following line:
session.user(user)
session.pass_(password)

SENDMAIL = "/usr/sbin/sendmail" # sendmail location
import os
from tiddlyweb.model.bag import Bag
from tiddlyweb.manage import make_command
from tiddlyweb.store import Store
import logging
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.store import Store, NoBagError,NoTiddlerError

def get_store(config):
    """
    Given the config, return a reference to the store.
    """
    return Store(config['server_store'][0], {'tiddlyweb.config': config})


@make_command()
def getmail(args): 
  """look in the inbox for new emails and put them to bag possibly sending a confirmation email to the sender <bag> <sendconfirmation|optional>"""   
  bag = args[0]
  numMessages = len(session.list()[1])
  print "there are %s new messages"%numMessages
  for i in range(1,numMessages+1):
    print "getting msg %s"%i
    raw_email = session.retr(i)[1]
    email_string = ""
    for el in raw_email:
      email_string += el
      email_string += "\n"
      
    msg = email.message_from_string(email_string)
    from_email = msg["From"]
    newstring = ""
    for j in range(len(from_email)):
      if j%2 !=0:
        newstring += "?"
      else:
        newstring += from_email[j]
    masked_email = newstring
    subject = msg["Subject"]
    
    payload = msg.get_payload()
    print "%s"%payload
    print "go go"
    if type(payload) == type([]):
      body = payload[0].as_string()
    else:
      body = payload
    
    print "currently have %s"%body

    text = body
    #process the email
    store = get_store(config)
   
    title = "%s"%subject
    x = 0
    try:
      tiddler = store.get(Tiddler(title,bag))
      while tiddler:
        newtiddler = tiddler
        try:
          
          newtitle = "%s_%s"%(title,x)
          print "trying %s"%newtitle
          newtiddler = store.get(Tiddler(newtitle,bag))
        except NoTiddlerError:
          tiddler = False
        x += 1
      tiddler = newtiddler
      tiddler.title = newtitle
    except NoTiddlerError:
      tiddler = Tiddler(title,bag)
      pass
      
    tiddler.text = text
    tiddler.fields["from"] = masked_email
    tiddler.fields["subject"] = subject
    
    
    print "putting to %s"%tiddler.title
    tiddler = store.put(tiddler)
    if len(args) > 1:
      url = "%s://%s%s"%(config['server_host']['scheme'],config['server_host']['host'],config['server_prefix'])
      import sendmail
      sendmail.sendit(from_email,"Thanks for using TiddlyWeb getmail plugin","Your tiddler has been created and you can view it at %s/bags/%s/tiddlers/%s.txt"%(url,bag,title))
    #delete the email
    session.dele(i)
  session.quit()
  
  
def init(config_in):
    global config
    config = config_in