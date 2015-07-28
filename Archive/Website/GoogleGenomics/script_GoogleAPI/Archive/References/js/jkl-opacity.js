//  jkl-opacity.js ---- 透明度クラス
//  Copyright 2005 Kawasaki Yusuke <u-suke [at] kawa.net>
//  2005/04/06 - 最初のバージョン

// 親クラス

if ( typeof(JKL) == 'undefined' ) JKL = function() {};

// JKL.Opacity コンストラクタの定義

JKL.Opacity = function( elem ) {
    this.elem = elem;                   // 対象となる要素
    return this;
}

// 対象オブジェクトの変更

JKL.Opacity.prototype.set = function ( newid ) {
    this.elem = newid;
    return this;
};

// 即時に表示する

JKL.Opacity.prototype.show = function () {
    this.setOpacity( 1.0 );
    this.elem.style.display = "";
}

// 即時に消去する

JKL.Opacity.prototype.hide = function () {
    this.elem.style.display = "none";
    this.setOpacity( 1.0 );
}

// 透明度を設定する

JKL.Opacity.prototype.setOpacity = function ( opac ) {
    this.elem.style.KhtmlOpacity = opac;        // Safari
    this.elem.style.MozOpacity = opac;          // Firefox
    this.elem.style.opacity = opac;             // CSS2
    this.elem.style.filter = "Alpha(opacity:"+(opac*100)+")";   // IE6
}

// フェードインする

JKL.Opacity.prototype.fadeIn = function ( sec ) {
    if ( ! sec ) sec = 1.0;         // デフォルトでは1秒
    var opac = 0.0;
    var copy = this;
    var intimer = function() {
        copy.setOpacity( opac );
        opac += 0.2;
        if ( opac < 1 ) {
            setTimeout( intimer, sec*100 );
        } else {
            copy.show();
        }
    }
    this.hide();
    intimer();
}

// フェードアウトする

JKL.Opacity.prototype.fadeOut = function ( sec ) {
    if ( ! sec ) sec = 1.0;         // デフォルトでは1秒
    if ( window.opera ) {
        this.hide();                // Opera は非対応
    }
    var opac = 1.0;
    var copy = this;
    var outtimer = function() {
        copy.setOpacity( opac );
        opac -= 0.2;
        if ( opac > 0 ) {
            setTimeout( outtimer, sec*100 );
        } else {
            copy.hide();
        }
    }
    this.show();
    outtimer();
}
