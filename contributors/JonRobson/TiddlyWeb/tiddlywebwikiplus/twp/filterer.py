from tiddlyweb import control
import logging
class Filterer:
  def __init__(self):
    self.filter = u""
    self.arg1 = ""
    self.arg2 = ""
    self.foo = "yes"
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
  def apply_limit(self):
    limit = int(self.arg2)
    limited_tiddlers = []
    for tiddler in self.final_tiddlers:
      if limit == 0:
        break
      limited_tiddlers.append(tiddler)
      limit -= 1
    self.final_tiddlers = limited_tiddlers
  def apply_sort(self):
    field = self.arg2
    
    desc = False
    if field[0] == '-':
      desc = True
      field = field[1:]
    elif field[0] == '+':
      field = field[1:]
    logging.debug("apply_sort: applying sort on %s desc=%s"%(field,desc))
    def sorter(a,b):
      logging.debug("apply_sort: sorting by %s on %s and %s"%(field,a,b))
      try:
        val1 = getattr(a,field)
      except AttributeError:
        try:
          val1 = a.fields[field]
        except KeyError:
          val1 = False
      try:
        val2 = getattr(b,field)
      except AttributeError:
        try:
          val2 = b.fields[field]
        except KeyError:
          val2 = False
      logging.debug("apply_sort: testing %s vs %s"%(val1,val2))
      if val1 < val2:
        if desc:
          return 1
        else:
          return -1
      elif val2 < val1:
        if desc:
          return -1
        else: 
          return 1
      else:
        return 0
        
      
    self.final_tiddlers.sort(sorter)
  def saveAndFilterArg(self,token):
    
    if self.arg1 == 'server.bag':
      self.arg1 = "bag"
    if self.arg1 == 'sort' or self.arg1 == 'limit':
      self.filter += "&%s=%s"%(self.arg1,self.arg2)
    else:
      self.filter += "&select=%s:%s"%(self.arg1,self.arg2)
    self.reset_args()
    logging.debug("in saveAndFilter:%s "%self.filter)
  def applyAndFilter(self,token):
    logging.debug("in applyAndFilter:")
    self.saveAndFilterArg(token)
    logging.debug("applyAndFilter: filter=%s"%self.filter)
    newtiddlers = control.filter_tiddlers_from_bag(self.bag,self.filter)
    for tiddler in newtiddlers:
      if tiddler not in self.final_tiddlers:
        self.final_tiddlers.append(tiddler)
    self.reset_args()
  def applyORFilter(self,token):   
    logging.debug("applyORFilter: apply or filter %s"%self.arg1)
    if self.arg1 == 'server.bag':
      self.arg1 = "bag"
    try:
      try:
        index = self.arg1.index("sort")
        logging.debug("applyORFilter: found index %s"%index)
        self.apply_sort()
      except ValueError:
        index = self.arg1.index("limit")
        self.apply_limit()
    except ValueError:
      newtiddlers = control.filter_tiddlers_from_bag(self.bag,"select=%s:%s"%(self.arg1,self.arg2))
      for tiddler in newtiddlers:
        if tiddler not in self.final_tiddlers:
          self.final_tiddlers.append(tiddler)
      
    self.reset_args()
  def get_filter_tiddlers(self,bag,filterstring):
    logging.debug("Filterer get_filter_tiddlers filter string=%s"%filterstring)
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
    logging.debug("Filterer.run: in state %s with token %s "%(state,token))
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

