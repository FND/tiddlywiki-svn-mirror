/*
Algorithms for Vismo
*/
var VismoGraphAlgorithms = {
    available: function(){
        var i;
        var available = [];
        for(i in VismoGraphAlgorithms){
            if(i.indexOf("_") != 0 && i != "available"){
                available.push(i);
            }
        }
        return available;
    }
};