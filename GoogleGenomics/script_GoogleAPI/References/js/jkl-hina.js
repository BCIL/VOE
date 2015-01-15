// ========================================================================
//  jkl-hina.js ---- JavaScript Kantan Library for HTML Template
//  Copyright 2005 Kawasaki Yusuke <u-suke@kawa.net>
// ========================================================================
//  v0.01  2005/05/16  first release
//  v0.02  2005/05/17  Opera 8 BETA supported
//  v0.14  2005/05/23  new rule: prefix "_" on attributes in the template
//  v0.15  2005/06/04  addEventListener or attachEvent for onClick="" etc.
//  v0.16  2005/06/07  bugfix: onClick="" (thanks to daisuke asano)
//  v0.17  2005/06/07  Konquerer 3.3.2 supported
//  v0.18  2005/06/07  Safari 1.2 supported (except attributes)
// ========================================================================

if ( typeof(JKL) == 'undefined' ) JKL = function() {};

//  constructor 

JKL.Hina = function ( hinaarg ) {
    this.hinaid = null;
    this.hinaelem = null;
    this.data = null;
    this.setHinaElement( hinaarg );
    this.filter = new JKL.Hina.Filter();
    return this;
}

//  version of the class

JKL.Hina.VERSION = "0.18";

//  define template id or template element

JKL.Hina.prototype.setHinaElement = function ( hinaarg ) {
    if ( typeof(hinaarg) == "string" ) {
        this.hinaid = hinaarg;              // template id (string)
    } else if ( hinaarg ) {
        this.hinaelem = hinaarg;            // template element (object)
    }
}

//  get template element

JKL.Hina.prototype.getHinaElement = function () {
    if ( this.hinaelem ) return this.hinaelem;
    this.hinaelem = document.getElementById( this.hinaid );
    return this.hinaelem;
}

//  template processing 

JKL.Hina.prototype.expand = function ( data, dest ) {
    var src = this.getHinaElement();
    // debug.print( "src-title: "+src.getAttribute( "title" ) );

    var work = src.cloneNode(true);
    // debug.print( "work-title: "+work.getAttribute( "title" ) );

    this.eachElement( data, work );
    // debug.print( "work: "+work );

    if ( typeof(dest) == "string" ) {
        dest = document.getElementById( dest );
    } else if ( ! dest ) {
        dest = src;
    }
    if ( dest ) {
        var oldid = dest.id;
        work.id = oldid;
        dest.parentNode.replaceChild( work, dest );
    }
    return work;
}

//  template processing for each one elements (recursive)

JKL.Hina.prototype.eachElement = function ( data, elem ) {
    if ( ! elem ) return;
    // debug.print( "nodeName: <"+ elem.nodeName+">" );

    // control syntax using title="@~" 
    var atitle = elem["title"];

    var using_innerHTML = false;
    if ( typeof(atitle) == "string" && atitle.substr(0,1) == "@" ) {
        // debug.print( "title: "+atitle );
        elem.removeAttribute( "title" );    // remove control itself

        // split control command name and its arguments
        var ctlcmd = atitle;
        var ctlarg = "";
        var spc1st = atitle.indexOf( " " );
        if ( spc1st > 0 ) {
            ctlcmd = atitle.substring( 0, spc1st );
            ctlarg = atitle.substring( spc1st+1 );
        }
        // debug.print( "spc1st="+spc1st+" ctlcmd="+ctlcmd+" ctlarg="+ctlarg );

        switch ( ctlcmd ) {
        // title="@if [/BOOL]" -- valid on true, remove on false
        case "@if":
            var val = this.replaceOne( data, ctlarg );
            // debug.print( ctlcmd + " ["+val+"] "+(!!val) );
            if ( ! val ) {
                elem.parentNode.removeChild( elem );
                return;
            }
            break;
        // title="@unless [/BOOL]" -- valid on false, remove on true
        case "@unless":
            var val = this.replaceOne( data, ctlarg );
            // debug.print( ctlcmd + " ["+val+"] "+(!!val) );
            if ( val ) {
                elem.parentNode.removeChild( elem );
                return;
            }
            break;
        // title="@foreach NAME [/ARRAY]" -- loop itself
        case "@foreach":
            var spc2nd = ctlarg.indexOf(" ");
            if ( spc2nd < 0 ) break;    // second argument is required
            var argkey = ctlarg.substring( 0, spc2nd );
            var argval = ctlarg.substring( spc2nd+1 );
            // debug.print( "spc2nd="+spc2nd+" argkey="+argkey+" argval="+argval );
            argkey = this.replaceString( data, argkey );
            argval = this.replaceOne( data, argval );
            // debug.print( argkey + "="+ argval+" ("+typeof(argval)+")" );
            if ( typeof(argval) == "string" ) argval = [ argval ];
            if ( argval ) {
                var dflist = document.createDocumentFragment();
                var valsave = data[argkey];         // save value before started
                for( var j=0; j<argval.length; j++ ) {
                    var looping = elem.cloneNode(true);
                    dflist.appendChild( looping );  // 
                    data[argkey] = argval[j];       // change variable
                    this.eachElement( data, looping );
                }
                data[argkey] = valsave;             // restore after finished
                elem.parentNode.replaceChild( dflist, elem );
                return;                             // done
            }
            break;

        // title="@html [/HTML]" -- replace using innerHTML 
        case "@html":
            var val = this.replaceOne( data, ctlarg );
            elem.innerHTML = val;
            using_innerHTML ++;
            break;
        }
    }

    // replace attributes

    if ( elem.attributes && elem.attributes.length ) {
        var hash = {};
        for ( var i=0; i<elem.attributes.length; i++ ) {
            var attr = elem.attributes[i];
            if ( attr.nodeName.charAt(0) != "_" ) continue;
            var key = attr.nodeName.substr(1).toLowerCase();
            hash[key] = attr;
        }
        for( var key in hash ) {
            var val = this.replaceString( data, hash[key].nodeValue );
            // debug.print( key + "="+ hash[key].nodeValue );
            if ( key.substr(0,2) == "on" ) {
                var ev = key.substr( 2 );               // onclick => click
                this.appendEventEval( elem, ev, val );  // new scope
            } else if ( key == "style" && ! window.opera ) {
                elem.style.cssText = val;
            } else {
                var newattr = document.createAttribute(key);
                newattr.value = val;
                elem.setAttributeNode( newattr );
            }
        }
    }

    //  recursive call for each children

    if ( ! using_innerHTML && elem.childNodes && elem.childNodes.length ) {
        var chinodes = [];
        for ( var i=0; i<elem.childNodes.length; i++ ) {
            chinodes[i] = elem.childNodes[i];          // array at first
        }
        for ( var i=0; i<chinodes.length; i++ ) {
            this.eachElement( data, chinodes[i] );     // process each nodes
        }
    }

    //  replace string in text node

    if ( elem.nodeType == 3 ) { // TEXT_NODE
        // debug.print( "TEXT_NODE: "+ elem.nodeValue.length );
        if ( elem.nodeValue.indexOf("[/") >= 0 ) {
            elem.nodeValue = this.replaceString( data, elem.nodeValue );
        }
    }
}

//  append event listener with new scope

JKL.Hina.prototype.appendEventEval = function ( elem, ev, source ) {
    var func = function(){eval(source);};
    if ( window.addEventListener ) {
        elem.addEventListener( ev, func, false );   // Opera, Firefox
    } else if ( window.attachEvent ) {
        elem.attachEvent( "on"+ev, func );          // IE6
    }
}

//  replace string (Safari 1.2 version)

JKL.Hina.prototype.replaceBySplit = function ( data, text ) {
    var delim = "[/";
    var splt = text.split( delim );
    if ( splt.length < 2 ) return text;
    for( var i=1; i<splt.length; i++ ) {
        var idxof = splt[i].indexOf( "]" );
        if ( idxof > 0 ) {
            var key  = splt[i].substring( 0, idxof );
            var rest = splt[i].substring( idxof+1 );
            splt[i] = this.getval( data, key );
            if ( rest.length ) splt[i] += rest;
        } else {
            splt[i] = delim + splt[i];
        }
    }
    if ( splt.length == 2 && splt[0].length == 0 ) {
        return splt[1];
    }
    return splt.join("");
}

//  replace string (text and variables)

JKL.Hina.prototype.replaceString = function ( data, text ) {
    var copy = this;
    return text.replace( /\[\/([a-zA-Z0-9\-\_\:\/\|\(\)]*)\]/g, 
        function ( str, key ) { return copy.getval( data, key ) }
    );
}

//  replace string (only one variable)

JKL.Hina.prototype.replaceOne = function ( data, text ) {
    var copy = this;
    var key = text.match( /\[\/([a-zA-Z0-9\-\_\:\/\|\(\)]*)\]/ );
    if ( key && key.length == 2 ) {
        // debug.print( "replaceOne: "+text+"="+key[1] );
        return this.getval( data, key[1] );
    }
    // Opera 8: RegExp.lastParen is not available.
    // Konquerer 3.3.2: RegExp.$1 is not available.
    return text;
}

//  replace variable to string

JKL.Hina.prototype.getval = function ( data, key ) {
    var filine = "";
    // debug.print( "getval key: [/"+ key + "]" );

    var spc1st = key.indexOf("|");
    if ( spc1st > 0 ) {
        filine = key.substring( spc1st+1 );
        key = key.substring( 0, spc1st );
    }

    var val = data;
    var klist = key.split( /\// );
    // debug.print( "getval data: ["+val+"]" );
    for ( var i=0; i<klist.length && val; i++ ) {
        val = val[klist[i]];
    }
    // debug.print( "getval val: ["+val+"]" );

    while ( filine != "" ) {
        // debug.print( "filter: ["+filine+"]" );
        var filrest = ""
        var spc2nd = filine.indexOf("|");
        if ( spc2nd > 0 ) {
            filrest = filine.substring( spc2nd+1 ); // rest
            filine = filine.substring( 0, spc2nd ); // first
        }
        var call = this.filter[filine];
        // debug.print( "filter: ["+call+"]" );
        if ( call ) {
            val = call( val );
        }
        filine = filrest;
    }
    if ( typeof val == "undefined" ) return "";
    if ( val == null ) return "";
    return val;
}

// ========================================================================

//  JKL.Hina.Filter class constructor

JKL.Hina.Filter = function () {
    return this;
}

//  filter: escale HTML tag

JKL.Hina.Filter.prototype.escapeHTML = function ( str ) {
    return str.replace( 
        /&/, "&amp;" ).replace( 
        /</, "&lt;"  ).replace( 
        />/, "&gt;" );
}

//  filter: UPPER CASE to lower case

JKL.Hina.Filter.prototype.uc = function ( str ) {
    return str.toUpperCase();
}

//  filter: lower case to UPPER CASE

JKL.Hina.Filter.prototype.lc = function ( str ) {
    return str.toLowerCase();
}

//  filter: integer

JKL.Hina.Filter.prototype["int"] = function ( str ) {
    return parseInt(str);
}

// ========================================================================
//  "replace( regexp, function )" syntax is not avaiable on Safari 1.2.

if ( ("aaa".replace( /aaa/, function(){return "bbb"})) != "bbb" ) {
    JKL.Hina.prototype.replaceString = JKL.Hina.prototype.replaceBySplit;
    JKL.Hina.prototype.replaceOne    = JKL.Hina.prototype.replaceBySplit;
}

// ========================================================================
