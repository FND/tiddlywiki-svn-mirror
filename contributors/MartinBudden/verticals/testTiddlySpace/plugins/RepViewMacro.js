/***
!Usage
<<repview>>

!Problems:
* external tiddlers, the link is wrong
***/
//{{{
(function($) {
var representations = {
    atom: 'A',
    html: 'H',
    json: 'J',
    txt: 'T',
    perm: 'P'
};

config.macros.repview = {
    
    makeUrl: function(tiddler, rep) {
        var title;
        var host = tiddler.fields['server.host'];
        var bag = encodeURIComponent(tiddler.fields['server.bag']);
        if (rep == 'raw') {
            title = encodeURIComponent(tiddler.title);
        } else if (rep == 'perm') {
            title = encodeURIComponent(String.encodeTiddlyLink(tiddler.title));
            return '#' + title;
        } else {
            title = encodeURIComponent(tiddler.title + '.' + rep);
        }
        return '%0bags/%1/tiddlers/%2'.format([host, bag, title]);
    },

    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        $.each(representations, function(rep, label) {
            if (tiddler.fields['server.content-type'] && rep == 'html') {
                rep = 'raw';
                label = 'R';
            }
            var attributes = {
                  href: config.macros.repview.makeUrl(tiddler, rep)
            };
            var extra_attributes = {
                    target: '_blank',
                    'class': 'externalLink repviewlink'
            }
            if (rep !=  'perm') {
                   attributes = $.extend(attributes, extra_attributes);
            }
            $("<a />").attr(attributes)
                .text(label)
                .appendTo(place);
            });
    }
};

})(jQuery);
//}}}
