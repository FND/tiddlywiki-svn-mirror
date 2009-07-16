
import simplejson

def render(tiddler, environ):
    environ['tiddlyweb.title'] = tiddler.title

    if tiddler.text:
        data = simplejson.loads(tiddler.text)
    else:
        data = tiddler.fields

    output = '<table>\n'

    for key in sorted(data.keys()):
        output += '<tr><td>%s</td><td>%s</td></tr>\n' % (key, data[key])

    output += '</table>\n'

    return output


