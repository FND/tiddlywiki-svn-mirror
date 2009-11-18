import poplib
import email
import os
from tiddlyweb.model.bag import Bag
from tiddlyweb.store import Store
import logging
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.store import Store, NoBagError,NoTiddlerError

class InboxParser():
  def __init__(self,config):
    self.config = config
    session = self.make_session()
    
  def get_store(self,config):
    """
    Given the config, return a reference to the store.
    """
    return Store(config['server_store'][0], {'tiddlyweb.config': config})
  def make_session(self):
    settings = self.config['getmail']
    server =settings["server"]
    user =settings["user"]
    password =settings["password"]
    session = poplib.POP3(server)
    # if your SMTP server doesn't need authentications,
    # you don't need the following line:
    session.user(user)
    session.pass_(password)
    return session

  def process_email(self,fromAddress,toAddress,subject,body):
    tiddler = Tiddler(subject)
    tiddler.modifier = fromAddress
    tiddler.text = body
    return tiddler
  
  def process_messages(self,bag):
    session = self.make_session()
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
      fromAddress = msg["From"]
      toAddress = msg["To"]
      subject = msg["Subject"]
      body = msg.get_payload()
      if type(body) == type([]):
        body = body[0].as_string()
      try:
        body.index("\n\n")
        body = body[body.index("\n\n"):] 
      except ValueError:
        body = body
        
      tiddler = self.process_email(fromAddress,toAddress,subject,body)
      store = self.get_store(self.config)
      tiddler.bag = bag
      try:
        existing = store.get(tiddler)
        suffix = 0
        original_title = tiddler.title
        while(existing):
          tiddler.title = "%s %s"%(original_title,suffix)
          suffix += 1
          existing = store.get(tiddler)
      except NoTiddlerError:
        pass
      
      store.put(tiddler)
      session.dele(i)
    session.quit()
