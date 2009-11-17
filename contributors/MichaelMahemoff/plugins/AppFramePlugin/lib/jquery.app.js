(function($) {

//******************************************************************************
// Component type config
//******************************************************************************

  var componentTypes = {
    linkedStylesheets: { pre: '<link rel="stylesheet" type="text/css" href="', post: '"></link>\n' },
    linkedScripts: { pre: '<script type="text/javascript" src="', post: '"></script>\n' },
    stylesheets: { pre: '<style>\n', post: '\n</style>\n' },
    scripts: { pre: '<script type="text/javascript">\n', post: '\n</script>\n' }
  }

  var DEFAULT_TEMPLATE = "\
<html>\n\
  <head>\n\
    <title>[[title]]</title>\n\
    [[components]]\n\
  </head>\n\
  <body>\n\
    [[core]]\n\
  </body>\n\
</html>";

//******************************************************************************
// Basic setup
//******************************************************************************

  $.app = function(options) {
    return new app(options);
  }

  app = function(options) {

    options = options || {};
    this.settings = $.extend({
      template: DEFAULT_TEMPLATE,
      decode: function(s) { return s; }
    }, options);
    this.components = [];
    this.htmlSegments = {};

    var thisApp=this;
    $.each(componentTypes, function(componentType) {
      thisApp[componentType] = [];
    });

  }

//******************************************************************************
// Interrogator - Render/Format - this is the guts of this lib
//******************************************************************************

  app.prototype.asHTML = function() { 

    var app = this;
    var html = this.settings.template;

    var componentsHTML = "";
    $.each(this.components, function(i, component) {
      componentsHTML += component.type.pre+component.val+component.type.post;
    });

    var html = html.replace(/\[\[(.+?)\]\]/g, function (s, componentToken) {
      var output;
      if (componentToken=="components")
        output = componentsHTML;
      else
        output = app.htmlSegments[componentToken] || "";
      return app.settings.decode(output);
    });

    return html;

  };

  function makeComponentHTML(componentList, preString, postString) {
    var componentHTML = "";
    $.each(componentList, function(i, component) {
      componentHTML+=preString + component + postString;
    });
    return componentHTML;
  }

//******************************************************************************
// Interrogators - Other
//******************************************************************************

  // app.prototype. = function() {
  // };

//******************************************************************************
// Manipulators - Define functions like app.attachLinkedStylesheets
//******************************************************************************
//
  app.prototype.attachHTML = function(id, html) { 
    this.htmlSegments[id] = html;
  };

  $.each(componentTypes, function(componentType) {
    app.prototype["attach"+nominalize(componentType)] = function() {
      for (var i=0; i<arguments.length; i++) {
        this.components.push({
          type: componentTypes[componentType],
          val: arguments[i]
        });
      }
    }
    // app.components.push("aaa");
  });
 
//******************************************************************************
// Utils
//******************************************************************************

  function nominalize(s) {
    return s[0].toUpperCase() + s.substr(1);
  }

})(jQuery);
