from tiddlyweb.config import config
from tiddlywebplugins import voting
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.user import User
from tiddlyweb.model.policy import Policy
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb.store import Store,NoTiddlerError, NoBagError, NoRecipeError
from tiddlyweb import control
import selector
from test_config import setup,votebag


def setup_module(module):
  module.store = Store(config['server_store'][0], config['server_store'][1],environ={'tiddlyweb.config': config})
  module.environ = {'tiddlyweb.store':module.store,'tiddlyweb.config': config}
  
def test_rate():
  setup(store)
  config['tiddlyweb.usersign']={"name":"jon"} 
  config['tiddlyweb.query'] = {"bag":["films"],"tiddler":["Jackie Brown"]}
  config['tiddlyweb.query']['value'] = ["1"]
  voting.perform_action(config)
  config['tiddlyweb.query']['value'][0] = "5"
  voting.perform_action(config)
  config['tiddlyweb.query']['value'][0] = "4"
  voting.perform_action(config)
  config['tiddlyweb.query']['value'][0] = "3"
  voting.perform_action(config)
  voting.perform_action(config)
  voting.perform_action(config)  
  jackiebrown = store.get(Tiddler("Jackie Brown","films"))
  assert jackiebrown.fields['tiddlyvoting.increment'] == u"19"
  assert jackiebrown.fields['tiddlyvoting.average'] == u"3.17"
  assert jackiebrown.fields['tiddlyvoting.mode'] == u"3"
  
  user_rate_log = store.get(Tiddler("jon increment Jackie Brown in films","tiddlyvoting"))
  
  datalog = store.get(Tiddler("data::Jackie Brown in films","tiddlyvoting"))
  textLines = datalog.text.split("\n")
  for i in textLines:
    assert i in [u"1::1",u"5::1",u"3::3",u"4::1",u"frequency::6",u"total::19"]
  
  
  