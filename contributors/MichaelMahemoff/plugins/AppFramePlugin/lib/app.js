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

//******************************************************************************
// Basic setup
//******************************************************************************

  $.app = function(options) {
    return new app(options);
  }

  app = function(options) {

    options = options || {};
    this.template = options.template || "";
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
    var html = this.template;

    var html = html.replace(/\[\[(.+?)\]\]/g, function (s, componentToken) {
      var componentType = componentTypes[componentToken];
      if (componentType)
        return makeComponentHTML(app[componentToken], componentType.pre, componentType.post);
      else
        return app.htmlSegments[componentToken];
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
      for (var i=0; i<arguments.length; i++) { this[componentType].push(arguments[i]); }
    }
  });

//******************************************************************************
// Manipulators - Basic
//******************************************************************************
  
 app.prototype.setTemplate = function(template) { this.template = template; }

//******************************************************************************
// Utils
//******************************************************************************

  function nominalize(s) {
    return s[0].toUpperCase() + s.substr(1);
  }

})(jQuery);
