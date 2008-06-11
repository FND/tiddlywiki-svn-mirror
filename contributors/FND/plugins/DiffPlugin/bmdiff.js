/*
 * adapted version of Bradley Meck's diff functions
 *
 * License:
 *  Creative Commons Attribution-ShareAlike 2.5 License
 *  http://creativecommons.org/licenses/by-sa/2.5/
 */

bmdiff = {
	diffString: function( o, n ) {
		if (o==n) return ""; // simple check, saves time if true
		var error = 5;
		var reg = new RegExp( "\\n|(?:.{0,"+error+"})", "g" );
		var oarr = o.match( reg ); // dices text into chunks
		var narr = n.match( reg );
		var out = this.diff(oarr,narr); // compare the word arrays
		var str = ""; // construct output
		for (i=0; i<out.length; i++) {
			switch (out[i].change) {
				case "ADDED":
					str+="<ins>";
					str+=narr.slice(out[i].index,out[i].index+out[i].length).join("");
					str+="</ins> ";
					break;
				case "DELETED":
					str+="<del>";
					str+=oarr.slice(out[i].index,out[i].index+out[i].length).join("");
					str+="</del> ";
					break;
				default:
					str+=oarr.slice(out[i].index,out[i].index+out[i].length).join("");
					break;
			}	
		}
		return str;
	},
	diff: function( oldArray, newArray ) {
		// finds the differences between one set of objects and another.
		// The objects do not need to be Strings.  It outputs an array of objects with the properties value and change.
		// This function is pretty hefty but appears to be rather light for a diff and tops out at O(N^2) for absolute worst cast scenario.
		var newElementHash = { };
		for( var i = 0; i < newArray.length; i++ ) {
			if( ! newElementHash [ newArray [ i ] ] ) {
				newElementHash [ newArray [ i ] ] = [ ];
			}
			newElementHash [ newArray [ i ] ].push( i );
		}
		var substringTable = [ ];
		for( var i = 0; i < oldArray.length; i++ ) {
			if(newElementHash [ oldArray [ i ] ] ) {
				var locations = newElementHash [ oldArray [ i ] ] ;
				for( var j = 0; j < locations.length; j++){
					var length = 1;
					while( i + length < oldArray.length && locations [ j ] + length < newArray.length
						&& oldArray [ i + length ] == newArray [ locations [ j ] + length ] ){
						length++;
					}
					substringTable.push( {
						oldArrayIndex : i,
						newArrayIndex : locations [ j ],
						matchLength : length
					} );
				}
			}
		}
		substringTable.sort( function( a, b ) {
			if ( a.matchLength > b.matchLength /* a is less than b by some ordering criterion */ ) {
				return -1;
			}
			if ( a.matchLength < b.matchLength /* a is greater than b by the ordering criterion */ ) {
				return 1;
			}
			// a must be equal to b
			return 0
		} );
		//displayMessage( substringTable.toSource( ) );
		for( var i = 0; i < substringTable.length; i++) {
			for( var j = 0; j < i; j++) {
				var oldDelta = substringTable [ i ].oldArrayIndex + substringTable [ i ].matchLength - 1 - substringTable [ j ].oldArrayIndex;
				var newDelta = substringTable [ i ].newArrayIndex + substringTable [ i ].matchLength - 1 - substringTable [ j ].newArrayIndex;
				//displayMessage( "oldDelta ::: " + oldDelta );
				//displayMessage( "newDelta ::: " + newDelta );
				//displayMessage( "matchLength ::: " + substringTable [ j ].matchLength );
				if( ( oldDelta >= 0 && oldDelta <= substringTable [ j ].matchLength )
				|| ( newDelta >= 0 && newDelta <= substringTable [ j ].matchLength )
				|| ( oldDelta < 0 && newDelta > 0 )
				|| ( oldDelta > 0 && newDelta < 0 ) ) {
					substringTable.splice( i, 1 );
					i--;
					break;
				}
			}
		}
		//displayMessage( substringTable.toSource(  ) );
		substringTable.sort( function( a, b ) {
			if ( a.oldArrayIndex < b.oldArrayIndex /* a is less than b by some ordering criterion */ ) {
				return -1;
			}
			if ( a.oldArrayIndex > b.oldArrayIndex /* a is greater than b by the ordering criterion */ ) {
				return 1;
			}
			// a must be equal to b
			return 0
		} );
		//displayMessage( substringTable.toSource( ) );
		var oldArrayIndex = 0;
		var newArrayIndex = 0;
		var results = [ ];
		for( var i = 0; i < substringTable.length; i++ ) {
			if( oldArrayIndex != substringTable [ i ].oldArrayIndex ) {
				results.push( {
					change : "DELETED",
					length : substringTable [ i ].oldArrayIndex - oldArrayIndex,
					index : oldArrayIndex
				} );
			}
			if( newArrayIndex != substringTable [ i ].newArrayIndex ) {
				results.push( {
					change : "ADDED",
					length : substringTable [ i ].newArrayIndex - newArrayIndex,
					index : newArrayIndex
				} );
			}
			results.push( {
				change : "STAYED",
				length : substringTable [ i ].matchLength,
				index : substringTable [ i ].oldArrayIndex
			} );
			oldArrayIndex = substringTable [ i ].oldArrayIndex + substringTable [ i ].matchLength;
			newArrayIndex = substringTable [ i ].newArrayIndex + substringTable [ i ].matchLength;
		}
		if( oldArrayIndex != oldArray.length ) {
			results.push( {
				change : "DELETED",
				length : oldArray.length - oldArrayIndex,
				index : oldArrayIndex
			} );
		}
		if( newArrayIndex != newArray.length ) {
			results.push( {
				change : "ADDED",
				length : newArray.length - newArrayIndex,
				index : newArrayIndex
			} );
		}
		return results;
	}
}
