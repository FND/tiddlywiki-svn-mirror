
// play with jquery

function manage_list_resource(element) {
    var resource = $(element).prev().attr("class").split(' ')[1];
    var base_url = window.location.href;
    base_url = base_url.substring(0, base_url.lastIndexOf("/")) + '/' + resource;
    $.getJSON(base_url + '.json', '', function(data){
        var list = $(element).children('ul');
        list.empty();
        $.each(data, function(i, item){
            list.append('<li><p>' + item + '</p><p></p></li>');
        });
        list.find("li").click(function(event){
            $(this).find('p:last').toggle("fast", function() {
                if ($(this).is(":visible")) {
                    manage_resource(this, resource);
                }
            });
        });
    });
}

function manage_resource(element, parent_resource) {
    var resource = $(element).prev().text();
    var base_url = window.location.href;
    base_url = base_url.substring(0, base_url.lastIndexOf("/")) + '/' + parent_resource + '/' + resource;
    $.getJSON(base_url + '.json', '', function(data){
        $(element).empty();
        $(element).html('<a href="">Tiddlers</a>' + ' desc: ' + data.desc + '<ul></ul>');
        $(element).find('a').click(function(event){
            $(element).find('ul').toggle("fast", function(){
                if($(this).is(":visible")) {
                    get_tiddlers(this, element, base_url);
                }
            });
            event.preventDefault();
            event.stopPropagation();
        });
    });
}

function get_tiddlers(link, where, url) {
    var tiddlers_url = url + '/tiddlers';
    $.getJSON(tiddlers_url + '.json', '', function(data){
        //$(where).remove('ul');
        //$(where).append('<ul></ul>');
        var list = $(where).find('ul');
        list.empty();
        $.each(data, function(i, item){
            $(list).append('<li>' + item.title + '</li>');
        });
    });
}

function elmo_init() {
    $("#meat").click(function(event){
        event.preventDefault();
        $(this).replaceWith($("#resource").show());
    });

    $("#resource .data").click(function(event){
        $(this).next().toggle("fast", function() {
            if ($(this).is(":visible")) {
                manage_list_resource(this);
            }
        });
    });

    $("#msg").click(function(event){
        $(this).html("No current messages.");
    });
}
