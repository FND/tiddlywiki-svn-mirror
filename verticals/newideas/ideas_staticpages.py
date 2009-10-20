from jinja2 import Environment, FileSystemLoader
template_env = Environment(loader=FileSystemLoader('./templates/'))
from tiddlyweb.model.bag import Bag
from tiddlyweb.model.recipe import Recipe
from tiddlyweb.model.tiddler import Tiddler
from tiddlyweb import control

def get_nice_references_to_tiddlers(tiddlers,sort=False):
    reference = {}
    bybag = {}
    withtitle = {}
    withtag = {}
    withfield = {}
    withlowercasetitle = {}
    nobrackets = {}
    all_tiddlers = []
    for tiddler in tiddlers:
        all_tiddlers.append(tiddler)
        herbag = tiddler.bag
        try:
            bybag[herbag].append(tiddler)
        except KeyError:
            bybag[herbag] = [tiddler]
        withtitle[tiddler.title] = tiddler
        withlowercasetitle[tiddler.title.lower()] = tiddler  
        for tag in tiddler.tags:
            try:
                withtag[tag].append(tiddler)
            except KeyError:
                withtag[tag] = [tiddler]
        for field,value in tiddler.fields.iteritems():
            try:
                withfield[field][value].append(tiddler)
            except KeyError:
                try:
                    withfield[field][value] = [tiddler];
                except KeyError:        
                    withfield[field] = {value: [tiddler]}
    reference['fields'] = withfield
    reference['tags'] = withtag
    reference['titles'] = withtitle
    reference["bag"] = bybag
    reference["lowercasetitles"] = withlowercasetitle
    reference['tiddlers'] =  all_tiddlers
    return reference

def generate_template(template,tiddlers,environ):
    result = get_nice_references_to_tiddlers(tiddlers)
    return template.generate(config=config,tiddlers=result['tiddlers'],twquery=environ['tiddlyweb.query'],twconfig=environ['tiddlyweb.config'],withfield = result["fields"],withtitle=result["titles"],withtag=result["tags"])

def list_ideas(environ,start_response):
  start_response('200 OK', [
      ('Content-Type', 'text/html; charset=utf-8')
      ])          
  # load up the template from disk
  bag = Bag("ideas")
  store = environ['tiddlyweb.store']
  bag =store.get(bag)
  tiddlers = control.get_tiddlers_from_bag(bag)
  
  template = template_env.get_template('listideas.html')
  return generate_template(template,tiddlers,environ)
  
def submit_idea(environ,start_response):
  start_response('200 OK', [
      ('Content-Type', 'text/html; charset=utf-8')
      ])          
  # load up the template from disk
  template = template_env.get_template('submitidea.html')
  return generate_template(template,[],environ)

def get_index(environ,start_response):
  start_response('200 OK', [
      ('Content-Type', 'text/html; charset=utf-8')
      ])          
  # load up the template from disk
  template = template_env.get_template('index.html')
  return generate_template(template,[],environ)

def test(environ,start_response):
  start_response('200 OK', [
      ('Content-Type', 'text/html; charset=utf-8')
      ])          
  return "ok"

def get_profile(environ,start_response):
  start_response('200 OK', [
      ('Content-Type', 'text/html; charset=utf-8')
      ])          
  user_id = environ['wsgiorg.routing_args'][1]['id']
  # load up the template from disk
  bag = Bag("profiles")
  store = environ['tiddlyweb.store']
  bag =store.get(bag)
  # tiddlers = control.get_tiddlers_from_bag(bag)
  user_id = environ['wsgiorg.routing_args'][1]['id']
  tiddlers = [store.get(Tiddler(user_id, "profiles"))]
  template = template_env.get_template('profile.html')
  return generate_template(template,tiddlers,environ)
 
def init(config_in):
    global config
    config = config_in
    config["selector"].add("/index",GET=get_index)
    config["selector"].add("",GET=get_index)
    config["selector"].add("/list",GET=list_ideas)
    config["selector"].add("/submit",GET=submit_idea)
    config["selector"].add("/profile/{id:segment}",GET=get_profile)
    config["selector"].add("/test",GET=test)
