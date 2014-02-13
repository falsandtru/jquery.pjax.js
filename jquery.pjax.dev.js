/*
 * 
 * pjax
 * 
 * ---
 * @Copyright(c) 2012, falsandtru
 * @license MIT http://opensource.org/licenses/mit-license.php
 * @version 1.31.1
 * @updated 2014/02/13
 * @author falsandtru https://github.com/falsandtru/
 * @CodingConventions Google JavaScript Style Guide
 * ---
 * Note:
 * 
 * ---
 * Example:
 * @jquery 1.7.2
 * 
 * $.pjax( { area: 'div.pjax:not(.no-pjax)' } ) ;
 * 
 * ---
 * Document:
 * https://github.com/falsandtru/jquery.pjax.js
 * 
 */

( function ( jQuery, window, document, undefined ) {
  
  var Store ;
  
  function registrate( jQuery, window, document, undefined, Store ) {
    jQuery.fn[ Store.name ] = jQuery[ Store.name ] = function () {
      
      return initialize.apply( this, [
        jQuery, window, document, undefined, Store
      ].concat( [].slice.call( arguments ) ) ) ;
    } ;
    Store.setProperties.call( jQuery[ Store.name ] ) ;
  }
  
  function initialize( jQuery, window, document, undefined, Store, option ) {
    
    /* validator */ var validator = option.validator instanceof Object ? option.validator : false ;
    /* validator */ validator = validator ? validator.clone( { name: 'jquery.pjax.js', base: true, timeout: { limit: option && option.ajax && option.ajax.timeout ? option.ajax.timeout + validator.timeout.limit : validator.timeout.limit } } ) : false ;
    /* validator */ validator && validator.start() ;
    /* validator */ validator && validator.test( '++', 1, option, 'pjax()' ) ;
    
    /* validator */ validator && validator.test( '++', 1, 0, 'initialize' ) ;
    
    var $context = this ;
    
    // polymorphism
    switch ( true ) {
      case typeof option === 'object':
        $context = $context instanceof jQuery ? $context : jQuery( document ) ;
        $context = Store.setProperties.call( $context, option.ns || '', null ) ;
        if ( !option.area && !option.scope ) {
          return $context ;
        }
        break ;
        
      default:
        $context = $context instanceof jQuery ? $context : jQuery[ Store.name ] ;
        return Store.setProperties.call( $context, null, null ) ;
    }
    
    // setting
    var setting ;
    setting = jQuery.extend( true,
      {
        id: 0,
        gns: Store.name,
        ns: null,
        area: null,
        link: 'a:not([target])',
        form: null,
        scope: null,
        state: null,
        scrollTop: 0,
        scrollLeft: 0,
        ajax: {},
        contentType: 'text/html',
        cache: {
          click: false, submit: false, popstate: false, get: true, post: true,
          length: 9 /* pages */, size: 1*1024*1024 /* 1MB */, expire: 30*60*1000 /* 30min */
        },
        callback: function () {},
        callbacks: {
          ajax: {},
          update: { url: {}, title: {}, content: {}, scroll: {}, css: {}, script: {}, cache: { load: {}, save: {} }, rendering: {}, verify: {} },
          async: false
        },
        parameter: null,
        load: { css: false, script: false, execute: true, reload: null, reject: null, sync: true, ajax: { dataType: 'script' }, rewrite: null },
        interval: 300,
        wait: 0,
        scroll: { delay: 500 },
        fix: { location: true, history: true, scroll: true, reset: false },
        hashquery: false,
        fallback: true,
        database: true,
        server: {},
        location: jQuery( '<a/>', { href: Store.canonicalizeURL( window.location.href ) } )[ 0 ],
        destination: jQuery( '<a/>', { href: Store.canonicalizeURL( window.location.href ) } )[ 0 ]
      },
      option
    ) ;
    
    setting.nss = {
      array: [ Store.name ].concat( setting.ns && String( setting.ns ).split( '.' ) || [] )
    } ;
    /* validator */ validator && validator.test( '++', 1, setting, 'overwrite' ) ;
    jQuery.extend
    (
      true,
      setting = setting.scope && Store.scope( setting ) || setting,
      {
        nss: {
          name: setting.ns || '',
          event: setting.nss.array.join( '.' ),
          alias: Store.alias ? [ Store.alias ].concat( setting.nss.array.slice( 1 ) ).join( '.' ) : false,
          click: [ 'click' ].concat( setting.nss.array.join( ':' ) ).join( '.' ),
          submit: [ 'submit' ].concat( setting.nss.array.join( ':' ) ).join( '.' ),
          popstate: [ 'popstate' ].concat( setting.nss.array.join( ':' ) ).join( '.' ),
          scroll: [ 'scroll' ].concat( setting.nss.array.join( ':' ) ).join( '.' ),
          data: setting.nss.array.join( '-' ),
          class4html: setting.nss.array.join( '-' ),
          requestHeader: [ 'X', setting.nss.array[ 0 ].replace( /^\w/, function ( $0 ) { return $0.toUpperCase() ; } ) ].join( '-' )
        },
        areaback: setting.area,
        fix: !/Mobile(\/\w+)? Safari/i.test( window.navigator.userAgent ) ? { location: false, reset: false } : {},
        contentType: setting.contentType.replace( /\s*[,;]\s*/g, '|' ).toLowerCase(),
        scroll: { record: true, queue: [] },
        database: setting.database ? {
                                       IDBFactory: ( window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB || null ),
                                       IDBRequest: null
                                     }
                                   : false,
        server: { query: !setting.server.query ? setting.gns : setting.server.query },
        log: { script: {}, speed: {} },
        history: { config: setting.cache, order: [], data: {}, size: 0 },
        timestamp: ( new Date() ).getTime(),
        disable: false,
        landing: Store.canonicalizeURL( window.location.href ),
        retry: true,
        xhr: null,
        speed: { now: function () { return ( new Date() ).getTime() ; } },
        option: option
      }
    ) ;
    
    // registrate
    /* validator */ validator && validator.test( '++', 1, 0, 'register' ) ;
    if ( Store.check() ) {
      Store.registrate.call( $context, jQuery, window, document, undefined, Store, setting ) ;
    }
    
    /* validator */ validator && validator.end() ;
    
    return $context ; // function: pjax
  }
  
  Store = {
    name: 'pjax',
    alias: '',
    ids: [],
    settings: [0],
    count: 0,
    parseHTML: null,
    setAlias:  function ( name ) {
      Store.alias = typeof name === 'string' ? name : Store.alias ;
      if ( Store.name !== Store.alias && !jQuery[ Store.alias ] ) {
        jQuery[ Store.name ][ Store.alias ] = jQuery.fn[ Store.name ] ;
        jQuery.fn[ Store.alias ] = jQuery[ Store.alias ] = jQuery.fn[ Store.name ] ;
      }
    },
    setProperties: function ( namespace, element ) {
      
      var $context = this ;
      
      if ( $context instanceof jQuery || $context === jQuery[ Store.name ] ) {
        
        $context = $context instanceof jQuery && element !== undefined ? $context.add( element ) : $context ;
        
        $context[ Store.name ] = jQuery[ Store.name ] ;
        
        $context.on = function () {
          var setting = Store.settings[ 1 ] ;
          setting.disable = false ;
        } ;
        
        $context.off = function () {
          var setting = Store.settings[ 1 ] ;
          setting.disable = true ;
        } ;
        
        $context.click = function ( url, attr ) {
          var anchor ;
          switch ( true ) {
            case typeof url === 'object':
              anchor = jQuery( url ) ;
              break ;
              
            case !!url:
              attr = attr || {} ;
              attr.href = url ;
              anchor = jQuery( '<a/>', attr ) ;
              break ;
              
            default:
              return this ;
          }
          return anchor.first().one( 'click', 1, Store.click ).click() ;
        } ;
        
        $context.submit = function ( url, attr, data ) {
          var form, df = document.createDocumentFragment(), type, element ;
          switch ( true ) {
            case typeof url === 'object':
              form = jQuery( url ) ;
              break ;
              
            case !!data:
              attr = attr || {} ;
              attr.action = url ;
              type = data instanceof Array && Array || data instanceof Object && Object || undefined ;
              for ( var i in data ) {
                element = data[ i ] ;
                switch ( type ) {
                  case Object:
                    element = jQuery( '<textarea/>', { name: i } ).val( element ) ;
                    break ;
                  case Array:
                    element.attr = element.attr || {} ;
                    element.attr.name = element.name ;
                    element = jQuery( !element.tag.indexOf( '<' ) ? element.tag : '<' + element.tag + '/>', element.attr || {} ).val( element.value ) ;
                    break ;
                  default:
                    continue ;
                }
                df.appendChild( element[ 0 ] ) ;
              }
              form = jQuery( '<form/>', attr ).append( df ) ;
              break ;
              
            default:
              return this ;
          }
          return form.first().one( 'submit', 1, Store.submit ).submit() ;
        } ;
        
        $context.setCache = function ( url, data, textStatus, XMLHttpRequest ) {
          var setting = Store.settings[ 1 ] ;
          if ( !setting || !setting.history ) { return false ; }
          var cache, history, title, size ;
          history = setting.history ;
          url = url || Store.canonicalizeURL( window.location.href ) ;
          if ( !setting.hashquery ) { url = url.replace( /#.*/, '' ) ; }
          switch ( arguments.length ) {
            case 0:
            case 1:
              return arguments.callee.call( this, url, Store.trim( document.documentElement.outerHTML ) ) ;
            case 2:
            case 3:
            case 4:
            case 5:
            default:
              history.order.unshift( url ) ;
              for ( var i = 1, key ; key = history.order[ i ] ; i++ ) { if ( url === key ) { history.order.splice( i, 1 ) ; } }
              
              history.size > history.config.size && jQuery[ Store.name ].cleanCache() ;
              cache = jQuery[ Store.name ].getCache( url ) ;
              
              title = jQuery( '<span/>' ).html( Store.find( ( data || '' ) + ( ( XMLHttpRequest || {} ).responseText || '' ) + '<title></title>', /<title[^>]*?>([^<]*?)<\/title>/i ).shift() ).text() ;
              size = parseInt( ( ( data || '' ).length + ( ( XMLHttpRequest || {} ).responseText || '' ).length ) * 1.8 || 1024*1024, 10 ) ;
              history.size = history.size || 0 ;
              history.size += size ;
              history.data[ url ] = jQuery.extend(
                true,
                ( history.data[ url ] || {} ),
                {
                  XMLHttpRequest: XMLHttpRequest,
                  textStatus: textStatus,
                  data: data,
                  //css: undefined,
                  //script: undefined,
                  size: size,
                  timestamp: ( new Date() ).getTime()
                }
              ) ;
              setting.database && setting.fix.history && Store.dbTitle( url, title ) ;
              break ;
          }
          return history.data[ url ] ;
        } ;
        
        $context.getCache = function ( url ) {
          var setting = Store.settings[ 1 ] ;
          if ( !setting || !setting.history ) { return false ; }
          var history ;
          history = setting.history ;
          url = url || Store.canonicalizeURL( window.location.href ) ;
          if ( !setting.hashquery ) { url = url.replace( /#.*/, '' ) ; }
          history.data[ url ] && setting.timestamp > history.data[ url ].timestamp + history.config.expire && jQuery[ Store.name ].removeCache( url ) ;
          return history.data[ url ] ;
        } ;
        
        $context.removeCache = function ( url ) {
          var setting = Store.settings[ 1 ] ;
          if ( !setting || !setting.history ) { return false ; }
          var history ;
          history = setting.history ;
          url = url || Store.canonicalizeURL( window.location.href ) ;
          if ( !setting.hashquery ) { url = url.replace( /#.*/, '' ) ; }
          for ( var i = 0, key ; key = history.order[ i ] ; i++ ) {
            if ( url === key ) {
              history.order.splice( i, 1 ) ;
              history.size -= history.data[ key ].size ;
              history.data[ key ] = null ;
              delete history.data[ key ] ;
            }
          }
          return true ;
        } ;
        
        $context.clearCache = function () {
          var setting = Store.settings[ 1 ] ;
          if ( !setting || !setting.history ) { return false ; }
          var history = setting.history ;
          for ( var i = history.order.length, url ; url = history.order[ --i ] ; ) {
            history.order.splice( i, 1 ) ;
            history.size -= history.data[ url ].size ;
            delete history.data[ url ] ;
          }
          return true ;
        } ;
        
        $context.cleanCache = function () {
          var setting = Store.settings[ 1 ] ;
          if ( !setting || !setting.history ) { return false ; }
          var history = setting.history ;
          for ( var i = history.order.length, url ; url = history.order[ --i ] ; ) {
            if ( i >= history.config.length || url in history.data && setting.timestamp > history.data[ url ].timestamp + history.config.expire ) {
              history.order.splice( i, 1 ) ;
              history.size -= history.data[ url ].size ;
              delete history.data[ url ] ;
            }
          }
          return true ;
        } ;
      }
      return $context ;
    },
    check: function () {
      return Store.supportPushState() ;
    },
    supportPushState: function () {
      return 'pushState' in window.history && window.history[ 'pushState' ] ;
    },
    registrate: function ( jQuery, window, document, undefined, Store, setting ) {
      
      var context = this ;
      
      setting.id = 1 ;
      Store.ids.push( setting.id ) ;
      Store.settings[ setting.id ] = setting ;
      
      Store.share() ;
      Store.database() ;
      setting.load.script && jQuery( 'script' ).each( function () {
        var element = this, src ;
        element = typeof setting.load.rewrite === 'function' ? Store.fire( setting.load.rewrite, null, [ element.cloneNode() ] ) || element : element ;
        if ( ( src = element.src ) && src in setting.log.script ) { return ; }
        if ( src && ( !setting.load.reload || !jQuery( element ).is( setting.load.reload ) ) ) { setting.log.script[ src ] = true ; }
      } ) ;
      
      jQuery( context )
      .undelegate( setting.link, setting.nss.click )
      .delegate( setting.link, setting.nss.click, setting.id, Store.click = function ( event ) {
        event.timeStamp = ( new Date() ).getTime() ;
        var setting = Store.settings[ 1 ] ;
        if ( setting.disable || event.isDefaultPrevented() ) { return event.preventDefault() ; }
        setting.location.href = Store.canonicalizeURL( window.location.href ) ;
        setting.destination.href = Store.canonicalizeURL( this.href ) ;
        
        if ( setting.location.protocol !== setting.destination.protocol || setting.location.host !== setting.destination.host ) { return ; }
        if ( event.which>1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) { return ; }
        
        if ( !Store.fire( setting.hashquery, null, [ event, setting.parameter, setting.destination.href, setting.location.href ] ) && setting.location.pathname + setting.location.search === setting.destination.pathname + setting.destination.search ) {
          return setting.destination.hash && Store.hashscroll(), event.preventDefault() ;
        }
        
        var url, cache ;
        
        url = setting.destination.href ;
        setting.area = Store.fire( setting.areaback, null, [ event, setting.parameter, setting.destination.href, setting.location.href ] ) ;
        setting.timestamp = event.timeStamp ;
        if ( setting.landing ) { setting.landing = false ; }
        if ( !jQuery( setting.area ).length || setting.scope && !Store.scope( setting ) ) { return ; }
        
        if ( setting.cache[ event.type.toLowerCase() ] ) { cache = jQuery[ Store.name ].getCache( url ) ; }
        
        Store.drive( jQuery, window, document, undefined, Store, setting, event, url, true, cache ) ;
        return event.preventDefault() ;
      } ) ;
      
      jQuery( context )
      .undelegate( setting.form, setting.nss.submit )
      .delegate( setting.form, setting.nss.submit, setting.id, Store.submit = function ( event ) {
        event.timeStamp = ( new Date() ).getTime() ;
        var setting = Store.settings[ 1 ] ;
        if ( setting.disable || event.isDefaultPrevented() ) { return event.preventDefault() ; }
        setting.location.href = Store.canonicalizeURL( window.location.href ) ;
        setting.destination.href = Store.canonicalizeURL( this.action ) ;
        
        if ( event.which>1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) { return ; }
        
        var url, cache ;
        
        url = setting.destination.href = Store.canonicalizeURL( setting.destination.href.replace( /[?#].*/, '' ) + ( event.target.method.toUpperCase() === 'GET' ? '?' + jQuery( event.target ).serialize() : '' ) ) ;
        setting.area = Store.fire( setting.areaback, null, [ event, setting.parameter, setting.destination.href, setting.location.href ] ) ;
        setting.timestamp = event.timeStamp ;
        if ( setting.landing ) { setting.landing = false ; }
        if ( !jQuery( setting.area ).length || setting.scope && !Store.scope( setting ) ) { return ; }
        
        if ( setting.cache[ event.type.toLowerCase() ] && setting.cache[ event.target.method.toLowerCase() ] ) { cache = jQuery[ Store.name ].getCache( url ) ; }
        
        Store.drive( jQuery, window, document, undefined, Store, setting, event, url, true, cache ) ;
        return event.preventDefault() ;
      } ) ;
      
      jQuery( window )
      .unbind( setting.nss.popstate )
      .bind( setting.nss.popstate, setting.id, Store.popstate = function ( event ) {
        event.timeStamp = ( new Date() ).getTime() ;
        var setting = Store.settings[ 1 ] ;
        if ( setting.disable || event.isDefaultPrevented() ) { return event.preventDefault() ; }
        //setting.location.href = Store.canonicalizeURL( window.location.href ) ;
        setting.destination.href = Store.canonicalizeURL( window.location.href ) ;
        
        if ( setting.location.href === setting.destination.href ) { return event.preventDefault() ; }
        
        var url, cache ;
        
        if ( !Store.fire( setting.hashquery, null, [ event, setting.parameter, setting.destination.href, setting.location.href ] ) && setting.location.pathname + setting.location.search === setting.destination.pathname + setting.destination.search ) {
          return event.preventDefault() ;
        }
        
        url = setting.destination.href ;
        setting.area = Store.fire( setting.areaback, null, [ event, setting.parameter, setting.destination.href, setting.location.href ] ) ;
        setting.timestamp = event.timeStamp ;
        if ( setting.landing ) { if ( setting.landing.href === url ) { setting.landing = false ; return ; } setting.landing = false ; }
        if ( !jQuery( setting.area ).length ) { return ; }
        
        setting.database && setting.fix.history && Store.dbTitle( url ) ;
        if ( setting.cache[ event.type.toLowerCase() ] ) { cache = jQuery[ Store.name ].getCache( url ) ; }
        
        Store.drive( jQuery, window, document, undefined, Store, setting, event, url, false, cache ) ;
        return event.preventDefault() ;
      } ) ;
      
      setting.database && setting.fix.scroll &&
      jQuery( window )
      .unbind( setting.nss.scroll )
      .bind( setting.nss.scroll, setting.id, function ( event, end ) {
        var setting = Store.settings[ 1 ] ;
        var id, fn = arguments.callee ;
        
        if ( !setting.scroll.delay ) {
          Store.dbScroll( jQuery( window ).scrollLeft(), jQuery( window ).scrollTop() ) ;
        } else {
          while ( id = setting.scroll.queue.shift() ) { clearTimeout( id ) ; }
          id = setTimeout( function () {
            while ( id = setting.scroll.queue.shift() ) { clearTimeout( id ) ; }
            Store.dbScroll( jQuery( window ).scrollLeft(), jQuery( window ).scrollTop() ) ;
          }, setting.scroll.delay ) ;
          setting.scroll.queue.push( id ) ;
        }
      } ) ;
      
      ( function () {
        var DOMParser = window.DOMParser ;
        Store.parseHTML = function ( html ) { return DOMParser && DOMParser.prototype && ( new DOMParser() ).parseFromString( html, 'text/html' ) ; } ;
        if ( test( Store.parseHTML ) ) { return ; }
        
        Store.parseHTML = function( html ) {
          var doc ;
          if ( document.implementation && document.implementation.createHTMLDocument ) {
            doc = document.implementation.createHTMLDocument( '' ) ;
            if ( typeof doc.activeElement === 'object' ) {
              doc.open() ;
              doc.write( html ) ;
              doc.close() ;
            }
          }
          return doc ;
        } ;
        if ( test( Store.parseHTML ) ) { return ; }
        
        Store.parseHTML = false ;
        
        function test( parseHTML ) {
          try {
            var doc = parseHTML && parseHTML( '<body><noscript>DOMParser</noscript></body>' ) ;
            return jQuery( doc ).find( 'noscript' ).text() === 'DOMParser' ;
          } catch ( err ) {}
        }
      } )() ;
    },
    drive: function ( jQuery, window, document, undefined, Store, setting, event, url, register, cache ) {
      /* validator */ var validator = setting.validator ? setting.validator.clone( { name: 'jquery.pjax.js - drive()' } ) : false ;
      /* validator */ validator && validator.start() ;
      /* validator */ validator && ( validator.scope = function( code ){ return eval( code ) ; } ) ;
      /* validator */ validator && validator.test( '++', 1, [ url, event.type ], 'drive()' ) ;
      
      var speedcheck = setting.speedcheck ;
      speedcheck && ( setting.log.speed.fire = setting.timestamp ) ;
      speedcheck && ( setting.log.speed.time = [] ) ;
      speedcheck && ( setting.log.speed.name = [] ) ;
      speedcheck && setting.log.speed.name.push( 'fire' ) ;
      speedcheck && setting.log.speed.time.push( setting.speed.now() - setting.log.speed.fire ) ;
      
      /* validator */ validator && validator.test( '++', 1, 0, 'start' ) ;
      setting.scroll.record = false ;
      setting.fix.reset && /click|submit/.test( event.type.toLowerCase() ) && window.scrollTo( jQuery( window ).scrollLeft(), 0 ) ;
      if ( Store.fire( setting.callbacks.before, null, [ event, setting.parameter ], setting.callbacks.async ) === false ) { return ; } // function: drive
      
      if ( cache && cache.XMLHttpRequest ) {
        /* validator */ validator && validator.test( '++', 1, 0, 'update' ) ;
        jQuery.when ? jQuery.when( Store.wait( Store.fire( setting.wait, null, [ event, setting.parameter, setting.destination.href, setting.location.href ] ) ) )
                      .done( function () { update( jQuery, window, document, undefined, Store, setting, event, cache ) ; } )
                    : update( jQuery, window, document, undefined, Store, setting, event, cache ) ;
        /* validator */ validator && validator.test( '++', 1, 0, 'end' ) ;
        /* validator */ validator && validator.end() ;
        return ;
      }
      
      /* validator */ validator && validator.test( '++', 1, 0, 'initialize' ) ;
      var ajax, callbacks, defer, data, XMLHttpRequest, textStatus, errorThrown, dataSize ;
      
      ajax = {} ;
      switch ( event.type.toLowerCase() ) {
        case 'click':
          /* validator */ validator && validator.test( '++', 1, 0, 'event click' ) ;
          ajax.type = 'GET' ;
          break ;
          
        case 'submit':
          /* validator */ validator && validator.test( '++', 1, event.target.method, 'event submit' ) ;
          ajax.type = event.target.method.toUpperCase() ;
          if ( ajax.type === 'POST' ) { ajax.data = jQuery( event.target ).serializeArray() ; }
          break ;
          
        case 'popstate':
          /* validator */ validator && validator.test( '++', 1, 0, 'event popstate' ) ;
          ajax.type = 'GET' ;
          break ;
      }
      
      defer = jQuery.when ? jQuery.Deferred() : null ;
      /* validator */ validator && validator.test( '++', 1, 0, 'setting' ) ;
      callbacks = {
        xhr: !setting.callbacks.ajax.xhr ? undefined : function () {
          XMLHttpRequest = Store.fire( setting.callbacks.ajax.xhr, null, [ event, setting.parameter ], setting.callbacks.async ) ;
          XMLHttpRequest = typeof XMLHttpRequest === 'object' && XMLHttpRequest || jQuery.ajaxSettings.xhr() ;
          
          //if ( XMLHttpRequest instanceof Object && XMLHttpRequest instanceof window.XMLHttpRequest && 'onprogress' in XMLHttpRequest ) {
          //  XMLHttpRequest.addEventListener( 'progress', function ( event ) { dataSize = event.loaded ; }, false ) ;
          //}
          return XMLHttpRequest ;
        },
        beforeSend: function () {
          XMLHttpRequest = arguments[ 0 ] ;
          
          setting.xhr && setting.xhr.readyState < 4 && setting.xhr.abort() ;
          setting.xhr = XMLHttpRequest ;
          
          XMLHttpRequest.setRequestHeader( setting.nss.requestHeader, 'true' ) ;
          XMLHttpRequest.setRequestHeader( setting.nss.requestHeader + '-Area', setting.area ) ;
          XMLHttpRequest.setRequestHeader( setting.nss.requestHeader + '-CSS', setting.load.css ) ;
          XMLHttpRequest.setRequestHeader( setting.nss.requestHeader + '-Script', setting.load.script ) ;
          
          Store.fire( setting.callbacks.ajax.beforeSend, null, [ event, setting.parameter, XMLHttpRequest, arguments[ 1 ] ], setting.callbacks.async ) ;
        },
        dataFilter: !setting.callbacks.ajax.dataFilter ? undefined : function () {
          data = arguments[ 0 ] ;
          
          return Store.fire( setting.callbacks.ajax.dataFilter, null, [ event, setting.parameter, data, arguments[ 1 ] ], setting.callbacks.async ) || data ;
        },
        success: function () {
          data = arguments[ 0 ] ;
          textStatus = arguments[ 1 ] ;
          XMLHttpRequest = arguments[ 2 ] ;
          
          /* validator */ validator = setting.validator ? setting.validator.clone( { name: 'jquery.pjax.js - $.ajax()' } ) : false ;
          /* validator */ validator && validator.start() ;
          /* validator */ validator && validator.test( '++', textStatus === 'success', [ url, setting.location.href, XMLHttpRequest, textStatus ], 'ajax success' ) ;
          Store.fire( setting.callbacks.ajax.success, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) ;
        },
        error: function () {
          XMLHttpRequest = arguments[ 0 ] ;
          textStatus = arguments[ 1 ] ;
          errorThrown = arguments[ 2 ] ;
          
          /* validator */ validator = setting.validator ? setting.validator.clone( { name: 'jquery.pjax.js - $.ajax()' } ) : false ;
          /* validator */ validator && validator.start() ;
          /* validator */ validator && validator.test( '++', textStatus === 'abort', [ url, setting.location.href, XMLHttpRequest, textStatus, errorThrown ], 'ajax error' ) ;
          Store.fire( setting.callbacks.ajax.error, null, [ event, setting.parameter, XMLHttpRequest, textStatus, errorThrown ], setting.callbacks.async ) ;
        },
        complete: function () {
          XMLHttpRequest = arguments[ 0 ] ;
          textStatus = arguments[ 1 ] ;
          
          /* validator */ validator && validator.test( '++', 1, 0, 'ajax complete' ) ;
          Store.fire( setting.callbacks.ajax.complete, null, [ event, setting.parameter, XMLHttpRequest, textStatus ], setting.callbacks.async ) ;
          
          if ( !errorThrown ) {
            defer && defer.resolve() || update( jQuery, window, document, undefined, Store, setting, event, cache ) ;
          } else {
            defer && defer.reject() ;
            if ( setting.fallback && textStatus !== 'abort' ) {
              return typeof setting.fallback === 'function' ? Store.fire( setting.fallback, null, [ event, setting.parameter, setting.destination.href, setting.location.href ] )
                                                            : Store.fallback( event ) ;
            }
          }
          /* validator */ validator && validator.end() ;
        }
      } ;
      jQuery.extend( true, ajax, setting.ajax, callbacks ) ;
      ajax.url = url.replace( /([^#]+)(#[^\s]*)?$/, '$1' + ( setting.server.query ? ( url.match( /\?/ ) ? '&' : '?' ) + encodeURIComponent( setting.server.query ) + '=1' : '' ) + '$2' ) ;
      
      /* validator */ validator && validator.test( '++', 1, 0, 'ajax' ) ;
      speedcheck && setting.log.speed.name.push( 'request' ) ;
      speedcheck && setting.log.speed.time.push( setting.speed.now() - setting.log.speed.fire ) ;
      jQuery.when && jQuery.when( defer.promise(), Store.wait( Store.fire( setting.wait, null, [ event, setting.parameter, setting.destination.href, setting.location.href ] ) ) )
                     .done( function () { update( jQuery, window, document, undefined, Store, setting, event, cache ) ; } ) ;
      jQuery.ajax( ajax ) ;
      
      if ( Store.fire( setting.callbacks.after, null, [ event, setting.parameter ], setting.callbacks.async ) === false ) { return ; } // function: drive
      /* validator */ validator && validator.test( '++', 1, 0, 'end' ) ;
      /* validator */ validator && validator.end() ;
      
      
      function update( jQuery, window, document, undefined, Store, setting, event, cache ) {
        /* validator */ var validator = setting.validator ? setting.validator.clone( { name: 'jquery.pjax.js - update()' } ) : false ;
        /* validator */ validator && validator.start() ;
        /* validator */ validator && ( validator.scope = function( code ){ return eval( code ) ; } ) ;
        /* validator */ validator && validator.test( '1', 1, 0, 'update()' ) ;
        /* validator */ validator && validator.test( '++', 1, 0, 'start' ) ;
        UPDATE: {
          var speedcheck = setting.speedcheck ;
          speedcheck && setting.log.speed.name.push( 'update' ) ;
          speedcheck && setting.log.speed.time.push( setting.speed.now() - setting.log.speed.fire ) ;
          
          var callbacks_update = setting.callbacks.update ;
          if ( Store.fire( callbacks_update.before, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest, cache ], setting.callbacks.async ) === false ) { break UPDATE ; }
          
          /* variable initialization */
          var title, css, script ;
          
          try {
            /* validator */ validator && validator.test( '++', 1, 0, 'try' ) ;
            /* validator */ validator && validator.test( '++', 1, !cache ? [ setting.contentType, XMLHttpRequest.getResponseHeader( 'Content-Type' ) ] : 0, 'content-type' ) ;
            if ( !cache && -1 === ( XMLHttpRequest.getResponseHeader( 'Content-Type' ) || '' ).toLowerCase().search( setting.contentType ) ) { throw new Error( "throw: content-type mismatch" ) ; }
            
            /* cache */
            /* validator */ validator && validator.test( '++', cache ? "'usable'" : "'unusable'", 0, 'cache' ) ;
            UPDATE_CACHE: {
              if ( !cache ) { break UPDATE_CACHE ; }
              if ( Store.fire( callbacks_update.cache.load.before, null, [ event, setting.parameter, cache ], setting.callbacks.async ) === false ) { break UPDATE_CACHE ; }
              XMLHttpRequest = cache.XMLHttpRequest || XMLHttpRequest ;
              data = XMLHttpRequest.responseText ;
              textStatus = cache.textStatus || textStatus ;
              css = cache.css ;
              script = cache.script ;
              if ( Store.fire( callbacks_update.cache.load.after, null, [ event, setting.parameter, cache ], setting.callbacks.async ) === false ) { break UPDATE_CACHE ; }
            } ; // label: UPDATE_CACHE
            
            /* variable initialization */
            /* validator */ validator && validator.test( '++', 1, 0, 'initialize' ) ;
            var pdoc, pdata, cdoc, cdata, parsable, areas, checker ;
            areas = setting.area.split( /\s*,\s*/ ) ;
            // Can not delete the script in the noscript After parse.
            pdata = ( XMLHttpRequest.responseText || '' ).replace( /<noscript[^>]*>(?:.|[\n\r])*?<\/noscript>/gim, function ( noscript ) {
              return noscript.replace( /<script(?:.|[\n\r])*?<\/script>/gim, '' ) ;
            } ) ;
            if ( cache && cache.data ) {
              cdata = cache.data ;
              cdoc = jQuery( Store.parseHTML && cdata && Store.parseHTML( cdata ) || cdata ) ;
              pdata = pdata.replace( /<title[^>]*?>([^<]*?)<\/title>/i, function ( title ) {
                return Store.find( cdata, /(<title[^>]*?>[^<]*?<\/title>)/i ).shift() || title ;
              }) ;
              pdoc = jQuery( Store.parseHTML && pdata && Store.parseHTML( pdata ) || pdata ) ;
              for ( var i = 0, area, element ; area = areas[ i++ ] ; ) {
                pdoc.find( area ).add( parsable ? '' : pdoc.filter( area ) ).html( cdoc.find( area ).add( parsable ? '' : cdoc.filter( area ) ).contents() ) ;
              }
            } else {
              pdoc = jQuery( Store.parseHTML && pdata && Store.parseHTML( pdata ) || pdata ) ;
            }
            
            switch ( true ) {
              case !!pdoc.find( 'html' )[ 0 ]:
                parsable = 1 ;
                pdoc.find( 'noscript' ).each( function () { this.children.length && jQuery( this ).text( this.innerHTML ) ; } ) ;
                break ;
              case !!pdoc.filter( 'title' )[ 0 ]:
                parsable = 0 ;
                break ;
              default:
                parsable = false ;
            }
            
            switch ( parsable ) {
              case 1:
                title = pdoc.find( 'title' ).text() ;
                break ;
              case 0:
                title = pdoc.filter( 'title' ).text() ;
                break ;
              case false:
                title = jQuery( '<span/>' ).html( Store.find( pdata, /<title[^>]*?>([^<]*?)<\/title>/i ).shift() ).text() ;
                break ;
            }
            
            if ( !jQuery( setting.area ).length || !pdoc.find( setting.area ).add( parsable ? '' : pdoc.filter( setting.area ) ).length ) { throw new Error( 'throw: area length mismatch' ) ; }
            jQuery( window ).trigger( setting.gns + '.unload' ) ;
            
            /* url */
            /* validator */ validator && validator.test( '++', 1, url, 'url' ) ;
            UPDATE_URL: {
              if ( Store.fire( callbacks_update.url.before, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE_URL ; } ;
              
              register && url !== setting.location.href &&
              window.history.pushState(
                Store.fire( setting.state, null, [ event, setting.parameter, setting.destination.href, setting.location.href ] ),
                window.opera || window.navigator.userAgent.toLowerCase().indexOf( 'opera' ) !== -1 ? title : document.title,
                url ) ;
              
              setting.location.href = url ;
              if ( register && setting.fix.location ) {
                jQuery[ Store.name ].off() ;
                window.history.back() ;
                window.history.forward() ;
                jQuery[ Store.name ].on() ;
              }
              
              if ( Store.fire( callbacks_update.url.after, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE_URL ; }
            } ; // label: UPDATE_URL
            
            /* title */
            /* validator */ validator && validator.test( '++', 1, title, 'title' ) ;
            UPDATE_TITLE: {
              if ( Store.fire( callbacks_update.title.before, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE_TITLE ; }
              document.title = title ;
              setting.database && setting.fix.history && Store.dbTitle( url, title ) ;
              if ( Store.fire( callbacks_update.title.after, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE_TITLE ; }
            } ; // label: UPDATE_TITLE
            
            setting.database && Store.dbCurrent() ;
            
            /* content */
            /* validator */ validator && validator.test( '++', 1, areas, 'content' ) ;
            UPDATE_CONTENT: {
              if ( Store.fire( callbacks_update.content.before, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE_CONTENT ; }
              jQuery( setting.area ).children( '.' + setting.nss.class4html + '-check' ).remove() ;
              checker = jQuery( '<div/>', {
                'class': setting.nss.class4html + '-check',
                'style': 'background: none !important; display: block !important; visibility: hidden !important; position: absolute !important; top: 0 !important; left: 0 !important; z-index: -9999 !important; width: auto !important; height: 0 !important; margin: 0 !important; padding: 0 !important; border: none !important; font-size: 12px !important; text-indent: 0 !important;'
              } ).text( setting.gns ) ;
              for ( var i = 0, area, element ; area = areas[ i++ ] ; ) {
                element = pdoc.find( area ).add( parsable ? '' : pdoc.filter( area ) ).clone().find( 'script' ).remove().end().contents() ;
                jQuery( area ).html( element ).append( checker.clone() ) ;
              }
              checker = jQuery( setting.area ).children( '.' + setting.nss.class4html + '-check' ) ;
              jQuery( document ).trigger( setting.gns + '.DOMContentLoaded' ) ;
              if ( Store.fire( callbacks_update.content.after, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE_CONTENT ; }
            } ; // label: UPDATE_CONTENT
            speedcheck && setting.log.speed.name.push( 'content' ) ;
            speedcheck && setting.log.speed.time.push( setting.speed.now() - setting.log.speed.fire ) ;
            
            /* scroll */
            /* validator */ validator && validator.test( '++', 1, 0, 'scroll' ) ;
            function scroll( call ) {
              if ( Store.fire( callbacks_update.scroll.before, null, [ event, setting.parameter ], setting.callbacks.async ) === false ) { return ; }
              var scrollX, scrollY ;
              switch ( event.type.toLowerCase() ) {
                case 'click':
                case 'submit':
                  scrollX = call && typeof setting.scrollLeft === 'function' ? Store.fire( setting.scrollLeft, null, [ event, setting.parameter, setting.destination.href, setting.location.href ] ) : setting.scrollLeft ;
                  scrollX = 0 <= scrollX ? scrollX : 0 ;
                  scrollX = scrollX === false || scrollX === null ? jQuery( window ).scrollLeft() : parseInt( Number( scrollX ), 10 ) ;
                  
                  scrollY = call && typeof setting.scrollTop === 'function' ? Store.fire( setting.scrollTop, null, [ event, setting.parameter, setting.destination.href, setting.location.href ] ) : setting.scrollTop ;
                  scrollY = 0 <= scrollY ? scrollY : 0 ;
                  scrollY = scrollY === false || scrollY === null ? jQuery( window ).scrollTop() : parseInt( Number( scrollY ), 10 ) ;
                  
                  ( jQuery( window ).scrollTop() === scrollY && jQuery( window ).scrollLeft() === scrollX ) || window.scrollTo( scrollX, scrollY ) ;
                  call && setting.database && setting.fix.scroll && Store.dbScroll( scrollX, scrollY ) ;
                  break ;
                case 'popstate':
                  call && setting.database && setting.fix.scroll && Store.dbScroll() ;
                  break ;
              }
              if ( Store.fire( callbacks_update.scroll.after, null, [ event, setting.parameter ], setting.callbacks.async ) === false ) { return ; }
            } // function: scroll
            scroll( false ) ;
            
            /* cache */
            /* validator */ validator && validator.test( '++', 1, 0, 'cache' ) ;
            UPDATE_CACHE: {
              if ( cache && cache.XMLHttpRequest || !setting.cache.click && !setting.cache.submit && !setting.cache.popstate ) { break UPDATE_CACHE ; }
              if ( event.type.toLowerCase() === 'submit' && !setting.cache[ event.target.method.toLowerCase() ] ) { break UPDATE_CACHE ; }
              if ( Store.fire( callbacks_update.cache.save.before, null, [ event, setting.parameter, cache ], setting.callbacks.async ) === false ) { break UPDATE_CACHE ; }
              
              jQuery[ Store.name ].setCache( url, cdata || null, textStatus, XMLHttpRequest ) ;
              cache = jQuery[ Store.name ].getCache( url ) ;
              
              if ( Store.fire( callbacks_update.cache.save.after, null, [ event, setting.parameter, cache ], setting.callbacks.async ) === false ) { break UPDATE_CACHE ; }
            } ; // label: UPDATE_CACHE
            
            /* rendering */
            /* validator */ validator && validator.test( '++', 1, 0, 'rendering' ) ;
            function rendering( callback ) {
              if ( Store.fire( callbacks_update.rendering.before, null, [ event, setting.parameter ], setting.callbacks.async ) === false ) { return ; }
              
              var count = 0 ;
              ( function () {
                if ( checker.filter( function () { return this.clientWidth || this.clientHeight || jQuery( this ).is( ':hidden' ) ; } ).length === checker.length || count >= 100 ) {
                  
                  rendered( callback ) ;
                  
                } else if ( checker.length ) {
                  count++ ;
                  setTimeout( arguments.callee, setting.interval ) ;
                }
              } )() ;
            } // function: rendering
            function rendered( callback ) {
              speedcheck && setting.log.speed.name.push( 'rendered' ) ;
              speedcheck && setting.log.speed.time.push( setting.speed.now() - setting.log.speed.fire ) ;
              
              checker.remove() ;
              setting.scroll.record = true ;
              Store.hashscroll( event.type.toLowerCase() === 'popstate' ) || scroll( true ) ;
              jQuery( window ).trigger( setting.gns + '.load' ) ;
              Store.fire( callback ) ;
              
              speedcheck && console.log( setting.log.speed.time ) ;
              speedcheck && console.log( setting.log.speed.name ) ;
              if ( Store.fire( callbacks_update.rendering.after, null, [ event, setting.parameter ], setting.callbacks.async ) === false ) { return ; }
            } // function: rendered
            
            /* escape */
            /* validator */ validator && validator.test( '++', 1, 0, 'escape' ) ;
            // Can not delete the style of update range in parsable === false.
            // However, there is no problem on real because parsable === false is not used.
            switch ( parsable ) {
              case 1:
              case 0:
                pdoc.find( 'noscript' ).remove() ;
                break ;
              case false:
                pdata = pdata.replace( /^(?:.|[\n\r])*<body[^>]*>.*[\n\r]*.*[\n\r]*/im, function ( head ) {
                  return head.replace( /<!--\[(?:.|[\n\r])*?<!\[endif\]-->/gim, '' ) ;
                } ) ;
                pdata = pdata.replace( /<noscript(?:.|[\n\r])*?<\/noscript>/gim, '' ) ;
                break ;
            }
            
            /* css */
            /* validator */ validator && validator.test( '++', 1, 0, 'css' ) ;
            function load_css() {
              /* validator */ var validator = setting.validator ? setting.validator.clone( { name: 'jquery.pjax.js - load_css()' } ) : false ;
              /* validator */ validator && validator.start() ;
              /* validator */ validator && ( validator.scope = function( code ){ return eval( code ) ; } ) ;
              UPDATE_CSS: {
                if ( !setting.load.css ) { break UPDATE_CSS ; }
                if ( Store.fire( callbacks_update.css.before, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE_CSS ; }
                
                var save, adds = [], removes = jQuery( 'link[rel~="stylesheet"], style' ) ;
                cache = jQuery[ Store.name ].getCache( url ) ;
                save = cache && !cache.css ;
                switch ( css || parsable ) {
                  case 1:
                  case 0:
                    css = pdoc.find( 'link[rel~="stylesheet"], style' ).add( parsable ? '' : pdoc.filter( 'link[rel~="stylesheet"], style' ) ).clone().get() ;
                    break ;
                  case false:
                    css = Store.find( pdata, /(<link[^>]*?rel=.[^"\']*?stylesheet[^>]*?>|<style[^>]*?>(?:.|[\n\r])*?<\/style>)/gim ) ;
                    break ;
                }
                if ( cache && cache.css && css && css.length !== cache.css.length ) { save = true ; }
                if ( save ) { cache.css = [] ; }
                
                for ( var i = 0, element, content ; element = css[ i ] ; i++ ) {
                  
                  element = typeof element === 'object' ? save ? jQuery( element.outerHTML )[ 0 ] : element
                                                        : jQuery( element )[ 0 ] ;
                  element = typeof setting.load.rewrite === 'function' ? Store.fire( setting.load.rewrite, null, [ element.cloneNode() ] ) || element : element ;
                  if ( save ) { cache.css[ i ] = element ; }
                  
                  content = Store.trim( element.href || element.innerHTML || '' ) ;
                  
                  for ( var j = 0, tmp ; tmp = removes[ j ] ; j++ ) {
                    if ( !adds.length && Store.trim( tmp.href || tmp.innerHTML || '' ) === content ) {
                      removes = removes.not( tmp ) ;
                      element = null ;
                      break ;
                    } else if ( !j && adds.length ) {
                      break ;
                    }
                  }
                  element && adds.push( element ) ;
                }
                removes.remove() ;
                jQuery( 'head' ).append( adds ) ;
                
                if ( Store.fire( callbacks_update.css.after, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE_CSS ; }
                
                speedcheck && setting.log.speed.name.push( 'css' ) ;
                speedcheck && setting.log.speed.time.push( setting.speed.now() - setting.log.speed.fire ) ;
              } ; // label: UPDATE_CSS
              /* validator */ validator && validator.end() ;
            } // function: css
            
            /* script */
            /* validator */ validator && validator.test( '++', 1, 0, 'script' ) ;
            function load_script( selector ) {
              /* validator */ var validator = setting.validator ? setting.validator.clone( { name: 'jquery.pjax.js - load_script()' } ) : false ;
              /* validator */ validator && validator.start() ;
              /* validator */ validator && ( validator.scope = function( code ){ return eval( code ) ; } ) ;
              UPDATE_SCRIPT: {
                if ( !setting.load.script ) { break UPDATE_SCRIPT ; }
                if ( Store.fire( callbacks_update.script.before, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE_SCRIPT ; }
                
                var save ;
                cache = jQuery[ Store.name ].getCache( url ) ;
                save = cache && !cache.script ;
                switch ( script || parsable ) {
                  case 1:
                  case 0:
                    script = pdoc.find( 'script' ).add( parsable ? '' : pdoc.filter( 'script' ) ).clone().get() ;
                    break ;
                  case false:
                    script = Store.find( pdata, /(?:[^\'\"]|^\s*?)(<script[^>]*?>(?:.|[\n\r])*?<\/script>)(?:[^\'\"]|\s*?$)/gim ) ;
                    break ;
                }
                if ( cache && cache.script && script && script.length !== cache.script.length ) { save = true ; }
                if ( save ) { cache.script = [] ; }
                
                for ( var i = 0, element, content ; element = script[ i ] ; i++ ) {
                  
                  /* validator */ validator && validator.test( '++', 1, element.outerHTML, 'load' ) ;
                  element = typeof element === 'object' ? save ? jQuery( element.outerHTML )[ 0 ] : element
                                                        : jQuery( element )[ 0 ] ;
                  element = typeof setting.load.rewrite === 'function' ? Store.fire( setting.load.rewrite, null, [ element.cloneNode() ] ) || element : element ;
                  if ( save ) { cache.script[ i ] = element ; }
                  
                  if ( !jQuery( element ).is( selector ) ) { continue ; }
                  content = Store.trim( element.src || '' ) ;
                  
                  if ( content && ( content in setting.log.script ) || setting.load.reject && jQuery( element ).is( setting.load.reject ) ) { continue ; }
                  if ( content && ( !setting.load.reload || !jQuery( element ).is( setting.load.reload ) ) ) { setting.log.script[ content ] = true ; }
                  
                  try {
                    if ( content ) {
                      jQuery.ajax( jQuery.extend( true, {}, setting.ajax, setting.load.ajax, { url: element.src, async: !!element.async, global: false } ) ) ;
                    } else {
                      typeof element === 'object' && ( !element.type || -1 !== element.type.toLowerCase().indexOf( 'text/javascript' ) ) &&
                      window.eval.call( window, ( element.text || element.textContent || element.innerHTML || '' ).replace( /^\s*<!(?:\[CDATA\[|\-\-)/, '/*$0*/' ) ) ;
                    }
                  } catch ( err ) {
                    /* validator */ validator && validator.test( '++', 0, err, 'error' ) ;
                    break ;
                  }
                }
                
                if ( Store.fire( callbacks_update.script.after, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE_SCRIPT ; }
                selector === '[src][defer]' && speedcheck && setting.log.speed.name.push( 'script' ) ;
                selector === '[src][defer]' && speedcheck && setting.log.speed.time.push( setting.speed.now() - setting.log.speed.fire ) ;
              } ; // label: UPDATE_SCRIPT
              /* validator */ validator && validator.end() ;
            } // function: script
            
            /* verify */
            /* validator */ validator && validator.test( '++', 1, 0, 'verify' ) ;
            UPDATE_VERIFY: {
              if ( Store.fire( callbacks_update.verify.before, null, [ event, setting.parameter ], setting.callbacks.async ) === false ) { break UPDATE_VERIFY ; }
              if ( url === Store.canonicalizeURL( window.location.href ) ) {
                setting.retry = true ;
              } else if ( setting.retry ) {
                setting.retry = false ;
                Store.drive( jQuery, window, document, undefined, Store, setting, event, window.location.href, false, setting.cache[ event.type.toLowerCase() ] && jQuery[ Store.name ].getCache( Store.canonicalizeURL( window.location.href ) ) ) ;
              } else {
                throw new Error( 'throw: location mismatch' ) ;
              }
              if ( Store.fire( callbacks_update.verify.after, null, [ event, setting.parameter ], setting.callbacks.async ) === false ) { break UPDATE_VERIFY ; }
            } ; // label: UPDATE_VERIFY
            
            /* load */
            /* validator */ validator && validator.test( '++', 1, 0, 'load' ) ;
            load_css() ;
            jQuery( document ).trigger( setting.gns + '.ready' ) ;
            jQuery( window )
            .bind( setting.gns + '.rendering', function ( event ) {
              jQuery( event.target ).unbind( event.type + '.rendering', arguments.callee ) ;
              load_script( ':not([defer]), :not([src])' ) ;
              if ( setting.load.sync ) {
                rendering( function () {
                  load_script( '[src][defer]' ) ;
                } ) ;
              } else {
                rendering() ;
                load_script( '[src][defer]' ) ;
              }
            } )
            .trigger( setting.gns + '.rendering' ) ;
            
            if ( Store.fire( callbacks_update.success, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE ; }
            if ( Store.fire( callbacks_update.complete, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE ; }
            if ( Store.fire( setting.callback, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE ; }
            /* validator */ validator && validator.test( '++', 1, 0, 'success' ) ;
          } catch( err ) {
            /* validator */ validator && validator.test( '++', !String( err.message ).indexOf( "throw:" ), err, 'catch' ) ;
            /* validator */ validator && validator.test( '++', !( err.message === 'throw: location mismatch' && url !== window.location.href ), [ url, window.location.href ], "!( err.message === 'throw: location mismatch' && url !== window.location.href )" ) ;
            
            /* cache delete */
            cache && jQuery[ Store.name ].removeCache( url ) ;
            
            if ( Store.fire( callbacks_update.error, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE ; }
            if ( Store.fire( callbacks_update.complete, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE ; }
            /* validator */ validator && validator.test( '++', 1, [ url, window.location.href ], 'error' ) ;
            if ( setting.fallback ) { return typeof setting.fallback === 'function' ? Store.fire( setting.fallback, null, [ event, setting.parameter, setting.destination.href, setting.location.href ] ) : Store.fallback( event ) ; }
          } ;
          
          if ( Store.fire( callbacks_update.after, null, [ event, setting.parameter, data, textStatus, XMLHttpRequest ], setting.callbacks.async ) === false ) { break UPDATE ; }
          
          speedcheck && setting.log.speed.name.push( 'complete' ) ;
          speedcheck && setting.log.speed.time.push( setting.speed.now() - setting.log.speed.fire ) ;
          /* validator */ validator && validator.test( '++', 1, 0, 'end' ) ;
          /* validator */ validator && validator.end() ;
        } ; // label: UPDATE
      } // function: update
    },
    canonicalizeURL: function ( url ) {
      // trim
      url = Store.trim( url ) ;
      // Deny value beginning with the string of HTTP (S) other than
      url = /^https?:/i.test( url ) ? url : '' ;
      // Remove string starting with an invalid character
      url = url.replace( /[<>"{}|\\^\[\]`\s].*/,'' ) ;
      // Unify to UTF-8 encoded values
      return encodeURI( decodeURI( url ) ) ;
    },
    trim: function ( text ) {
      if ( String.prototype.trim ) {
        text = String( text ).trim() ;
      } else {
        if ( text = String( text ).replace( /^\s+/, '' ) ) {
          for ( var i = text.length ; --i ; ) {
            if ( /\S/.test( text.charAt( i ) ) ) {
              text = text.substring( 0, i + 1 ) ;
              break ;
            }
          }
        }
      }
      return text ;
    },
    fire: function ( fn, context, args, async ) {
      if ( typeof fn === 'function' ) { return async ? setTimeout( function () { fn.apply( context, args ) }, 0 ) : fn.apply( context, args ) ; } else { return fn ; }
    },
    hashscroll: function ( cancel ) {
      var setting = Store.settings[ 1 ] ;
      var hash = setting.destination.hash.slice( 1 ) ;
      cancel = cancel || !hash ;
      return !cancel && jQuery( '#' + ( hash ? hash : ', [name~=' + hash + ']' ) ).first().each( function () {
        isFinite( jQuery( this ).offset().top ) && window.scrollTo( jQuery( window ).scrollLeft(), parseInt( Number( jQuery( this ).offset().top ), 10 ) ) ;
      } ).length ;
    },
    wait: function ( ms ) {
      var defer = jQuery.Deferred() ;
      if ( !ms ) { return defer.resolve() ; }
      
      setTimeout( function () { defer.resolve() ; }, ms ) ;
      return defer.promise() ; // function: wait
    },
    fallback: function ( event ) {       
      switch ( event.type.toLowerCase() ) {
        case 'click':
          window.location.href = event.currentTarget.href ;
          break ;
        case 'submit':
          event.target.submit() ;
          break ;
        case 'popstate':
          window.location.reload() ;
          break ;
      }
    },
    find: function ( data, pattern ) {
      var result = [] ;
      data.replace( pattern, function () { result.push( arguments[ 1 ] ) ; } ) ;
      return result ;
    },
    scope: function ( setting, relocation ) {
      var scp, arr, loc, des, dirs, dir, keys, key, pattern, not, reg, rewrite, inherit, hit_loc, hit_des, option ;
      
      scp = setting.scope ;
      loc = setting.location.href.replace( /.+?\w(\/[^#?]*).*/, '$1' ) ;
      des = setting.destination.href.replace( /.+?\w(\/[^#?]*).*/, '$1' ) ;
      
      arr = loc.replace( /^\//, '' ).replace( /([?#])/g, '/$1' ).split( '/' ) ;
      keys = ( relocation || loc ).replace( /^\//, '' ).replace( /([?#])/g, '/$1' ).split( '/' ) ;
      if ( relocation ) {
        if ( -1 === relocation.indexOf( '*' ) ) { return undefined ; }
        dirs = [] ;
        for ( var i = keys.length ; i-- ; ) { '*' === keys[ i ] && dirs.unshift( arr[ i ] ) ; }
      }
      
      for ( var i = keys.length + 1 ; i-- ; ) {
        rewrite = inherit = hit_loc = hit_des = undefined ;
        key = keys.slice( 0, i ).join( '/' ).replace( /\/([?#])/g, '$1' ) ;
        key = '/' + key + ( ( relocation || loc ).charAt( key.length + 1 ) === '/' ? '/' : '' ) ;
        
        if ( !key || !( key in scp ) ) { continue ; }
        if ( !scp[ key ] || !scp[ key ].length ) { return false ; }
        
        for ( var j = 0 ; pattern = scp[ key ][ j ] ; j++ ) {
          if ( hit_loc === false || hit_des === false ) {
          } else if ( pattern === 'rewrite' && typeof scp.rewrite === 'function' && !relocation ) {
            rewrite = arguments.callee( setting, Store.fire( scp.rewrite, null, [ setting.destination.href ] ) ) ;
            if ( rewrite ) {
              hit_loc = hit_des = true ;
            } else if ( false === rewrite ) {
              return false ;
            }
          } else if ( pattern === 'inherit' ) {
            inherit = true ;
          } else if ( typeof pattern === 'string' ) {
            not = '^' === pattern.charAt( 0 ) ;
            pattern = not ? pattern.slice( 1 ) : pattern ;
            reg = '*' === pattern.charAt( 0 ) ;
            pattern = reg ? pattern.slice( 1 ) : pattern ;
            
            if ( relocation && -1 !== pattern.indexOf( '/*/' ) ) {
              for ( var k = 0, len = dirs.length ; k < len ; k++ ) { pattern = pattern.replace( '/*/', '/' + dirs[ k ] + '/' ) ; }
            }
            
            if ( ( not || !hit_loc ) && ( reg ? !loc.search( pattern ) : !loc.indexOf( pattern ) ) ) {
              if ( not ) { return false ; } else { hit_loc = true ; }
            }
            if ( ( not || !hit_des ) && ( reg ? !des.search( pattern ) : !des.indexOf( pattern ) ) ) {
              if ( not ) { return false ; } else { hit_des = true ; }
            }
          } else if ( typeof pattern === 'object' ) {
            option = pattern ;
          }
        }
        
        if ( hit_loc && hit_des ) {
          return setting.option || rewrite ? jQuery.extend( true, {}, rewrite || {} )
                                           : jQuery.extend( true, {}, setting, option || {}, rewrite || {} ) ;
        }
        if ( inherit ) { continue ; }
        break ;
      }
    },
    database: function ( count ) {
      var setting = Store.settings[ 1 ] ;
      /* validator */ var validator = setting.validator ? setting.validator.clone( { name: 'jquery.pjax.js - database()' } ) : false ;
      /* validator */ validator && validator.start() ;
      /* validator */ validator && ( validator.scope = function( code ){ return eval( code ) ; } ) ;
      var version, IDBFactory, name, db, store, days ;
      version = 1 ;
      IDBFactory = setting.database && setting.database.IDBFactory ;
      name = setting.gns; 
      days = Math.floor( setting.timestamp / ( 1000*60*60*24 ) ) ;
      count = count || 0 ;
      
      if ( !IDBFactory || !name || count > 3 ) {
        setting.database = false ;
        /* validator */ validator && validator.test( '++', count <= 3, 0, 'retry' ) ;
        /* validator */ validator && validator.end() ;
        return false ;
      }
      
      try {
        version = parseInt( days - days % 7 + version, 10 ) ;
        /* validator */ validator && validator.test( '++', 1, version, 'open' ) ;
        db = IDBFactory.open( name ) ;
        /* validator */ validator && validator.test( '++', 1, 0, 'call' ) ;
        db.onblocked = function () {
          /* validator */ validator && validator.test( '++', 1, 0, 'onblocked()' ) ;
        } ;
        db.onupgradeneeded = function () {
          /* validator */ validator && validator.test( '++', 1, 0, 'onupgradeneeded()' ) ;
          var db = this.result ;
          try {
            /* validator */ validator && validator.test( '++', 1, 0, 'deleteObjectStore' ) ;
            for ( var i = db.objectStoreNames ? db.objectStoreNames.length : 0 ; i-- ; ) { db.deleteObjectStore( db.objectStoreNames[ i ] ) ; }
            /* validator */ validator && validator.test( '++', 1, 0, 'createObjectStore' ) ;
            db.createObjectStore( setting.gns, { keyPath: 'id', autoIncrement: false } ).createIndex( 'date', 'date', { unique: false } ) ;
          } catch ( err ) {
            /* validator */ validator && validator.test( '++', 1, err, 'cancel' ) ;
          }
        } ;
        db.onsuccess = function () {
          /* validator */ validator && validator.test( '++', 1, 0, 'onsuccess()' ) ;
          try {
            var db = this.result ;
            setting.database.IDBRequest = db ;
            /* validator */ validator && validator.test( '++', 1, 0, 'store' ) ;
            store = Store.dbStore() ;
            
            /* validator */ validator && validator.test( '++', 1, 0, 'update' ) ;
            store.get( '_version' ).onsuccess = function () {
              if ( !this.result || version === this.result.title ) {
                Store.dbVersion( version ) ;
                Store.dbCurrent() ;
                Store.dbTitle( setting.location.href, document.title ) ;
                Store.dbScroll( jQuery( window ).scrollLeft(), jQuery( window ).scrollTop() ) ;
              } else {
                setting.database.IDBRequest = null ;
                db.close() ;
                IDBFactory.deleteDatabase( name ) ;
                Store.database() ;
              }
            } ;
          } catch ( err ) {
            /* validator */ validator && validator.test( '++', 1, err, 'cancel' ) ;
            setting.database.IDBRequest = null ;
            db.close() ;
            IDBFactory.deleteDatabase( name ) ;
            setTimeout( function () { Store.database( ++count ) ; }, 1000 ) ;
          }
          /* validator */ validator && validator.end() ;
        } ;
        db.onerror = function ( event ) {
          /* validator */ validator && validator.test( '++', 1, event, 'onerror()' ) ;
          setting.database.IDBRequest = null ;
          db.close() ;
          IDBFactory.deleteDatabase( name ) ;
          setTimeout( function () { Store.database( ++count ) ; }, 1000 ) ;
          /* validator */ validator && validator.end() ;
        } ;
      } catch ( err ) {
        /* validator */ validator && validator.test( '++', 0, err, 'error' ) ;
        setting.database.IDBRequest = null ;
        /* validator */ validator && validator.end() ;
      }
    },
    dbStore: function () {
      var setting = Store.settings[ 1 ] ;
      return typeof setting.database.IDBRequest && setting.database.IDBRequest.transaction( setting.gns, 'readwrite' ).objectStore( setting.gns ) ;
    },
    dbCurrent: function () {
      var setting = Store.settings[ 1 ] ;
      var store = Store.dbStore() ;
      
      if ( !store ) { return ; }
      store.put( { id: '_current', title: setting.hashquery ? window.location.href: window.location.href.replace( /#.*/, '' ) } ) ;
    },
    dbVersion: function ( version ) {
      var store = Store.dbStore() ;
      
      if ( !store ) { return ; }
      store.put( { id: '_version', title: version } ) ;
    },
    dbTitle: function ( url, title ) {
      var setting = Store.settings[ 1 ] ;
      var store = Store.dbStore() ;
      
      if ( !store ) { return ; }
      if ( !setting.hashquery ) { url = url.replace( /#.*/, '' ) ; }
      if ( title ) {
        store.get( url ).onsuccess = function () {
          store.put( jQuery.extend( true, {}, this.result || {}, { id: url, title: title, date: setting.timestamp } ) ) ;
          Store.dbClean( store ) ;
        } ;
      } else {
        store.get( url ).onsuccess = function () {
          this.result && this.result.title && ( document.title = this.result.title ) ;
        } ;
      }
    },
    dbScroll: function ( scrollX, scrollY ) {
      var setting = Store.settings[ 1 ] ;
      var store = Store.dbStore() ;
      var url = setting.location.href, title = document.title, len = arguments.length ;
      
      if ( !setting.scroll.record || !store ) { return ; }
      if ( !setting.hashquery ) { url = url.replace( /#.*/, '' ) ; }
      store.get( '_current' ).onsuccess = function () {
        if ( !this.result || !this.result.title || url !== this.result.title ) { return ; }
        if ( len ) {
          store.get( url ).onsuccess = function () {
            store.put( jQuery.extend( true, {}, this.result || {}, { scrollX: parseInt( Number( scrollX ), 10 ), scrollY: parseInt( Number( scrollY ), 10 ) } ) ) ;
          }
        } else {
          store.get( url ).onsuccess = function () {
            this.result && isFinite( this.result.scrollX ) && isFinite( this.result.scrollY ) &&
            window.scrollTo( parseInt( Number( this.result.scrollX ), 10 ), parseInt( Number( this.result.scrollY ), 10 ) ) ;
          }
        }
      } ;
    },
    dbClean: function ( store ) {
      var setting = Store.settings[ 1 ] ;
      var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange || window.msIDBKeyRange ;
      store.count().onsuccess = function () {
        if ( 1000 < this.result ) {
          store.index( 'date' ).openCursor( IDBKeyRange.upperBound( setting.timestamp - ( 1000*60*60*24*3 ) ) ).onsuccess = function () {
            var cursor = this.result ;
            if ( cursor ) {
              cursor[ 'delete' ]( cursor.value.id ) ;
              cursor[ 'continue' ]() ;
            } else {
              store.count().onsuccess = function () { 1000 < this.result && store.clear() ; }
            }
          }
        }
      } ;
    },
    share: function () {
      var setting = Store.settings[ 1 ] ;
      
      if ( !jQuery.falsandtru ) { jQuery.fn.falsandtru = jQuery.falsandtru = Store.falsandtru ; }
      
      jQuery.falsandtru( 'share', 'history', setting.history ) ;
      setting.history = jQuery.falsandtru( 'share', 'history' ) ;
      
    },
    falsandtru: function ( namespace, key, value ) {
      var obj, response ;
      
      switch ( true ) {
        case namespace === undefined:
          break ;
          
        case key === undefined:
          response = jQuery.falsandtru[ namespace ] ;
          break ;
          
        case value === undefined:
          response = namespace in jQuery.falsandtru ? jQuery.falsandtru[ namespace ][ key ] : undefined ;
          break ;
          
        case value !== undefined:
          if ( !( jQuery.falsandtru[ namespace ] instanceof Object ) ) { jQuery.falsandtru[ namespace ] = {} ; }
          if ( jQuery.falsandtru[ namespace ][ key ] instanceof Object && value instanceof Object ) {
            jQuery.extend( true, jQuery.falsandtru[ namespace ][ key ], value )
          } else {
            jQuery.falsandtru[ namespace ][ key ] = value ;
          }
          response = jQuery.falsandtru[ namespace ][ key ] ;
          break ;
          
        default:
          break ;
      }
      
      return response ;
    } // function: falsandtru
  } ;
  
  registrate.apply( this, [].slice.call( arguments ).concat( [ Store ] ) ) ;
} ) ( jQuery, window, document, void 0 ) ;
