$(function() {

  test("empty app", function() {
    var app = $.app();
    equals(app.asHTML(), "");
  });

  test("simple app", function() {
    var app = $.app();
    app.setTemplate("<html></html>");
    equals(app.asHTML(), "<html></html>");
  });

  test("app with body", function() {
    var app = $.app();
    app.setTemplate("<html>[[body]]</html>");
    app.attachHTML("body", "hello world!");
    equals(app.asHTML(), "<html>hello world!</html>");
  });

  test("app with various content", function() {
    var app = $.app();
    app.setTemplate("<html><head>[[head]]</head><body>[[header]] [[body]] [[footer]]</body></html>");
    app.attachHTML("head",   "metastuff");
    app.attachHTML("header", "example.com");
    app.attachHTML("body",   "hello world!");
    app.attachHTML("footer", "copyright");
    equals(app.asHTML(), "<html><head>metastuff</head><body>example.com hello world! copyright</body></html>");
  });

  test("linked stylesheets", function() {
    var app = $.app();
    app.setTemplate("[[linkedStylesheets]]");
    app.attachLinkedStylesheets("css/fancy.css");
    app.attachLinkedStylesheets("http://example.com/good.css", "fine.css");
    equals(app.asHTML(),
           '<link rel="stylesheet" type="text/css" href="css/fancy.css"></link>\n'+
           '<link rel="stylesheet" type="text/css" href="http://example.com/good.css"></link>\n' +
           '<link rel="stylesheet" type="text/css" href="fine.css"></link>\n'
          );
  });

  test("linked scripts", function() {
    var app = $.app();
    app.setTemplate("[[linkedScripts]]");
    app.attachLinkedScripts("utils.js");
    equals(app.asHTML(), '<script type="text/javascript" src="utils.js"></script>\n');
  });

  test("stylesheets", function() {
    var app = $.app();
    app.setTemplate("[[stylesheets]]");
    app.attachStylesheets("body { background: yellow; }");
    equals(app.asHTML(), '<style>\nbody { background: yellow; }\n</style>\n');
  });

  test("scripts", function() {
    var app = $.app();
    app.setTemplate("[[scripts]]");
    app.attachScripts('x=100;');
    equals(app.asHTML(), '<script type="text/javascript">\nx=100;\n</script>\n');
  });

  test("constructor options", function() {
    var app = $.app({template: "hello"});
    equals("hello", app.asHTML());
    app.setTemplate("goodbye");
    equals("goodbye", app.asHTML());
  });

});
