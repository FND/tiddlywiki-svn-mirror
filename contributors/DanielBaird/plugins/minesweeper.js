/***
|''Name:''|Minesweeper|
|''VersionX:''|1.0|
|''Date:''|15 Feb 2007|
|''Source:''|Tiddly W;nks (http://danielbaird.com/tiddlywinks/)|
|''Author:''| Daniel Baird |
|''Contact:''| danielbaird at gmail, plus dot com at the end |
|''Type:''|Macro|
|''Description:''|It's minesweeper!|
|''Screenshot:''|http://danielbaird.com/tiddlywinks/minesweeper01.gif|
|''Icon:''|http://danielbaird.com/tiddlywinks/tiddlywinks-icon.png|

!Syntax/Example usage
{{{<<minesweeper>>}}} or {{{<<minesweeper [width] [height] [bombs]>>}}}
<<minesweeper>>

!Notes
* Let me know if you want graphics, or that MSWindows Minesweeper thing where you can click with both buttons on a numbered square,
and it does the thinking for you..

!Revision History
* 0.5.0 (2-Oct-05) (Daniel)
** original version
* 0.5.1 (3-Oct-05) (Simon)
** added the css styles via set~StyleSheet
* 0.5.2 (3-Oct-05) (Simon)
** added parameters to macro and fixed bug preventing detection of win
* 0.6 (5-Oct-05) (Daniel)
** Fixed the problem with multiple games on screen at once.
** Cleaned up the JavaScript warning generated when you clicked anywhere but on a square.
* 0.7 (6-Oct-05) (Daniel)
** Integrated sweet additions from Genesis_mage (genisis329 at gmail dot com) that:
*** allows winning by having all non-mines clicked (without having to mark every mine)
*** added a mark button to mark and unmark mines without the keyboard
** Win time now shows tenths of a second.
* 0.71 (10-Oct-05) (Daniel)
** tweaked a style to make the mark button work better in IE
* 0.72 (12-Oct-05) (Daniel)
** worked out how to use a closure as a event handler, which means that the code added in 0.6 could be made a lot simpler.
* 1.0 (2-Feb-07) (Daniel)
** checked in latest TiddlyWiki version 2.1.  Plays nicely.
** Updated meta information.
** decided that a year of no bugs means it deserved a 1.0 version :)

***/
/*{{{*/

version.extensions.minesweeper = {major: 1, minor: 0, revision: 0};

config.macros.minesweeper = {};

config.macros.minesweeper.handler = function(place,macroName,params) {
    var width = params[0];
    var height = params[1];
    var bombs = params[2];

    if (width == undefined) width = 9;
    if (height == undefined) height = width;
    if (bombs == undefined) bombs = Math.round(width * height /  8)
    if (bombs > width * height) bombs = width * height;

    var aGame = new MinesweeperGame();

    createTiddlyElement(place,'div',aGame.id,null,'If you see this, Minesweeper is broken.  Let Daniel know (DanielBaird at gmail dot
com).');
    aGame.newGame(width, height, bombs);
}
// =======================================================================
function MinesweeperGame() {
    this.idprefix = 'mines';
    this.version = '1.0';
    this.id = this.idprefix + MinesweeperGame.prototype.nextid;
    MinesweeperGame.prototype.nextid++;
    return this;
}
// -----------------------------------------------------------------------
MinesweeperGame.prototype.nextid = 0;
// -----------------------------------------------------------------------
MinesweeperGame.prototype.newGame = function(height, width, mines) {
    this.height = height;
    this.width = width;
    this.mines = mines;
    this.total = height * width;
    this.markMode = false;

    this.startGame();
}
// -----------------------------------------------------------------------
MinesweeperGame.prototype.startGame = function() {

    this.gamestate = 'ready';
    this.clicks = 0;
    this.marks = 0;
    this.message = 'click on the board to begin';

    this.starttime = null;
    this.wintime = null;
    this.board = new Array();

    // create the squares
    for (var x = 0; x < this.height; x++) {
        var row = new Array();
        for (var y = 0; y < this.width; y++) {
            row.push( {count: 0, mine: false, clicked: false, marked: false} );
        }
        this.board.push(row);
    }

    // add mines
    for (var m = 0; m < this.mines; m++) {
        var mx = Math.round((this.height-1)*Math.random());
        var my = Math.round((this.width-1)*Math.random());
        if (this.board[mx][my].mine) {
            m--;
        } else {
            this.board[mx][my].mine = true;
        }
    }

    // work out counts
    for (var cx = 0; cx < this.height; cx++) {
        for (var cy = 0; cy < this.width; cy++) {
            var count = 0;
            for (var dx = -1; dx < 2; dx++) {
                for (var dy = -1; dy < 2; dy++) {
                    var nx = cx + dx;
                    var ny = cy + dy;
                    if ( (!(dx==0 && dy==0))
                            && (nx >= 0) && (nx < this.height)
                            && (ny >= 0) && (ny < this.width)
                            && this.board[nx][ny].mine) {
                        count++;
                    }
                }
            }
            this.board[cx][cy].count = count;
        }
    }
    this.showBoard();
}
// -----------------------------------------------------------------------
MinesweeperGame.prototype.showBoard = function() {
    var node = document.getElementById(this.id);
    var html = new Array();
    html.push('<table class="minefield" cellspacing="2">');
    html.push('<tr><td class="info" colspan="'+this.width+'">');
    html.push('Minesweeper '+this.version+'<br /><b>'+this.gamestate+'</b>');
    if (this.gamestate == 'playing') {
        this.message = (this.mines - this.marks)+' mines unmarked';
    }
    html.push('</td></tr>');
    for (var x = 0; x < this.height; x++) {
        html.push('<tr>');
        for (var y = 0; y < this.width; y++) {
            html.push( this.makeSquare(x,y) );
        }
        html.push('</tr>');
    }
    var cls = 'un';
    if (this.markMode) cls = '';
    html.push('<tr><td id="'+this.id+'_markbtn" class="'+cls+'clicked widebtn" colspan="'+this.width+'">mark / unmark 
mines</td></tr>');
    html.push('<tr><td class="info" colspan="'+this.width+'">'+this.message);
    html.push('<small>');
    html.push('<br /><span class="minesweeper' + cls + 'show">ctrl- shift- or alt-</span>click to reveal a square');
    html.push('<br /><span class="minesweeper' + cls + 'hide">ctrl- shift- or alt-</span>click to mark a mine');
    html.push('</small>');
    html.push('</td></tr>');
    html.push('</table>');
    node.innerHTML = html.join('');
    node.onclick = this.getClickHandler();
}
// -----------------------------------------------------------------------
MinesweeperGame.prototype.makeSquare = function(x,y) {
    var sq = this.board[x][y];
    var reveal = (this.gamestate != 'playing' && this.gamestate != 'ready');
    var html = new Array();
    if (sq.clicked) {
        html.push('<td class="clicked" id="'+this.id+'_x-'+x+'_y-'+y+'">');
        if (!sq.marked && reveal && sq.mine) {
            html.push('B!');
        } else if (!sq.marked && reveal && sq.mine) {
            html.push('B!');
        } else if (sq.count > 0){
            html.push(sq.count);
        } else {
            html.push('&nbsp;');
        }
    } else {
        html.push('<td class="unclicked" id="'+this.id+'_x-'+x+'_y-'+y+'">');
        if (sq.marked && !reveal) {
            html.push('B?');
        } else if (sq.marked && sq.mine && reveal) {
            html.push('B');
        } else if (sq.marked && !sq.mine && reveal) {
            html.push('X');
        } else if (sq.mine && reveal) {
            html.push('B!');
        } else {
            html.push('&nbsp;');
        }
    }
    html.push('</td>');
    return html.join('');
}
// -------------------------------------------------------------------
MinesweeperGame.prototype.clickSquare = function(cx,cy,modifier) {
    if (this.gamestate == 'ready') {
        this.starttime = new Date();
        this.gamestate = 'playing';
    }
    if (this.gamestate == 'playing') {
        if (!this.board[cx][cy].clicked) {
            if ( (modifier && !this.markMode) || (!modifier && this.markMode) ) {
                if (this.board[cx][cy].marked) {
                    this.marks--;
                    this.board[cx][cy].marked = false;
                } else {
                    this.marks++;
                    this.board[cx][cy].marked = true;
                }
            } else if (!this.board[cx][cy].clicked && !this.board[cx][cy].marked) {
                this.revealSquare(cx,cy);
            }
            this.markMode = false;
        }
        this.checkWin();
        this.showBoard();
    } else {
        // clicked when we're not playing..
        this.startGame();
    }
}
// -------------------------------------------------------------------
MinesweeperGame.prototype.revealSquare = function(x,y) {
    if (this.board[x][y].clicked == false && this.board[x][y].marked == false) {
        this.board[x][y].clicked = true;
        this.clicks++;
        if (this.board[x][y].mine) {
            this.gamestate = 'boom!';
            this.message = 'click board to play again';
        } else if (this.board[x][y].count == 0) {
            // if it's a zero, we might have to reveal some other squares..
            for (var dx = -1; dx < 2; dx++) {
                for (var dy = -1; dy < 2; dy++) {
                    var nx = x + dx;
                    var ny = y + dy;
                    if ( (!(dx==0 && dy==0)) && (nx >= 0) && (nx < this.height) && (ny >= 0) && (ny < this.width) ) {
                        this.revealSquare(nx,ny);
                    }
                }
            }
        }
    }
}
// -------------------------------------------------------------------
MinesweeperGame.prototype.handleClick = function(e) {
    // work out which cell was clicked
    if (!e) var e = window.event;
    var str = resolveTarget(e).id;
    if (str && str != undefined) {
        if (str == this.id + '_markbtn') {
            this.markMode = !this.markMode;
            this.showBoard();
        } else {
            var cx = parseInt(str.substr( str.indexOf('x-')+2 ));
            var cy = parseInt(str.substr( str.indexOf('y-')+2 ));
            if ( !isNaN(cx) && !isNaN(cy) ) {
                this.clickSquare(cx,cy,(e.altKey || e.shiftKey || e.ctrlKey));
            }
        }
    }
}
// -------------------------------------------------------------------
MinesweeperGame.prototype.getClickHandler = function() {
    var thisGame = this;
    return function(e) {
        thisGame.handleClick(e);
    }
}
// -------------------------------------------------------------------
MinesweeperGame.prototype.checkWin = function() {
    if (this.clicks == this.total - this.mines && this.gamestate !='boom!') {
        this.gamestate = 'win';
        this.wintime = new Date();
        this.message = 'You won in '+Math.round(((this.wintime - this.starttime)/100))/10+' seconds';
        this.message = this.message + '<br />click board to play again';
    }
}
// -----------------------------------------------------------------------

setStylesheet(
	".viewer .minefield { "+
		"background: #ddd; "+
		"border: double 3px black; "+
		"border-collapse: separate; "+
		"border-spacing: 2px; "+
	"} \n"+

	".viewer .minefield td { "+
		"cursor: default; "+
		"width: 1.3em; "+
		"height: 1.1em; "+
		"text-align: center; "+
		"vertical-align: center; "+
		"background: #ddd; "+
		"border: 1px solid #ccc; "+
	"} \n"+

	".viewer .minefield td.info, .viewer .minefield td.widebtn { "+
		"width: auto; "+
	"} \n"+

	".minesweeperhide, .minesweeperunshow { "+
		"display: none; "+
	"} \n"+

	".viewer .minefield td.unclicked { "+
		"cursor: pointer; "+
		"border-color: #fff; "+
		"border-right-color: #999; "+
		"border-bottom-color: #999; "+
	"} \n"+
	"",
	"MinesweeperGame");

/*}}}*/

