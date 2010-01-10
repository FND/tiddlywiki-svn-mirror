from tiddlyweb import control
import logging
class Filterer():
  def __init__(self):
    self.filter = u""
    self.arg1 = ""
    self.arg2 = ""
  def reset_args(self):
    self.arg1 = ""
    self.arg2 = ""
  def write_to_arg1(self,token):
    if token and token != "[" and token != "]":
      self.arg1 += token
  def write_to_arg2(self,token):
    if token and token != "[" and token != "]":
      self.arg2 += token
  def addTiddler(self):
    logging.debug("addTiddler find %s"%self.arg1)
    for i in self.bag.list_tiddlers():
      if i.title == self.arg1:
        logging.debug("addTiddler added %s"%self.arg1)
        self.final_tiddlers.append(i)
    self.reset_args()
  def apply_sort(self):
    self.filter += "&sort=%s"%(self.arg2)
  def saveAndFilterArg(self,token):
    if self.arg1 == 'server.bag':
      self.arg1 = "bag"
    self.filter += "&select=%s:%s"%(self.arg1,self.arg2)
    self.reset_args()
  def applyAndFilter(self,token):
    if self.arg1 == 'server.bag':
      self.arg1 = "bag"
    try:
      index = self.arg1.index("sort")
      self.apply_sort()
    except ValueError:
      self.filter += "&select=%s:%s"%(self.arg1,self.arg2)
    newtiddlers = control.filter_tiddlers_from_bag(self.bag,self.filter)
    for tiddler in newtiddlers:
      if tiddler not in self.final_tiddlers:
        self.final_tiddlers.append(tiddler)
    self.reset_args()
  def applyORFilter(self,token):   
    if self.arg1 == 'server.bag':
      self.arg1 = "bag"
    try:
      index = self.arg1.index("sort")
      self.apply_sort()
    except ValueError:
      newtiddlers = control.filter_tiddlers_from_bag(self.bag,"select=%s:%s"%(self.arg1,self.arg2))
      for tiddler in newtiddlers:
        if tiddler not in self.final_tiddlers:
          self.final_tiddlers.append(tiddler)
      
    self.reset_args()
  def get_filter_tiddlers(self,bag,filterstring):
    state = "A"
    self.bag = bag
    self.final_tiddlers = []
    self.filter = u""
    
    for token in filterstring:
      state = self.run(state,token)
      if state == 'Z':
        state = "A"
    
      #logging.debug("filter: have %s"%self.filter)
    logging.debug("filter: ended in %s"%state)
    return self.final_tiddlers
  def run(self,state,token):
    #logging.debug("filter:in state %s with %s"%(state,token))
    if state == 'A':
      self.write_to_arg1(token)
      if token =='[':
        return 'B'
      elif token == ' ' or token =='\n':
        return "A"
      else:
        return "Y"
    elif state == 'Y':
      self.write_to_arg1(token)
      if not token or token ==' ' or token =='\n':
        self.addTiddler()
        return 'Z'
      else:
        return "Y"
    elif state == 'B':
      self.write_to_arg1(token)
      if token =='[':
        return "C"
      else:
        return "F"
    elif state =='C':
      self.write_to_arg1(token)
      if token ==']':
        return "D"
      else:
        return "C"
    elif state =='D':
      if token ==']':
        self.addTiddler()
        return "Z"
    elif state =='F':
      self.write_to_arg1(token)
      if token =='[':
        return "G"
      else:
        return "F"
    elif state =='G':
      self.write_to_arg2(token)
      if token ==']':
        return "H"
      else:
        return "G"
    elif state =='H':
      if token ==']':
        self.applyORFilter(token)
        return "Z"
      else:
        self.saveAndFilterArg(token)
        return "I"
    elif state =='I':
      self.write_to_arg1(token)
      if token =='[':
        return "J"
      else:
        return "I"
    elif state =='J':
      self.write_to_arg2(token)
      if token ==']':
        return "K"
      else:
        return "J"
    elif state =='K':
      if token ==']':
        self.applyAndFilter(token)
        return "Z"
      else:
        self.saveAndFilterArg(token)
        return 'I'

