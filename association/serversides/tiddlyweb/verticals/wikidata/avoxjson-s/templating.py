from jinja2 import Environment, FileSystemLoader

templates_dir = 'templates'
templating = Environment(loader = FileSystemLoader(templates_dir))

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