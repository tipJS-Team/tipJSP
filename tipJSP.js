/*
 * tipJSP(JavaScript Page)
 * opensource JavaScript template engine ver.0.4.1
 * Copyright 2013.12. SeungHyun PAEK, tipJS-Team.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * GitHub: https://github.com/tipJS-Team/tipJSP
 */

var tipJSP = (function(){
	var ST, ED, version, cache, ccache, isCache, isLocal,
	trim, escBackSh,
	_modifier, _reader, _getPath, _compile, _extends, _render, _getRs, _setSep, _getUrl;

	ST = '<@', ED = '@>',
	version = '0.4.1', cache = {}, ccache = {}, isLocal = ( typeof module !== 'undefined' && module.exports ) ? 1 : 0, isCache = isLocal ? 0 : 1;

	// trim polyfill
	trim = ( String.prototype.trim ) ? function(s){return ( !s ) ? '' : s.trim();} : (function(){
		var r1;
		return r1 = /^\s*|\s*$/g, function(s){return ( !s ) ? '' : s.replace( r1, '' );};
	})(),
	escBackSh = (function(){
		var r;
		return r = /\\/g, function(s){return ( !s ) ? '' : s.replace( r, '\\\\' );};
	})(),
	_getUrl = function(url){
		return isCache ? url : isLocal ? url : url + (url.indexOf("?") < 0 ? "?" : "&") + Math.random();
	};

////////////////////////////////// _modifier
	_modifier = (function(){
		var rcur, rcrn, rcn, redt,
		re1, re2, re3, re4, re5;
		rcur = /(\d+)(\d{3})/,
		rcrn = /\r\n|\r/g, rcn = /\n/g,
		re1 = /&/g, re2 = />/g, re3 = /</g,
		re4 = /"/g, //"
		re5 = /'/g, //'
		redt = /(yyyy|yy|MM|dd|HH|hh|mm|ss|ap)/g,
		restag = /(<([^>]+)>)/ig;
		return {
			cr2:function(s, to){
				return ( !s ) ? '' : s.replace( rcrn, "\n" ).replace( rcn, to );
			},
			cr2br:function(s){
				return ( !s ) ? '' : this.cr2( s, '<br />' );
			},
			cutStrb:function(s, len, rs){
				var tlen, i, j;
				tlen = 0;
				if( !s ) return '';
				for( i = 0, j = s.length; i < j; i++ ) {
					tlen += ( s.charCodeAt( i ) > 128 ) ? 2 : 1;
					if( tlen > len ) return s.substring( 0, i ) + ( rs === undefined || rs === null ? "..." : rs );
				}
				return s;
			},
			date:function(v, f, ap){
				var D;
				D = v ? new Date( v ) : new Date;
				return f.replace( redt, function(f){
					var t0;
					switch( f ){
					case"yyyy":return ''+D.getFullYear();
					case"yy":t0=''+(D.getFullYear() % 1000);break;
					case"MM":t0=''+(D.getMonth() + 1);break;
					case"dd":t0=''+D.getDate();break;
					case"HH":t0=''+D.getHours();break;
					case"hh":t0=''+((t0=D.getHours()%12)?t0:12);break;
					case"ap":t0=D.getHours()<12?ap?ap[0]:'AM':ap?ap[1]:'PM';break;
					case"mm":t0=''+D.getMinutes();break;
					case"ss":t0=''+D.getSeconds();break;
					default: return f;
					}
					return t0.length == 1 ? '0'+t0 : t0;
				});
			},
			escapeHtml:function(s){
				return ( !s ) ? '' : s.replace( re1, '&amp;' ).replace( re2, '&gt;' ).replace( re3, '&lt;' ).replace( re4, '&quot;' ).replace( re5, '&apos;' );
			},
			escapeBackslash:escBackSh,
			numcomma:function(n, mk, rg){
				var t0, t1;
				if( !n && n !== 0 ) return "0" + ( mk ? mk : '' );
				if( !( rg instanceof RegExp ) ) rg = rcur;
				n = n.toString().split('.'),
				t1 = mk || '',
				t0 = n[0];
				while( rg.test( t0 ) ) {
					t0 = t0.replace( rg, '$1' + ',' + '$2' );
				}
				return t0 + ( n[1] ? "."+n[1]:'' ) + t1;
			},
			stripTag:function(s){
				return ( !s ) ? '' : s.replace( restag, '' );
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
				rq.open( 'GET', path, false );
				try{rq.send( null );}catch(e){return null;}
				return ( rq.readyState == 4 && rq.status == 200 ) ? rq.responseText : null;
			};
		}
	})();

////////////////////////////////// _getPath
	_getPath = (function(){
		var t0;
		if( isLocal ) return t0 = require( 'path' ), function(opts, fname){return t0.join( ( opts.settings ? opts.settings.views : process.cwd() ), fname );};
		else return function(opts, fname){return fname;};
	})();

////////////////////////////////// _compile
	_compile = (function(){
		var _push, r1, r2, r3, r4, r5;

		_push = '_$$bf.push(',
		r1 = /"/g,//"
		r2 = /::tipJSP::/g,
		r3 = /(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s])+\/\/(?:.*)$)/gm,
		r4 = /\n/g,
		r5 = /"|'/g;//"

		return function(tokens, opts, lln, path){
			var rt, i, ln, j, jj, k, kk, tk, ntk, tks, t0;

			rt = [];
			rt.push( '_$$pt="'+path+'";_$$ln='+lln+';' );

			for( i = 0, ln = tokens.length; i < ln; i++ ){
				tk = tokens[i],
				t0 = tk.match( r2 );
				if( t0 ) rt.push( "_$$ln=" + (lln += t0.length) + ';' );
				if( tk.indexOf( ST ) > -1 ){
					tks = tk.split( ST );
					rt.push( _push + '"' + tks[0].replace( r1, '\\"' ) + '"' + ');' );
					if( !tks[1].indexOf( '=' ) ){ // val
						ntk = trim( tks[1].substr(1).replace( r2, '' ) ).split( '|' ),
						k = 1, kk = ntk.length;
						while( k < kk ){
							if( ( t0 = ntk[k++] ) && ( t0 = t0.split( ',' ) ) ){
								ntk[0] = ( _modifier[ t0[0] ] ? '_$$mf.' : '' ) + t0[0] + '(' + ntk[0],
								j = 1, jj = t0.length;
								while( j < jj ) ntk[0] += ',' + t0[j++];
								ntk[0] += ')';
							}
						}
						rt.push( _push + ntk[0] + ');' );
					}else if( !tks[1].indexOf( '#' ) ){ // cus pas
						ntk = trim( tks[1].substr(1).replace( r2, '\n' ).replace( r3, '$1' ).replace( r4, '::tipJSP::' ).replace( r2, '' ) );
						if( !ntk.indexOf( '/' ) ) rt.push( '}' );
						else
							ntk = (t0 = ntk.split( ' in ' )).length > 1 ? 'for(var ' + ntk + ' ){': 'if( ' + ntk + ' ){',
							rt.push( ntk );
					}else{ // pas
						if( !( t0 = trim( tks[1].replace( r2, '\n' ).replace( r3, '$1' ).replace( r4, '::tipJSP::' ).replace( r2, '' ) ) ).indexOf( 'include' ) ){
							if( typeof ( t0 = _renderFile( _getPath( opts, trim( t0.substr( 7 ).replace( r5, '' ) ) ), opts ) ) == 'object' ) throw t0;
							rt.push( _push + '"' + t0.replace( r1, '\\"' ) + '"' + ');' );
						}else if( !t0.indexOf( 'extends' ) );
						else if( !t0.indexOf( 'match' ) ) rt.push( opts._$$blk[trim( t0.substr( 5 ).replace( r5, '' ) )] );
						else rt.push( t0 );
					}
				}else rt.push( _push + '"' + tk.replace( r1, '\\"' ) + '"' + ');' );
			}
			return [rt.join( '' ),lln];
		};
	})();

////////////////////////////////// _extends
	_extends = (function(){
		var r1;

		r1 = /::tipJSP::/g;
		return function(base, html, opts, path){
			var t0, t1, i, j, key, body, ln, blk;
			blk = {}, ln = 2,
			t0 = html.split( new RegExp( ST+'\s*match\s*' ) );
			for(i = 1, j = t0.length; i < j; i++){
				key = t0[i].substr( 0, t0[i].indexOf( ED ) ),
				body = t0[i].substr( ( t0[i].indexOf( ED ) + ED.length ) );
				if( path ) t1 = isCache ?
					ccache[path+key] ||	( ccache[path+key] = _compile( body.split( ED ), opts, ln, escBackSh( path ) ) ) :
					_compile( body.split( ED ), opts, ln, escBackSh( path ) );
				blk[trim( key )] = t1[0], ln = t1[1];
			}
			return opts._$$blk = blk, _render( null, opts, null, base );
		};
	})();

////////////////////////////////// _render
	_render = (function(){
		var r1, r2, r3, r4;

		r1 = /\r\n|\r/g,
		r2 = /\\/g,
		r3 = /\n/g,
		r4 = /\[\[#[a-zA-Z0-9_-]*\]\]/g;
		return function(html, opts, tid, path){
			var t0, t1, i;
			if( path ) html = isCache ? cache[path] || ( cache[path] = _reader( path ) ) : _reader( _getUrl( path ) );
			html = html.replace( r1, '\n' ).replace( r2, '\\\\' ).replace( r3, '::tipJSP::' );
			t0 = html.substr(0, ( t1 = html.indexOf( '\n' ) ) > -1 ? t1 : html.length );
			t1 = new RegExp( ST+'\s*extends\s*' );
			if( t1.test( t0 ) )
				return t1 = trim( t0.substring( t0.indexOf( 'extends' )+7, t0.indexOf( ED ) ) ), _extends( t1, html, opts, path );
			else{
				if( typeof tid == 'string' ){
					t0 = html.split( '[[#' ),
					t1 = new RegExp( '^'+tid+']]' );
					for( i = t0.length; i--; ) if( t0[i].match( t1 ) ){html = t0[i].replace( t1, '' ); break;}
				}else html = html.replace( r4, '' );
				i = 1;
				if( path ) t1 = isCache ?
					ccache[path] ||	( ccache[path] = _compile( html.split( ED ), opts, i, escBackSh( path ) ) ) :
					_compile( html.split( ED ), opts, i, escBackSh( path ) );
				try{return t0 = ['var _$$bf=[],_$$ln,_$$pt;try{with(_$$opt){',	t1[0], '} return [_$$bf.join(""),_$$ln];}catch(e){e.p=_$$pt,e.ln=_$$ln;throw e;};'],
					new Function( '_$$opt, _$$mf', t0.join('') )( opts, _modifier )[0];}
				catch(e){return e;}
			}
		};
	})();

//////////////////////////////////////// _renderFile
	function _renderFile(path, opts){
		return _render( null, opts, null, path );
	}

//////////////////////////////////////// _getRs
	_getRs = (function(){
		var r1, t0;
		r1 = /::tipJSP::/g,
		t0 = function(e){return e.ln ? [e.message, e.p || 'tipJSP template', e.ln ? 'line:' + e.ln : ''].join('\n'):'SyntaxError ' + (e.p ? 'in ' + e.p:'while compiling tipJSP');};
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
		exports = module.exports = function(path, opts, fn){
			return fn( null, _getRs( _renderFile( _getPath( opts, path ), opts ) ) );
		},
		exports.version = version,
		exports.render = function(html, opts, tid){
			return ( html ) ? _getRs( _render( html, opts, tid ) ) : null;
		},
		exports.renderFile = function(path, opts){
			return _getRs( _renderFile( _getPath( opts, path ), opts ) );
		},
		exports.setSep = function(start, end){
			return _setSep( start, end ), exports;
		},
		exports.setModifier = function(modifier){
			var k;
			for(k in modifier) _modifier[k] = modifier[k];
			return exports;
		},
		exports.setCache = function(flg){
			return isCache = flg, exports;
		};
//////////////////////////////////////// return for web browser
	else return {
		version : version,
		render : function(html, opts, tid, targetEl){
			var rt;
			if( html ){
				rt = _getRs( _render( html, opts, tid ) );
				if( targetEl ) targetEl.innerHTML = rt;
				return rt;
			}else return null;
		},
		renderFile : function(path, opts){
			return _getRs( _renderFile( path, opts ) );
		},
		setSep : function(start, end){
			return _setSep( start, end ), this;
		},
		setModifier : function(modifier){
			var k;
			for(k in modifier) _modifier[k] = modifier[k];
			return this;
		},
		setCache : function(flg){return isCache = flg, this;}
	};
})();
