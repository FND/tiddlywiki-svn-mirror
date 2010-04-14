from tiddlywebplugins import twanagerutils
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.model.bag import Bag
from tiddlyweb.config import config
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.store import Store
from tiddlyweb.store import NoTiddlerError, NoBagError, NoRecipeError
from tiddlyweb import control

def setup_module(module):
  module.store = Store(config['server_store'][0], config['server_store'][1],environ={'tiddlyweb.config': config})
    
def setup_testdata():
  testdata = [
    {"title":u"Whiskers","tags":["I wRiTe lIke A fIvE yEaR oLd","Kitty","pet","lolcat"],"fields":{"read":"no","badfield":"z"}},
    {"title":u"Fred","tags":["dog","pet"],"fields":{"badfield":"xt"}},
    {"title":u"Chris","tags":["cat","animal","bogof"],"fields":{"badfield":"ks"}},
    {"title":u"Martin","tags":["fish","lion"],"fields":{"badfield":"zs"}},
    {"title":u"Jerm","tags":["monkey"],"fields":{"badfield":"z"}},
    {"title":u"Paul","tags":["dinosaurs rule","tiger"],"fields":{"badfield":"z"}},
    {"title":u"Ben","tags":["cAt","i love my cat"],"fields":{"badfield":"z"}},
    {"title":u"Andrew","tags":["Pet","Animal","kitty","ToysRUs"],"fields":{"badfield":"z","foo":"yes"}}
  
  ]
  tiddlers = []
  for tid in testdata:
    tiddler = Tiddler(tid["title"],"tmp")
    tiddler.fields = tid["fields"]
    tiddler.tags = tid["tags"]
    tiddlers.append(tiddler)

  
  bag = Bag("tmp")
  try:
    store.delete(bag)#delete any existing one
  except NoBagError:
    pass
    
  store.put(bag)
  for tiddler in tiddlers:
    store.put(tiddler)

def test_mapfield():
  twanagerutils.init(config)
  setup_testdata()    
  twanagerutils.mapfield(["tmp","badfield","ks","new ks"])
  tid1 = store.get(Tiddler(u"Andrew","tmp"))
  assert tid1.fields['badfield'] == 'z'
  
  tid1 = store.get(Tiddler(u"Chris","tmp"))
  assert tid1.fields['badfield'] == 'new ks'
  
def test_lowercase():
  twanagerutils.init(config)
  setup_testdata()   
  twanagerutils.lowertags(["tmp"])
  tid1 = store.get(Tiddler(u"Andrew","tmp"))
  
  assert tid1.tags == ['pet','animal','kitty','toysrus']
  assert store.get(Tiddler("Whiskers","tmp")).tags == ['i write like a five year old','kitty','pet','lolcat']


def test_uppercase():
  twanagerutils.init(config)
  setup_testdata()


  twanagerutils.uppertags(["tmp"])
  tid1 = store.get(Tiddler(u"Andrew","tmp"))

  assert tid1.tags == ['PET','ANIMAL','KITTY','TOYSRUS']
  assert store.get(Tiddler("Whiskers","tmp")).tags == ['I WRITE LIKE A FIVE YEAR OLD','KITTY','PET','LOLCAT']
  
  
def test_nospacetags():
  twanagerutils.init(config)
  setup_testdata()

  twanagerutils.uppertags(["tmp"])
  twanagerutils.nospacetags(["tmp"])

  assert store.get(Tiddler("Ben","tmp")).tags == ['CAT','ILOVEMYCAT']
  assert store.get(Tiddler("Whiskers","tmp")).tags == ['IWRITELIKEAFIVEYEAROLD','KITTY','PET','LOLCAT']
  
  
def test_setfield():
  twanagerutils.init(config)
  setup_testdata()

  twanagerutils.setfield(["tmp","read","yes"])

  assert store.get(Tiddler("Ben","tmp")).fields["read"] == 'yes'
  assert store.get(Tiddler("Whiskers","tmp")).fields["read"] == 'yes'
  

def test_renamefield():
  twanagerutils.init(config)
  setup_testdata()

  twanagerutils.renamefield(["tmp","badfield","terriblefield"])

  x = store.get(Tiddler("Ben","tmp"))
  try:
    gone = x.fields["badfield"]
    assert False is True
  except KeyError:
    there = x.fields['terriblefield']
    assert there == 'z'
    pass
  
def test_removefield():
  twanagerutils.init(config)
  setup_testdata()

  twanagerutils.removefield(["tmp","badfield"])

  try:
    x = store.get(Tiddler("Ben","tmp")).fields["badfield"]
    assert True is False
  except KeyError:
    pass
    
    
def test_removefieldwithvalue():
  twanagerutils.init(config)
  setup_testdata()

  twanagerutils.removefieldwithvalue(["tmp","badfield","zs"]) #only martin should match this

  x = store.get(Tiddler("Ben","tmp")).fields["badfield"]
  assert x =='z'
  
  tiddlers = store.get(Bag("tmp")).list_tiddlers()
  for tiddler in tiddlers:
    tiddler =store.get(tiddler)
    if tiddler.title == 'Martin':
      assert "badfield" not in tiddler.fields
    elif tiddler.title == 'Ben':
      assert tiddler.fields["badfield"] == u"z"
    else:
      assert "badfield" in tiddler.fields
      
def test_maptags():
  twanagerutils.init(config)
  setup_testdata()
  twanagerutils.lowertags(["tmp"])
  twanagerutils.maptags(["tmp","cat=feline;kitty=feline;lion=feline;tiger=feline"])
  filtered_felines = list(control.filter_tiddlers_from_bag(store.get(Bag("tmp")),"select=tag:feline"))
  assert len(filtered_felines) is 6

def test_maptags_trailing():
  twanagerutils.init(config)
  setup_testdata()
  twanagerutils.maptags(["tmp","cat=feline;kitty=feline;lion=feline;tiger=feline;"])
  filtered_felines = list(control.filter_tiddlers_from_bag(store.get(Bag("tmp")),"select=tag:feline"))
  assert len(filtered_felines) is 4