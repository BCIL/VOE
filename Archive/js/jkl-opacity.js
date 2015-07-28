//  jkl-opacity.js ---- �����x�N���X
//  Copyright 2005 Kawasaki Yusuke <u-suke [at] kawa.net>
//  2005/04/06 - �ŏ��̃o�[�W����

// �e�N���X

if ( typeof(JKL) == 'undefined' ) JKL = function() {};

// JKL.Opacity �R���X�g���N�^�̒�`

JKL.Opacity = function( elem ) {
    this.elem = elem;                   // �ΏۂƂȂ�v�f
    return this;
}

// �ΏۃI�u�W�F�N�g�̕ύX

JKL.Opacity.prototype.set = function ( newid ) {
    this.elem = newid;
    return this;
};

// �����ɕ\������

JKL.Opacity.prototype.show = function () {
    this.setOpacity( 1.0 );
    this.elem.style.display = "";
}

// �����ɏ�������

JKL.Opacity.prototype.hide = function () {
    this.elem.style.display = "none";
    this.setOpacity( 1.0 );
}

// �����x��ݒ肷��

JKL.Opacity.prototype.setOpacity = function ( opac ) {
    this.elem.style.KhtmlOpacity = opac;        // Safari
    this.elem.style.MozOpacity = opac;          // Firefox
    this.elem.style.opacity = opac;             // CSS2
    this.elem.style.filter = "Alpha(opacity:"+(opac*100)+")";   // IE6
}

// �t�F�[�h�C������

JKL.Opacity.prototype.fadeIn = function ( sec ) {
    if ( ! sec ) sec = 1.0;         // �f�t�H���g�ł�1�b
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

// �t�F�[�h�A�E�g����

JKL.Opacity.prototype.fadeOut = function ( sec ) {
    if ( ! sec ) sec = 1.0;         // �f�t�H���g�ł�1�b
    if ( window.opera ) {
        this.hide();                // Opera �͔�Ή�
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
