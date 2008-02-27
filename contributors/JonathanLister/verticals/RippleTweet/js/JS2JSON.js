/***
    json.js
    2008-02-14

    Public Domain

    No warranty expressed or implied. Use at your own risk.

    This file has been superceded by http://www.JSON.org/json2.js

    See http://www.JSON.org/js.html

    This file adds these methods to JavaScript:

        array.toJSONString(whitelist)
        boolean.toJSONString()
        date.toJSONString()
        number.toJSONString()
        object.toJSONString(whitelist)
        string.toJSONString()
            These methods produce a JSON text from a JavaScript value.
            It must not contain any cyclical references. Illegal values
            will be excluded.

            The default conversion for dates is to an ISO string. You can
            add a toJSONString method to any date object to get a different
            representation.

            The object and array methods can take an optional whitelist
            argument. A whitelist is an array of strings. If it is provided,
            keys in objects not found in the whitelist are excluded.

        string.parseJSON(filter)
            This method parses a JSON text to produce an object or
            array. It can throw a SyntaxError exception.

            The optional filter parameter is a function which can filter and
            transform the results. It receives each of the keys and values, and
            its return value is used instead of the original value. If it
            returns what it received, then structure is not modified. If it
            returns undefined then the member is deleted.

            Example:

            // Parse the text. If a key contains the string 'date' then
            // convert the value to a date.

            myData = text.parseJSON(function (key, value) {
                return key.indexOf('date') >= 0 ? new Date(value) : value;
            });

    It is expected that these methods will formally become part of the
    JavaScript Programming Language in the Fourth Edition of the
    ECMAScript standard in 2008.

    This file will break programs with improper for..in loops. See
    http://yuiblog.com/blog/2006/09/26/for-in-intrigue/

    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    Use your own copy. It is extremely unwise to load untrusted third party
    code into your pages.
***/

/*jslint evil: true */

/*members "\b", "\t", "\n", "\f", "\r", "\"", "\\", apply, charCodeAt,
    floor, getUTCDate, getUTCFullYear, getUTCHours, getUTCMinutes,
    getUTCMonth, getUTCSeconds, hasOwnProperty, join, length, parseJSON,
    prototype, push, replace, test, toJSONString, toString
*/

// Augment the basic prototypes if they have not already been augmented.

if (!Object.prototype.toJSONString) {

    Array.prototype.toJSONString = function (w) {
        var a = [],     // The array holding the partial texts.
            i,          // Loop counter.
            l = this.length,
            v;          // The value to be stringified.

// For each value in this array...

        for (i = 0; i < l; i += 1) {
            v = this[i];
            switch (typeof v) {
            case 'object':

// Serialize a JavaScript object value. Treat objects thats lack the
// toJSONString method as null. Due to a specification error in ECMAScript,
// typeof null is 'object', so watch out for that case.

                if (v !== null) {
                    a.push(ObjectToJSONString(v,w));
                } else {
                    a.push('null');
                }
                break;

            case 'string':
            case 'number':
            case 'boolean':
                a.push(v.toJSONString());
                break;
            default:
                a.push('null');
            }
        }

// Join all of the member texts together and wrap them in brackets.

        return '[' + a.join(',') + ']';
    };


    Boolean.prototype.toJSONString = function () {
        return String(this);
    };


    Date.prototype.toJSONString = function () {

// Eventually, this method will be based on the date.toISOString method.

        function f(n) {

// Format integers to have at least two digits.

            return n < 10 ? '0' + n : n;
        }

        return '"' + this.getUTCFullYear()   + '-' +
                   f(this.getUTCMonth() + 1) + '-' +
                   f(this.getUTCDate())      + 'T' +
                   f(this.getUTCHours())     + ':' +
                   f(this.getUTCMinutes())   + ':' +
                   f(this.getUTCSeconds())   + 'Z"';
    };


    Number.prototype.toJSONString = function () {

// JSON numbers must be finite. Encode non-finite numbers as null.

        return isFinite(this) ? String(this) : 'null';
    };


    function ObjectToJSONString(o,w) {
        var a = [],     // The array holding the partial texts.
            k,          // The current key.
            i,          // The loop counter.
            v;          // The current value.

// If a whitelist (array of keys) is provided, use it assemble the components
// of the object.

        if (w) {
            for (i = 0; i < w.length; i += 1) {
                k = w[i];
                if (typeof k === 'string') {
                    v = o[k];
                    switch (typeof v) {
                    case 'object':

// Serialize a JavaScript object value. Ignore objects that lack the
// toJSONString method. Due to a specification error in ECMAScript,
// typeof null is 'object', so watch out for that case.

                        if (v) {
                            if (v !== null) {
                                a.push(k.toJSONString() + ':' +
                                       ObjectToJSONString(v,w));
                            }
                        } else {
                            a.push(k.toJSONString() + ':null');
                        }
                        break;

                    case 'string':
                    case 'number':
                    case 'boolean':
                        a.push(k.toJSONString() + ':' + v.toJSONString());

// Values without a JSON representation are ignored.

                    }
                }
            }
        } else {

// Iterate through all of the keys in the object, ignoring the proto chain
// and keys that are not strings.

            for (k in o) {
                if (typeof k === 'string' &&
                        Object.prototype.hasOwnProperty.apply(o, [k])) {
                    v = o[k];
                    switch (typeof v) {
                    case 'object':

// Serialize a JavaScript object value. Ignore objects that lack the
// toJSONString method. Due to a specification error in ECMAScript,
// typeof null is 'object', so watch out for that case.

                        if (v) {
                            if (v !== null) {
                                a.push(k.toJSONString() + ':' +
                                       ObjectToJSONString(v));
                            }
                        } else {
                            a.push(k.toJSONString() + ':null');
                        }
                        break;

                    case 'string':
                    case 'number':
                    case 'boolean':
                        a.push(k.toJSONString() + ':' + v.toJSONString());

// Values without a JSON representation are ignored.

                    }
                }
            }
        }

// Join all of the member texts together and wrap them in braces.

        return '{' + a.join(',') + '}';
    };
}