from xml.dom import minidom
import re
from twp.filterer import Filterer
from wikklytextrender import wikitext_to_wikklyhtml
import logging
class Templatifier():
  def __init__(self,environ,bag,tiddlers={},default=False):
    self.environ = environ
    self.tiddlers = tiddlers
    self._dependencies = []
    for tiddler in tiddlers.itervalues():   
      try:
        bag_name = tiddler.bag
        self.environ["tw_url_path"] = "bags/%s/tiddlers"%(bag_name)
      except KeyError:
        recipe_name = tiddler.recipe
        self.environ["tw_url_path"] = "recipes/%s/tiddlers"%(recipe_name)
      break
    self.bag = bag
    self.default = default
    self.environ["tw_url_base"] = environ["tiddlyweb.config"]['server_prefix']+"/"
    self.environ["tw_url_suffix"] = ".wikip"
  def _filter_tiddlers(self,tfilter):
    store = self.environ['tiddlyweb.config']
    filter_result = Filterer().get_filter_tiddlers(self.bag,tfilter)
    return filter_result  
  def _run_macro(self,macrotext,tiddler):
    environ = self.environ
    bag = self.bag
    logging.debug("no bag for some reason in wikitext run macro %s"%bag)
    text = wikitext_to_wikklyhtml(environ["tw_url_base"], environ["tw_url_path"], "<<%s>>"%macrotext , environ,tiddler=tiddler,suffix_url=environ["tw_url_suffix"],bag=bag)
    return text.replace("&lt;","<").replace("&gt;",">")
  def _wrap_with_viewtemplate(self,tiddler):
    def do_transclusion(text,tiddler):
      def matcher(match):
        fieldname = match.group(1)
        try:
          val = getattr(tiddler,fieldname)
        except AttributeError:
          try:
            val = tiddler.fields[fieldname]
          except KeyError:
            val = "nowt:%s"%fieldname
        return val
        
      return re.sub("\[\[:([^\]]*)\]\]",matcher,text)
    logging.debug("_wrap_with_viewtemplate: start")
    bagTemplate = "%sViewTemplate"%tiddler.bag
    if not self.tiddlers:
      template= "no tiddlers attribute set"
    elif bagTemplate in self.tiddlers:
      text = do_transclusion(self.tiddlers[bagTemplate].text,tiddler)
      logging.debug("using bag ViewTemplate")
      template = self.run("<template>%s</template>"%(text),tiddler)
    elif "ViewTemplate" in self.tiddlers:
      text = do_transclusion(self.tiddlers["ViewTemplate"].text,tiddler)
      logging.debug("using norm ViewTemplate")
      template = self.run("<template>%s</template>"%(text),tiddler)
      logging.debug("got the template")
    logging.debug("_wrap_with_viewtemplate: finished construction")
    return template
    #elif "options.txtTemplateTweakFieldname" in slices["Config"]
  def _include_default_tiddlers(self):
    logging.debug("\n\n\n********************************************************************************\n\DEFAULT ************************************************************\n")
    if self.default:
      logging.debug("loading default tiddlers %s"%self.default)
      tiddlers = self.default
    else:
      fargument = self.tiddlers['DefaultTiddlers'].text
      logging.debug("loading tiddlers with filter %s"%fargument)
      tiddlers = self._filter_tiddlers(fargument)  
    result = u""
    for tiddler in tiddlers:
      logging.debug("tiddler in filter is %s"%tiddler)
      title = tiddler.title
      self._dependencies.append(title)
      dressed_tiddler = self._wrap_with_viewtemplate(tiddler)
      logging.debug("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\ndressed")
      result += u'<div class="tiddler" id="tiddler%s" tiddler="%s">%s</div>'%(title,title,dressed_tiddler)
    return result
  def _build_template(self,node,tiddler):
    logging.debug("building template nasty %s"%node.attributes)
    nodeValue = node.nodeValue
    environ = self.environ
    tiddler_mappings = self.tiddlers
    #logging.debug("value is %s"%nodeValue)
    try:
      tagName = node.tagName
      #logging.debug("tag name is %s"%tagName)
      result = u"<%s "%tagName
      for attribute in ["id","class","_macro","macro","title","action","method","name","href","src","type","value"]:
        try:
          name= attribute
          if name == 'macro':
            name = "_macro"
          value = node.attributes[attribute].value
          result += '%s="%s" '%(name,value.replace('"',"'"))
        except KeyError:
          pass
      result += ">"
      if nodeValue:
        result += nodeValue
      try:
        macro =node.attributes["macro"].value
        result += self._run_macro(macro,tiddler)
      except KeyError:
        pass
      try:
        include_tiddler =node.attributes["tiddler"].value
        tiddler = tiddler_mappings[include_tiddler]
        #wikify it
        self._dependencies.append(include_tiddler)
        logging.debug("no bag for some reason in wikitext build_template")
        included = wikitext_to_wikklyhtml(self.environ["tw_url_base"], self.environ["tw_url_path"], tiddler.text, environ,tiddler=tiddler,suffix_url=self.environ["tw_url_suffix"],bag=self.bag)
        result += included.replace("&lt;","<").replace("&gt;",">")
      except KeyError:
        pass
      children= node.childNodes
      try:
        elemid= node.attributes["id"].value
        if elemid == "tiddlerDisplay":
          result += self._include_default_tiddlers()
      except KeyError:
        elemid = False
      for child in children:
        result += self._build_template(child,tiddler)
      result += "</%s>"%tagName  
      return result
    except AttributeError:
      if nodeValue:
        return nodeValue
      else:
        return u""    
  def _do_inclusion(self,template):
    tiddlers = self.tiddlers
    def include(match):
      title = match.group(1)
      try:
        tiddler = tiddlers[title]
        text=tiddler.text
      except KeyError:
        text = ""
      return u"%s"%(text)
    logging.debug("_do_inclusion before re.sub")  
    result= re.sub("\[\[([^\]]*)\]\]",include,template)
    logging.debug("_do_inclusion after re.sub")
    return result
  '''
  template must be in the form
  <template><div></div><div></div></template>

  tiddler_mappings:
  {title:Tiddler()}
  '''  
  def run(self,template,tiddler):
    logging.debug("run: running")
    environ = self.environ
    template = re.sub("\<\!\-\-[^\-]*\-\-\>","",template)
    #logging.debug("templatifier: %s"%template)
    logging.debug("doing inclusion")
    template = self._do_inclusion(template)
    logging.debug("done inclusion")
    #logging.debug("%s\n\n%s"%(tiddler.title,template))
    result = u""

    root = minidom.parseString(template.replace("&","&amp;"))
    children = root.documentElement.childNodes
    for child in children:
      #logging.debug("have tag %s"%child)
      result += self._build_template(child,tiddler)
    logging.debug("run: template built")
    return result  
