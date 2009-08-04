from tiddlyweb.web.validator import TIDDLER_VALIDATORS              
from tiddlyweb.model.tiddler import Tiddler             
import logging
from BeautifulSoup import BeautifulSoup, Comment
import re

"""
sanitise any input that has unauthorised javascript/html tags in it

Let through only tags and attributes in the whitelists ALLOWED_TAGS and ALLOWED_ATTRIBUTES
"""

ALLOWED_TAGS=[ 
    'html',
    'p',
    'i',
    'strong',
    'b',
    'u',
    'a',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'pre',
    'br',
    'img',
    'span',
    'em',
    'strike',
    'sub',
    'sup',
    'address',
    'font',
    'table',
    'tbody',
    'tr',
    'td',
    'ol',
    'ul',
    'li',
    'div'
]
ALLOWED_ATTRIBUTES=[
    'href',
    'src',
    'alt',
    'title'
] 

def sanitise_html(value):                                          
    
    #match dangerous attribute values (eg javascript:) with regex
    r = re.compile(r'[\s]*(&#x.{1,7})?'.join(list('javascript:'))) 
    
    #turn the input into a BeautifulSoup parse tree
    soup = BeautifulSoup(value) 
    
    #get all HTML comments (<!-- -->) and remove them
    for comment in soup.findAll(text=lambda text: isinstance(text, Comment)): 
        comment.extract()                                        
    
    #Check all tags against the allowed set and remove any that are not found
    for tag in soup.findAll(True):
        if tag.name not in ALLOWED_TAGS:
            tag.hidden = True
        #check that attribute/value pairs against the allowed list and regex and cut any that are not allowed
        tag.attrs = [(attr, r.sub('', val)) for attr, val in tag.attrs
                     if attr in ALLOWED_ATTRIBUTES]
    return soup.renderContents().decode('utf8')

def sanitise_xss(tiddler,environ):     
    for field,value in tiddler.fields.iteritems():
      tiddler.fields[field] = sanitise_html(value)
    tiddler.text = sanitise_html(tiddler.text)           
    tiddler.tags = map(sanitise_html,tiddler.tags)
    tiddler.title = sanitise_html(tiddler.title)

def init(config_in):
    """
    init function
    """
    TIDDLER_VALIDATORS.append(sanitise_xss)

