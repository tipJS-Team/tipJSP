/*
 * tipJSP(JavaScript Page)
 * opensource JavaScript template engine ver.0.1.0
 * Copyright 2013.12. SeungHyun PAEK, tipJS-Team.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * GitHub: https://github.com/tipJS-Team/tipJSP
 */

var tipJSP = (function(){
	var ST, ED, version, cache, isLocal,
	trim, modifier,
	_reader, _getPath, _pcompile, _compile, _render, _getRs, _setSep;

	ST = '<@', ED = '@>',
	version = '0.1.0', cache = {}, isLocal = ( typeof module !== 'undefined' && module.exports ) ? 1 : 0;

	// trim polyfill
	trim = ( String.prototype.trim ) ? function(s){return ( !s ) ? '' : s.trim();} : (function(){
		var r1;
		return r1 = /^\s*|\s*$/g, function(s){return ( !s ) ? '' : s.replace( r1, '' );};
	})();

////////////////////////////////// modifier
	modifier = (function(){
		var rCurrency, rcrn, rcr, rcn,
		re1, re2, re3, re4, re5, re6;
		rCurrency = /(\d+)(\d{3})/,
		rcrn = /\r\n/g, rcr = /\r/g, rcn = /\n/g,
		re1 = /&/g, re2 = />/g, re3 = /</g,
		re4 = /"/g, //"
		re5 = /'/g, //'
		re6 = /\\/g;
		return {
			cr2:function(s, to){
				return ( !s ) ? '' : s.replace( rcrn, "\n" ).replace( rcr, "\n" ).replace( rcn, to );
			},
			cr2br:function(s){
				return ( !s ) ? '' : this.cr2( s, '<br>' );
			},
			currency:function(n, mk, rg){
				var t0, t1;
				if( !n && n !== 0 ) return "0" + ( mk ? mk : '' );
				if( !( rg instanceof RegExp ) ) rg = rCurrency;
				n = n.toString().split('.'),
				t1 = mk || '',
				t0 = n[0];
				while( rg.test( t0 ) ) {
					t0 = t0.replace( rg, '$1' + ',' + '$2' );
				}
				return t0 + ( n[1] ? "."+n[1]:'' ) + t1;
			},
			cutStrb:function(s, len, rs){
				var tlen, i;
				tlen = 0;
				if( !s ) return '';
				for( i = 0; i < s.length; i++ ) {
					tlen += ( s.charCodeAt( i ) > 128 ) ? 2 : 1;
					if( tlen > len ) return s.substring( 0, i ) + ( rs === undefined || rs === null ? "..." : rs );
				}
				return s;
			},
			escapeHtml:function(s){
				return ( !s ) ? '' : s.replace( re1, '&amp;' ).replace( re2, '&gt;' ).replace( re3, '&lt;' ).replace( re4, '&quot;' ).replace( re5, '&apos;' );
			},
			escapeBackslash:function(s){
				return ( !s ) ? '' : s.replace( re6, '\\\\' );
			},
			stripTag:function(s){
				return ( !s ) ? '' : s.replace( /(<([^>]+)>)/ig, '' );
			},
			toLower:function(s){
				return ( !s ) ? '' : s.toLowerCase();
			},
			toUpper:function(s){
				return ( !s ) ? '' : s.toUpperCase();
			},
			trim:trim
		};
	})();

////////////////////////////////// _reader
	_reader = (function(){
		var rq;
		if( isLocal ) return rq = require( 'fs' ), function(path){return rq.readFileSync( path, 'utf8' );};
		else {
			// source from https://github.com/projectBS/bsJS/blob/master/bs/bsjs.js
			rq = window['XMLHttpRequest'] ? function rq(){ return new XMLHttpRequest; } : ( function(){
				var t0, i, j;
				t0 = 'MSXML2.XMLHTTP', t0 = ['Microsoft.XMLHTTP',t0,t0+'.3.0',t0+'.4.0',t0+'.5.0'],
				i = t0.length;
				while( i-- ){
					try{ new ActiveXObject( j = t0[i] ); }catch( $e ){ continue; }
					break;
				}
				return function rq(){ return new ActiveXObject( j ); };
			} )();
			return rq = rq(), function(path){
				rq.open( "GET", path, false );
				try{rq.send( null );}catch(e){return null;}
				return ( rq.readyState == 4 && rq.status == 200 ) ? rq.responseText : null;
			};
		}
	})();

////////////////////////////////// _getPath
	_getPath = (function(){
		var t0;
		if( isLocal ) return t0 = require( 'path' ), function(opts, fname){return t0.join( opts.settings.views, fname );};
		else return function(opts, fname){return fname;};
	})();

////////////////////////////////// _pcompile
	_pcompile = (function(){
		var _T_PLN, _T_VAL, _T_PAS,
			r1, r2, r3, r4;
		_T_PLN = 0, _T_VAL = 1, _T_PAS = 2,
		r1 = /"/g, //"
		r2 = /::tipJSP::/g,
		r3 = /(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s])+\/\/(?:.*)$)/gm,
		r4 = /\n/g;
		return function(tokens){
			var _VS, ty, ntk,
				i, j, ln, tk, tks, t0;

			_VS = ST + '=', ty = [], ntk = [];

			for( i = 0, j = 1, ln = tokens.length; i < ln; i++ ){
				tk = tokens[i];
				if( tk.indexOf( _VS ) > -1 ){
					tks = tk.split( _VS );
					if( tks.length > 1 )
						ntk.push( tks[0].replace( r1, '\\"' ) ), ntk.push( tks[1] ),
						ty.push( _T_PLN ), ty.push( _T_VAL );
					else ntk.push( tks[0] ), ty.push( _T_VAL );
				}else if( tk.indexOf( ST ) > -1 ){
					tks = tk.split( ST );
					if( tks.length > 1 )
						ty.push( _T_PLN ), ty.push( _T_PAS ),
						ntk.push( tks[0].replace( r1, '\\"' ) ), t0 = tks[1];
					else ty.push( _T_PAS ), t0 = tks[0];
					t0 = t0.replace( r2, '\n' ).replace( r3, '$1' ).replace(r4, '::tipJSP::');
					ntk.push( t0 );
				}else ntk.push( tk.replace( r1, '\\"' ) ), ty.push( _T_PLN );
			}
			return [ty, ntk];
		};
	})();


////////////////////////////////// _compile
	_compile = (function(){
		var _T_VAL, _T_PAS,
			_push, r1, r2;

		_T_VAL = 1, _T_PAS = 2,
		_push = 'buf.push(',
		r1 = /::tipJSP::/g,
		r2 = /"|'/g; //"

		return function(ty, ntk, opts, lln, path){
			var rt,
				i, ln, j, k, tk, t0;

			rt = [],

			rt.push( 'var buf=[],_pt="'+path+'";try{with(_tipJSP){' );
			for( i = 0, ln = ntk.length; i < ln; i++ ){
				tk = ntk[i], t0 = tk.match( r1 );
				if( t0 ) lln += t0.length;
				rt.push( "_ln=" + lln + ';' );
				if( ty[i] == _T_VAL ){
					tk = trim( tk.replace( r1, '' ) ).split( '|' ), k = 1;
					while( k < tk.length ){
						if( ( t0 = tk[k++] ) && ( t0 = t0.split( ',' ) ) ){
							tk[0] = ( modifier[ t0[0] ] ? '_mdf.' : '' ) + t0[0] + '(' + tk[0],
							j = 1;
							while( j < t0.length ) tk[0] += ',' + t0[j++];
							tk[0] += ')';
						}
					}
					rt.push( _push + tk[0] + ");" );
				}else if( ty[i] == _T_PAS ){
					if( !( tk = trim( tk.replace( r1, '' ) ) ).indexOf( 'include' ) ){
						if( typeof ( tk = _renderFile( _getPath( opts, trim( tk.substr( 7 ).replace( r2, '' ) ) ), opts ) ) == 'object' ) throw tk;
						rt.push( _push + '"' + tk + '"' + ");" );
					}else if( tk == '/' ) rt.push( "}" );
					else if( !tk.indexOf( '//' ) );
					else rt.push( ( ( !tk.indexOf( 'if' ) || !tk.indexOf( 'else' ) || !tk.indexOf( 'for' ) || !tk.indexOf( 'while' ) || !tk.indexOf( 'switch' ) ) && tk.indexOf( '{' ) != --tk.length ? tk + "{" : tk ) );
				}else	rt.push( _push + '"' + tk + '"' + ");" );
			}
			return rt.push( "} return [buf.join(''), _ln];}catch(e){e.p=_pt,e.ln=_ln;throw e;};" ), rt.join( '' );
		};
	})();

////////////////////////////////// _render
	_render = (function(){
		var r1, r2, r3, r4, r5;

		r1 = /\r\n/g,
		r2 = /\r/g,
		r3 = /\\/g,
		r4 = /\n/g,
		r5 = /\[\[#[a-zA-Z0-9_-]*\]\]/g;
		return function(html, opts, tid, path){
			var t0, t1, i;
			html = html.replace( r1, "\n" ).replace( r2, "\n" ).replace( r3, '\\\\' ).replace( r4, '::tipJSP::' );
			if( typeof tid == "string" ){
				t0 = html.split( "[[#" ),
				t1 = new RegExp( "^"+tid+"]]" );
				for( i = t0.length; i--; ) if( t0[i].match( t1 ) ){html = t0[i].replace( t1, '' ); break;}
			}else html = html.replace( r5, '' );
			i = 1, t0 = html.split( ED ),
			t0 = _pcompile(t0);
			try{return new Function( "_ln, _tipJSP, _mdf", _compile( t0[0], t0[1], opts, i, modifier.escapeBackslash( path ) ) )( i, opts, modifier )[0];}
			catch(e){return e;}
		};
	})();

//////////////////////////////////////// _renderFile
	function _renderFile(path, opts){
		return _render( opts.cache ? cache[path] || ( cache[path] = _reader( path ) ) : _reader( path ), opts, null, path );
	}

//////////////////////////////////////// _getRs
	_getRs = (function(){
		var r1, t0;
		r1 = /::tipJSP::/g,
		t0 = function(e){return [e.message, e.p || 'tipJSP template', e.ln ? 'line:' + e.ln : ''].join('\n');};
		return function(rs){
			return ( typeof rs == 'object' ) ? t0( rs ) : rs.replace( r1, '\n' );
		};
	})();

//////////////////////////////////////// _setSep
	_setSep = function(start, end){
		ST = start, ED = end;
	};

//////////////////////////////////////// return for node.js
	if( isLocal )
		// for express
		module.exports = function(path, opts, fn){
			return fn( null, _getRs( _renderFile( path, opts ) ) );
		},
		module.exports.version = version,
		module.exports.render = function(html, opts, tid){
			return ( html && opts ) ? _getRs( _render( html, opts, tid ) ) : null;
		},
		module.exports.renderFile = function(path, opts){
			return _getRs( _renderFile( path, opts ) );
		},
		module.exports.setSep = function(start, end){
			return _setSep( start, end ), module.exports;
		};
//////////////////////////////////////// return for web browser
	else return {
		version : version,
		render : function( html, opts, tid, targetEl ){
			var rt;
			if( html && opts ){
				opts.cache = opts.cache === undefined ? 1 : opts.cache,
				rt = _getRs( _render( html, opts, tid ) );
				if( targetEl ) targetEl.innerHTML = rt;
				return rt;
			}else return null;
		},
		renderFile : function(path, opts){
			return opts.cache = opts.cache === undefined ? 1 : opts.cache, _getRs( _renderFile( path, opts ) );
		},
		setSep : function(start, end){
			return _setSep( start, end ), this;
		}
	};
})();
