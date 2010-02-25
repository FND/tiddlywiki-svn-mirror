/*global story, jQuery, document, module, test, same */

jQuery(document).ready(function () {
    module("ThemedTiddlerPlugin");

    // assumes TitleSlide and ContentsSlide are visible
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

        same(story.chooseTemplateForTiddler("TiddlerWithDefaultTemplate", "MyEditTemplate"), "MyEditTemplate",
            "should use template asserted as a string");

    });

    test("WrapperClass", function () {
        same(jQuery("#tiddlerTitleSlide").hasClass("TitleSlideTheme"), true,
            "tiddler has a wrapper class of the theme name");
    });

    test("TitleSlide", function () {
        same(story.chooseTemplateForTiddler("TitleSlide", DEFAULT_EDIT_TEMPLATE), "TitleSlideTheme##EditTemplate",
            "should use EditTemplate from TitleSlideTheme");

        same(jQuery("#tiddlerTitleSlide").css('background-color').replace(/\s*/g, ""), "rgb(12,34,56)",
            "should use StyleSheet slice from TitleSlideTheme");
    });

    test("ContentsSlide", function () {

        same(story.chooseTemplateForTiddler("ContentsSlide", DEFAULT_EDIT_TEMPLATE), "EditTemplate",
            "should use default EditTemplate ");

        same(jQuery("#tiddlerContentsSlide").css('background-color').replace(/\s*/g, ""), "rgb(78,90,123)",
            "should use StyleSheet slice from ContentSlideSlideTheme");
    });
});
