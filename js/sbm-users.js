// sbm-users.js

var SBM_CONF = {
    hatena: {
        json:   "http://www.kawa.net/rss/sbm-hatena.json",
        icon:   "http://www.kawa.net/rss/images/hatena-16x12.gif",
        link:   "http://b.hatena.ne.jp/entry/",
        param:  "link",
        unit:   " user",
        units:  " users",
        title:  "Hatena::Bookmark"
    },
    delicious: {
        json:   "http://www.kawa.net/rss/sbm-delicious.json",
        icon:   "http://www.kawa.net/rss/images/delicious-12x12.gif",
        link:   "http://del.icio.us/url/",
        param:  "md5",
        unit:   " people",
        units:  " people",
        title:  "del.icio.us"
    },
    spurl: {
        json:   "http://www.kawa.net/rss/sbm-spurl.json",
        icon:   "http://www.kawa.net/rss/images/spurl-12x12.gif",
        link:   "http://www.spurl.net/discover/details.php?urlid=",
        param:  "spurl_id",
        unit:   " spurled",
        units:  " spurled",
        title:  "Spurl.net"
    }
};

function sbm_users_count ( area, url ) {
    if ( ! url ) {
        url = location.protocol + "//" + location.hostname + location.pathname + location.search;
    }
	for( sbm in SBM_CONF ) {
	    sbm_load_json( area, url, sbm );
	}
}

function sbm_load_json ( area, url, type ) {
    var req = sbm_http_request( "GET", SBM_CONF[type].json );
    var __type = type;
    var __url = url;
    var copythis = this;
    var loaded = 0;
    var async = function () {
        if ( req.readyState != 4 ) return;
        if ( loaded ++ ) return;
        var text = sbm_get_response( req );
        sbm_onload( text, area, url, __type );
    }
    req.onreadystatechange = async;
    req.send("");
}

function sbm_onload ( text, area, url, type ) {
    if ( ! text ) return;
    var data = eval( "("+text+")" );
    if ( ! data ) return;
    if ( ! data[url] ) return;
    data[url].link = url;
    var count = data[url][type];
    if ( ! count ) return;

    if ( count > 1 && SBM_CONF[type].units ) {
        count += SBM_CONF[type].units;
    } else if ( count == 1 && SBM_CONF[type].unit ) {
        count += SBM_CONF[type].unit;
    }
    var here = document.getElementById(area);
    var atag   = document.createElement( "a" );
    var imgtag = document.createElement( "img" );
    var tnode  = document.createTextNode( count );
    atag.href = SBM_CONF[type].link+data[url][SBM_CONF[type].param];
    atag.target = "_blank";
    imgtag.src = SBM_CONF[type].icon;
    imgtag.alt = SBM_CONF[type].title;
    atag.title = SBM_CONF[type].title;
    atag.appendChild( imgtag );
    atag.appendChild( tnode );
    here.appendChild( atag );
};

function sbm_http_request ( method, url ) {
    var req;
    if ( window.XMLHttpRequest ) {
        req = new XMLHttpRequest();
    } else if ( window.ActiveXObject ) {
        req = new ActiveXObject( "Microsoft.XMLHTTP" );
    } else {
        return;
    }
    req.open( method, url, true );
    if ( typeof(req.setRequestHeader) != "undefined" ) {
        req.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
    }
    return req;
}

function sbm_get_response ( req ) {
    var text = req.responseText;
    if ( navigator.appVersion.indexOf( "KHTML" ) > -1 ) {
        var esc = escape( text );
        esc = esc.replace( /^(%[89ABab][0-9A-Fa-f])+/, "?" );
        if ( esc.indexOf("%u") < 0 && esc.indexOf("%") > -1 ) {
            text = decodeURIComponent( esc );
        }
    }
    return text;
}