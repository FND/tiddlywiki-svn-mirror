from jinja2 import Environment, FileSystemLoader

templates_dir = 'templates'
templating = Environment(loader = FileSystemLoader(templates_dir))

def generate_test_template(templates):
    template = "%s\n" % (_get_template("header.html"))
    for name in templates:
        template += "%s\n" % (_get_template(name))
    template += _get_template("footer.html")
    return templating.from_string(template)

def generate_template(templates):
    template = "%s\n" % (_get_template("header.html"))
    for name in templates:
        template += "%s\n" % (_get_template(name))
    template += _get_template("footer.html")
    return templating.from_string(template)
    
def generate_plain_template(templates):
    template = ""
    for name in templates:
        template += "%s\n" % (_get_template(name))
    return templating.from_string(template)

def _get_template(name):
    filepath = "%s/%s" % (templates_dir, name)
    f = open(filepath)
    contents = f.read()
    f.close() # XXX: not required?
    return contents
    
def getCommonVars(environ): # JRL: to make sure that templates have access to common fields
    from recordFields import getFields
    fields = getFields(environ)
    usersign = environ['tiddlyweb.usersign']
    
    captcha = {}
    try:
        query = environ['tiddlyweb.query']
        success = query['success'][0]
        if success == '1':
            captcha['success'] = True
        elif success == '0':
            captcha['failure'] = True
            try:
               captcha['error'] = query['error'][0]
            except:
               captcha['error'] = "Error not supplied"
    except:
        pass

    return {
        'fields':fields,
        'usersign':usersign,
        'captcha':captcha
    }
