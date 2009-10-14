/*global story, jQuery, document, module, test, same */

jQuery(document).ready(function () {
    module("TaggedTemplatePlugin");

    var DEFAULT_VIEW_TEMPLATE = 1, DEFAULT_EDIT_TEMPLATE = 2;

    // console.log(config.tiddlerTemplates);
    // console.log(story.chooseTemplateForTiddler("MissingTiddler", DEFAULT_VIEW_TEMPLATE));
    
    test("Missing Tiddler", function () {

        same(story.chooseTemplateForTiddler("MissingTiddler", DEFAULT_EDIT_TEMPLATE), "EditTemplate", 
            "should use EditTemplate tiddler");

        same(story.chooseTemplateForTiddler("MissingTiddler"), "TestTheme##ViewTemplate", 
            "should use ViewTemplate slice from the TestTheme for undefined template");

        same(story.chooseTemplateForTiddler("MissingTiddler", DEFAULT_VIEW_TEMPLATE), "TestTheme##ViewTemplate", 
            "should use ViewTemplate slice from the TestTheme");
    });

    test("TiddlerWithDefaultTemplate", function () {

        same(story.chooseTemplateForTiddler("TiddlerWithDefaultTemplate", DEFAULT_EDIT_TEMPLATE), "EditTemplate",
            "should use EditTemplate tiddler");

        same(story.chooseTemplateForTiddler("TiddlerWithDefaultTemplate", DEFAULT_VIEW_TEMPLATE), "TestTheme##ViewTemplate",
            "should use ViewTemplate slice from the TestTheme");
    });

    test("TiddlerWithThemeTaggedViewTemplate", function () {

        same(story.chooseTemplateForTiddler("TiddlerWithThemeTaggedViewTemplate", DEFAULT_EDIT_TEMPLATE), "EditTemplate",
            "should use EditTemplate tiddler");

        same(story.chooseTemplateForTiddler("TiddlerWithThemeTaggedViewTemplate", DEFAULT_VIEW_TEMPLATE), "TestTheme##fooViewTemplate",
            "should use fooViewTemplate slice from the TestTheme");
    });

    test("TiddlerWithTiddlerTaggedViewTemplate", function () {

        same(story.chooseTemplateForTiddler("TiddlerWithTiddlerTaggedViewTemplate", DEFAULT_EDIT_TEMPLATE), "EditTemplate",
            "should use EditTemplate tiddler");

        same(story.chooseTemplateForTiddler("TiddlerWithTiddlerTaggedViewTemplate", DEFAULT_VIEW_TEMPLATE), "barViewTemplate",
            "should use barViewTemplate tiddler");
    });

});
