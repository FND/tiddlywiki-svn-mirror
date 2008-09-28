function testComments() {
  return;
  var cake = store.getTiddler("cake");
  var defaultTiddlers = store.getTiddler("DefaultTiddlers");
  var mainMenu = store.getTiddler("MainMenu");
  var siteTitle = store.getTiddler("SiteTitle");
  cake.initialiseRelationships();
  cake.children = [ defaultTiddlers, mainMenu, siteTitle ];

  defaultTiddlers.initialiseRelationships(cake);
  mainMenu.initialiseRelationships(cake);
  siteTitle.initialiseRelationships(cake);

  console.log("children:", cake.children, ":", cake.children.length);
  cake.serialiseRelationshipFields();
  console.log("x2", cake.fields.children);
  cake.children = remove(cake.children, mainMenu);
  console.log("x3", cake.fields.children);
  return;
  cake.removeChild(siteTitle);
  console.log("x4", cake.fields.children);
  cake.removeChild(defaultTiddlers);
  console.log("x5", cake.fields.children);
}
