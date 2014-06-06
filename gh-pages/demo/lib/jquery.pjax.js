/*
 * 
 * pjax
 * 
 * ---
 * @Copyright(c) 2012, falsandtru
 * @license MIT http://opensource.org/licenses/mit-license.php
 * @version 1.34.1
 * @updated 2014/06/06
 * @author falsandtru https://github.com/falsandtru/
 * @CodingConventions Google JavaScript Style Guide
 * ---
 * Note:
 * 
 * ---
 * Example:
 * @jquery 1.7.2
 * 
 * $.pjax({area: 'div.pjax:not(.no-pjax)'});
 * 
 * ---
 * Document:
 * https://github.com/falsandtru/jquery.pjax.js
 * 
 */

(function(jQuery, window, document, undefined) {
  
  var Store;
  
  function registrate(jQuery, window, document, undefined, Store) {
    jQuery.fn[Store.name] = jQuery[Store.name] = function() {
      
      return initialize.apply(this, [
        jQuery, window, document, undefined, Store
      ].concat([].slice.call(arguments)));
    };
    Store.setProperties.call(jQuery[Store.name]);
  }
  
  function initialize(jQuery, window, document, undefined, Store, option) {
    var $context = this;
    
    // polymorphism
    switch (true) {
      case typeof option === 'object':
        $context = $context instanceof jQuery ? $context : jQuery(document);
        $context = Store.setProperties.call($context, option.ns || '', null);
        if (!option.area && !option.scope) {
          return $context;
        }
        break;
        
      default:
        $context = $context instanceof jQuery ? $context : jQuery[Store.name];
        return Store.setProperties.call($context, null, null);
    }
    
    // setting
    var setting;
    setting = jQuery.extend(true,
      {
        id: 0,
        gns: Store.name,
        ns: null,
        area: null,
        link: 'a:not([target])',
        filter: function(){return /(\/[^.]*|\.html?|\.php)([#?].*)?$/.test(this.href);},
        form: null,
        scope: null,
        state: null,
        scrollTop: 0,
        scrollLeft: 0,
        ajax: {dataType: 'text'},
        contentType: 'text/html',
        cache: {
          click: false, submit: false, popstate: false, get: true, post: true, mix: false,
          page: 100 /* pages */, size: 1*1024*1024 /* 1MB */, expires: {max: null, min: 5*60*1000 /* 5min */}
        },
        callback: function() {},
        callbacks: {
          ajax: {},
          update: {redirect: {}, url: {}, title: {}, head: {}, content: {}, scroll: {}, css: {}, script: {}, cache: {load: {}, save: {}}, rendering: {}, verify: {}},
          async: false
        },
        parameter: null,
        load: {
          css: false, script: false, execute: true,
          reload: '[href^="chrome-extension://"]',
          reject: '',
          head: 'link, meta, base',
          sync: true, ajax: {dataType: 'script', cache: true}, rewrite: null,
          redirect: true
        },
        interval: 300,
        wait: 0,
        scroll: {delay: 300},
        fix: {location: true, history: true, scroll: true, reset: false},
        hashquery: false,
        fallback: true,
        database: true,
        server: {query: 'pjax=1'}
      },
      option
    );
    setting.location = jQuery('<a/>', {href: Store.canonicalizeURL(window.location.href)})[0];
    setting.destination = jQuery('<a/>', {href: Store.canonicalizeURL(window.location.href)})[0];
    
    setting.nss = {
      array: [Store.name].concat(setting.ns && String(setting.ns).split('.') || [])
    };
    jQuery.extend
    (
      true,
      setting = setting.scope && Store.scope(setting) || setting,
      {
        nss: {
          name: setting.ns || '',
          event: setting.nss.array.join('.'),
          alias: Store.alias ? [Store.alias].concat(setting.nss.array.slice(1)).join('.') : false,
          click: ['click'].concat(setting.nss.array.join(':')).join('.'),
          submit: ['submit'].concat(setting.nss.array.join(':')).join('.'),
          popstate: ['popstate'].concat(setting.nss.array.join(':')).join('.'),
          scroll: ['scroll'].concat(setting.nss.array.join(':')).join('.'),
          data: setting.nss.array.join('-'),
          class4html: setting.nss.array.join('-'),
          requestHeader: ['X', setting.nss.array[0].replace(/^\w/, function($0) {return $0.toUpperCase();})].join('-')
        },
        areaback: setting.area,
        fix: !/Mobile(\/\w+)? Safari/i.test(window.navigator.userAgent) ? {location: false, reset: false} : {},
        contentType: setting.contentType.replace(/\s*[,;]\s*/g, '|').toLowerCase(),
        scroll: {record: true, queue: []},
        log: {script: {}, speed: {}},
        history: {order: [], data: {}, size: 0},
        timeStamp: new Date().getTime(),
        disable: false,
        landing: Store.canonicalizeURL(window.location.href),
        retry: true,
        xhr: null,
        speed: {now: function() {return new Date().getTime();}},
        option: option
      }
    );
    
    // registrate
    if (Store.supportPushState()) {
      jQuery(function() {Store.registrate.call($context, jQuery, window, document, undefined, Store, setting)});
    }
    
    return $context; // function: pjax
  }
  
  Store = {
    name: 'pjax',
    alias: '',
    ids: [],
    settings: [0],
    count: 0,
    setAlias:  function(name) {
      Store.alias = typeof name === 'string' ? name : Store.alias;
      if (Store.name !== Store.alias && !jQuery[Store.alias]) {
        jQuery[Store.name][Store.alias] = jQuery.fn[Store.name];
        jQuery.fn[Store.alias] = jQuery[Store.alias] = jQuery.fn[Store.name];
      }
    },
    IDBFactory: window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB,
    IDBDatabase: null,
    IDBKeyRange: window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange || window.msIDBKeyRange,
    createHTMLDocument: null,
    setProperties: function(namespace, element) {
      
      var $context = this;
      
      if ($context instanceof jQuery || $context === jQuery[Store.name]) {
        
        $context = $context instanceof jQuery && element !== undefined ? $context.add(element) : $context;
        
        $context[Store.name] = jQuery[Store.name];
        
        $context.on = function() {
          var setting = Store.settings[1];
          setting.disable = false;
        };
        
        $context.off = function() {
          var setting = Store.settings[1];
          setting.disable = true;
        };
        
        $context.click = function(url, attr) {
          var anchor;
          switch (true) {
            case typeof url === 'object':
              anchor = jQuery(url);
              break;
              
            case !!url:
              attr = attr || {};
              attr.href = url;
              anchor = jQuery('<a/>', attr);
              break;
              
            default:
              return this;
          }
          return anchor.first().one('click', 1, Store.click).click();
        };
        
        $context.submit = function(url, attr, data) {
          var form, df = document.createDocumentFragment(), type, element;
          switch (true) {
            case typeof url === 'object':
              form = jQuery(url);
              break;
              
            case !!data:
              attr = attr || {};
              attr.action = url;
              type = data instanceof Array && Array || data instanceof Object && Object || undefined;
              for (var i in data) {
                element = data[i];
                switch (type) {
                  case Object:
                    element = jQuery('<textarea/>', {name: i}).val(element);
                    break;
                  case Array:
                    element.attr = element.attr || {};
                    element.attr.name = element.name;
                    element = jQuery(!element.tag.indexOf('<') ? element.tag : '<' + element.tag + '/>', element.attr || {}).val(element.value);
                    break;
                  default:
                    continue;
                }
                df.appendChild(element[0]);
              }
              form = jQuery('<form/>', attr).append(df);
              break;
              
            default:
              return this;
          }
          return form.first().one('submit', 1, Store.submit).submit();
        };
        
        $context.setCache = function(url, data, textStatus, XMLHttpRequest) {
          var setting = Store.settings[1];
          if (!setting || !setting.history) {return this;}
          var cache, history, title, size, timeStamp, expires;
          history = setting.history;
          url = Store.canonicalizeURL(url || window.location.href);
          url = setting.hashquery ? url : url.replace(/#.*/, '');
          switch (arguments.length) {
            case 0:
              data = Store.trim(document.documentElement.outerHTML);
              return arguments.callee.call(this, url, data);
            case 1:
              return arguments.callee.call(this, url, null);
            case 2:
            case 3:
            case 4:
            case 5:
            default:
              history.order.unshift(url);
              for (var i = 1, key; key = history.order[i]; i++) {if (url === key) {history.order.splice(i, 1);}}
              
              history.size > setting.cache.size && jQuery[Store.name].cleanCache();
              jQuery[Store.name].getCache(url);
              
              var doc = Store.createHTMLDocument(data || (XMLHttpRequest||{}).responseText || '');
              title = doc.title || '';
              size = parseInt(doc.documentElement.outerHTML.length * 1.8 || 1024*1024, 10);
              timeStamp = new Date().getTime();
              expires = (function(timeStamp){
                var expires = setting.cache.expires;
                if (!setting.cache.expires) {return 0;}
                if (history.data[url] && !XMLHttpRequest) {return history.data[url].expires;}
                
                if (!XMLHttpRequest) {
                } else if (/no-store|no-cache/.test(XMLHttpRequest.getResponseHeader('Cache-Control'))) {
                } else if (~String(expires = XMLHttpRequest.getResponseHeader('Cache-Control')).indexOf('max-age=')) {
                  expires = expires.match(/max-age=(\d+)/)[1] * 1000;
                } else if (expires = XMLHttpRequest.getResponseHeader('Expires')) {
                  expires = new Date(expires).getTime() - new Date().getTime();
                } else {
                  expires = setting.cache.expires;
                }
                expires = Math.max(expires, 0) || 0;
                expires = typeof setting.cache.expires === 'object' && typeof setting.cache.expires.min === 'number' ? Math.max(setting.cache.expires.min, expires) : expires;
                expires = typeof setting.cache.expires === 'object' && typeof setting.cache.expires.max === 'number' ? Math.min(setting.cache.expires.max, expires) : expires;
                return timeStamp + expires;
              })(timeStamp);
              history.size = history.size || 0;
              history.size += history.data[url] ? 0 : size;
              history.data[url] = jQuery.extend(
                true,
                (history.data[url] || {}),
                {
                  XMLHttpRequest: XMLHttpRequest,
                  textStatus: textStatus,
                  data: data,
                  //css: undefined,
                  //script: undefined,
                  size: size,
                  expires: expires,
                  timeStamp: timeStamp
                }
              );
              if (!history.data[url].data && !history.data[url].XMLHttpRequest) {
                jQuery[Store.name].removeCache(url);
              }
              setting.database && setting.fix.history && Store.dbTitle(url, title);
              break;
          }
          return this;
        };
        
        $context.getCache = function(url) {
          var setting = Store.settings[1];
          if (!setting || !setting.history) {return false;}
          var history;
          history = setting.history;
          url = Store.canonicalizeURL(url || window.location.href);
          url = setting.hashquery ? url : url.replace(/#.*/, '');
          history.data[url] && new Date().getTime() > history.data[url].expires && jQuery[Store.name].removeCache(url);
          history.data[url] && !history.data[url].data && !history.data[url].XMLHttpRequest && jQuery[Store.name].removeCache(url);
          return history.data[url];
        };
        
        $context.removeCache = function(url) {
          var setting = Store.settings[1];
          if (!setting || !setting.history) {return this;}
          var history;
          history = setting.history;
          url = Store.canonicalizeURL(url || window.location.href);
          url = setting.hashquery ? url : url.replace(/#.*/, '');
          for (var i = 0, key; key = history.order[i]; i++) {
            if (url === key) {
              history.order.splice(i, 1);
              history.size -= history.data[key].size;
              history.data[key] = null;
              delete history.data[key];
            }
          }
          return this;
        };
        
        $context.clearCache = function() {
          var setting = Store.settings[1];
          if (!setting || !setting.history) {return this;}
          var history = setting.history;
          for (var i = history.order.length, url; url = history.order[--i];) {
            history.order.splice(i, 1);
            history.size -= history.data[url].size;
            delete history.data[url];
          }
          return this;
        };
        
        $context.cleanCache = function() {
          var setting = Store.settings[1];
          if (!setting || !setting.history) {return this;}
          var history = setting.history;
          for (var i = history.order.length, url; url = history.order[--i];) {
            if (i >= setting.cache.page || url in history.data && new Date().getTime() > history.data[url].expires) {
              history.order.splice(i, 1);
              history.size -= history.data[url].size;
              delete history.data[url];
            }
          }
          return this;
        };
        
        $context.follow = function(event, $XHR, timeStamp) {
          var setting = Store.settings[1];
          if (!setting || !jQuery.when || !Store.check(event, setting)) {return false;}
          if (isFinite(event.timeStamp)) {$XHR.timeStamp = timeStamp || event.timeStamp;}
          setting.xhr = $XHR;
          jQuery.when($XHR)
          .done(function() {
            setting.xhr && setting.xhr.readyState < 4 && setting.xhr.abort();
            jQuery[Store.name].setCache(event.currentTarget.href, undefined, undefined, $XHR);
          })
          .fail(function() {
            Store.fallback(event);
          });
          jQuery[Store.name].click(event.currentTarget.href);
          return true;
        };
      }
      return $context;
    },
    check: function(event, setting) {
      var src, dst;
      src = jQuery('<a/>', {href: Store.canonicalizeURL(window.location.href)})[0];
      dst = jQuery('<a/>', {href: Store.canonicalizeURL(event.currentTarget.href)})[0];
      
      if (!jQuery(event.currentTarget).filter(setting.filter).length) {return;}
      if (setting.disable) {return;}
      
      if (src.protocol !== dst.protocol || src.host !== dst.host) {return;}
      if (event.which>1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {return;}
      
      var url, cache;
      
      url = dst.href;
      setting.area = Store.fire(setting.areaback, null, [event, setting.parameter, dst.href, src.href]);
      if (!jQuery(setting.area).length || setting.scope && !Store.scope(setting, src.href, dst.href)) {return;}
      
      return true;
    },
    supportPushState: function() {
      return 'pushState' in window.history && window.history['pushState'];
    },
    registrate: function(jQuery, window, document, undefined, Store, setting) {
      TEST: {
        function test(createHTMLDocument) {
          try {
            var doc = createHTMLDocument && createHTMLDocument('<html lang="en" class="html a b"><head><noscript><style>/**/</style></noscript></head><body><noscript>noscript</noscript></body></html>');
            return doc && jQuery('html', doc).is('.html[lang=en]') && jQuery('head>noscript', doc).html() && jQuery('body>noscript', doc).text() === 'noscript';
          } catch (err) {}
        }
        
        // chrome, firefox
        Store.createHTMLDocument = function(html) {return window.DOMParser && window.DOMParser.prototype && new window.DOMParser().parseFromString(html || '', 'text/html');};
        if (test(Store.createHTMLDocument)) {break TEST;}
        
        // msafari
        Store.createHTMLDocument = function(html) {
          html = html || '';
          if (document.implementation && document.implementation.createHTMLDocument) {
            var doc = document.implementation.createHTMLDocument('');
            if (typeof doc.activeElement === 'object') {
              doc.open();
              doc.write(html);
              doc.close();
            }
          }
          return doc;
        };
        if (test(Store.createHTMLDocument)) {break TEST;}
        
        // ie10+, opera
        Store.createHTMLDocument = function(html) {
          html = html || '';
          if (document.implementation && document.implementation.createHTMLDocument) {
            var doc = document.implementation.createHTMLDocument('');
            var root = document.createElement('html');
            var attrs = (html.slice(0, 1024).match(/<html ([^>]+)>/im) || [0,''])[1].match(/\w+\="[^"]*.|\w+\='[^']*.|\w+/gm) || [];
            for (var i = 0, attr;attr=attrs[i]; i++) {
              attr = attr.split('=', 2);
              doc.documentElement.setAttribute(attr[0], attr[1].replace(/^["']|["']$/g, ''));
            }
            root.innerHTML = html.replace(/^.*?<html[^>]*>|<\/html>.*$/ig, '');
            doc.documentElement.removeChild(doc.head);
            doc.documentElement.removeChild(doc.body);
            for (var i = 0, element; element = root.childNodes[i]; i) {
              doc.documentElement.appendChild(element);
            }
          }
          return doc;
        };
        if (test(Store.createHTMLDocument)) {break TEST;}
        
        return;
      }; // label: TEST
      
      var context = this;
      
      setting.id = 1;
      Store.ids.push(setting.id);
      Store.settings[setting.id] = setting;
      
      setting.load.script && jQuery('script').each(function() {
        var element = this, src;
        element = typeof setting.load.rewrite === 'function' ? Store.fire(setting.load.rewrite, null, [element.cloneNode()]) || element : element;
        src = element.src;
        if (src in setting.log.script) {return;}
        if (src && (!setting.load.reload || !jQuery(element).is(setting.load.reload))) {setting.log.script[src] = true;}
      });
      
      if (setting.database) {
        Store.database();
        
        setting.fix.scroll &&
        jQuery(window)
        .unbind(setting.nss.scroll)
        .bind(setting.nss.scroll, setting.id, function(event, end) {
          var setting = Store.settings[1];
          var id, fn = arguments.callee;
          
          if (!setting.scroll.delay) {
            Store.dbScroll(jQuery(window).scrollLeft(), jQuery(window).scrollTop());
          } else {
            while (id = setting.scroll.queue.shift()) {clearTimeout(id);}
            id = setTimeout(function() {
              while (id = setting.scroll.queue.shift()) {clearTimeout(id);}
              Store.dbScroll(jQuery(window).scrollLeft(), jQuery(window).scrollTop());
            }, setting.scroll.delay);
            setting.scroll.queue.push(id);
          }
        });
      }
      
      setting.link &&
      jQuery(context)
      .undelegate(setting.link, setting.nss.click)
      .delegate(setting.link, setting.nss.click, setting.id, Store.click = function(event) {
        event.timeStamp = new Date().getTime();
        var setting = Store.settings[1];
        if (!jQuery(this).filter(setting.filter).length) {return;}
        if (setting.disable || event.isDefaultPrevented()) {return;}
        setting.location.href = Store.canonicalizeURL(window.location.href);
        setting.destination.href = Store.canonicalizeURL(this.href);
        
        if (setting.location.protocol !== setting.destination.protocol || setting.location.host !== setting.destination.host) {return;}
        if (event.which>1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {return;}
        if (!setting.hashquery && setting.destination.hash && setting.location.href.replace(/#.*/, '') === setting.destination.href.replace(/#.*/, '')) {return;}
        
        var url, cache;
        
        url = setting.destination.href;
        setting.area = Store.fire(setting.areaback, null, [event, setting.parameter, setting.destination.href, setting.location.href]);
        setting.timeStamp = event.timeStamp;
        if (setting.landing) {setting.landing = false;}
        if (setting.cache.mix && jQuery[Store.name].getCache(url)) {return;}
        if (!jQuery(setting.area).length || setting.scope && !Store.scope(setting)) {return;}
        setting.database && Store.dbScroll(jQuery(window).scrollLeft(), jQuery(window).scrollTop());
        
        if (setting.cache[event.type.toLowerCase()]) {cache = jQuery[Store.name].getCache(url);}
        
        Store.drive(jQuery, window, document, undefined, Store, setting, event, url, true, cache);
        return event.preventDefault();
      });
      
      setting.form &&
      jQuery(context)
      .undelegate(setting.form, setting.nss.submit)
      .delegate(setting.form, setting.nss.submit, setting.id, Store.submit = function(event) {
        event.timeStamp = new Date().getTime();
        var setting = Store.settings[1];
        if (setting.disable || event.isDefaultPrevented()) {return;}
        setting.location.href = Store.canonicalizeURL(window.location.href);
        setting.destination.href = Store.canonicalizeURL(this.action);
        
        if (setting.location.protocol !== setting.destination.protocol || setting.location.host !== setting.destination.host) {return;}
        if (event.which>1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {return;}
        
        var url, cache;
        
        url = setting.destination.href = Store.canonicalizeURL(setting.destination.href.replace(/[?#].*/, '') + (event.target.method.toUpperCase() === 'GET' ? '?' + jQuery(event.target).serialize() : ''));
        setting.area = Store.fire(setting.areaback, null, [event, setting.parameter, setting.destination.href, setting.location.href]);
        setting.timeStamp = event.timeStamp;
        if (setting.landing) {setting.landing = false;}
        if (setting.cache.mix && jQuery[Store.name].getCache(url)) {return;}
        if (!jQuery(setting.area).length || setting.scope && !Store.scope(setting)) {return;}
        setting.database && Store.dbScroll(jQuery(window).scrollLeft(), jQuery(window).scrollTop());
        
        if (setting.cache[event.type.toLowerCase()] && setting.cache[event.target.method.toLowerCase()]) {cache = jQuery[Store.name].getCache(url);}
        
        Store.drive(jQuery, window, document, undefined, Store, setting, event, url, true, cache);
        return event.preventDefault();
      });
      
      jQuery(window)
      .unbind(setting.nss.popstate)
      .bind(setting.nss.popstate, setting.id, Store.popstate = function(event) {
        event.timeStamp = new Date().getTime();
        var setting = Store.settings[1];
        if (setting.disable || event.isDefaultPrevented()) {return;}
        //setting.location.href = Store.canonicalizeURL(window.location.href);
        setting.destination.href = Store.canonicalizeURL(window.location.href);
        
        if (setting.location.href === setting.destination.href) {return event.preventDefault();}
        
        var url, cache;
        
        if (setting.location.hash !== setting.destination.hash &&
             setting.location.pathname + setting.location.search === setting.destination.pathname + setting.destination.search &&
             !setting.hashquery) {
          return event.preventDefault();
        }
        
        url = setting.destination.href;
        setting.area = Store.fire(setting.areaback, null, [event, setting.parameter, setting.destination.href, setting.location.href]);
        setting.timeStamp = event.timeStamp;
        if (setting.landing) {if (setting.landing.href === url) {setting.landing = false; return;} setting.landing = false;}
        if (!jQuery(setting.area).length) {return;}
        
        setting.database && setting.fix.history && Store.dbTitle(url);
        if (setting.cache[event.type.toLowerCase()]) {cache = jQuery[Store.name].getCache(url);}
        
        Store.drive(jQuery, window, document, undefined, Store, setting, event, url, false, cache);
        return event.preventDefault();
      });
    },
    drive: function(jQuery, window, document, undefined, Store, setting, event, url, register, cache) {
      var speedcheck = setting.speedcheck;
      speedcheck && (setting.log.speed.fire = setting.timeStamp);
      speedcheck && (setting.log.speed.time = []);
      speedcheck && (setting.log.speed.name = []);
      speedcheck && setting.log.speed.time.push(0);
      speedcheck && setting.log.speed.name.push('pjax(' + setting.log.speed.time[setting.log.speed.time.length - 1] + ')');
      
      setting.scroll.record = false;
      setting.fix.reset && /click|submit/.test(event.type.toLowerCase()) && window.scrollTo(jQuery(window).scrollLeft(), 0);
      if (Store.fire(setting.callbacks.before, null, [event, setting.parameter], setting.callbacks.async) === false) {return;} // function: drive
      
      jQuery[Store.name].off();
      
      if (cache && cache.XMLHttpRequest) {
        speedcheck && setting.log.speed.name.splice(0, 1, 'cache(' + setting.log.speed.time[setting.log.speed.time.length - 1] + ')');
        jQuery.when ? jQuery.when(Store.wait(Store.fire(setting.wait, null, [event, setting.parameter, setting.destination.href, setting.location.href])))
                      .done(function() {update(jQuery, window, document, undefined, Store, setting, event, cache);})
                    : update(jQuery, window, document, undefined, Store, setting, event, cache);
        
      } else if (setting.xhr && setting.xhr.promise) {
        speedcheck && setting.log.speed.time.splice(0, 1, setting.xhr.timeStamp - setting.log.speed.fire);
        speedcheck && setting.log.speed.name.splice(0, 1, 'preload(' + setting.log.speed.time[setting.log.speed.time.length - 1] + ')');
        speedcheck && setting.log.speed.time.push(setting.speed.now() - setting.log.speed.fire);
        speedcheck && setting.log.speed.name.push('continue(' + setting.log.speed.time[setting.log.speed.time.length - 1] + ')');
        var wait = setting.wait && isFinite(setting.xhr.timeStamp) ? Math.max(setting.wait - new Date().getTime() + setting.xhr.timeStamp, 0) : 0;
        jQuery.when(setting.xhr, Store.wait(wait))
        .done(function() {update(jQuery, window, document, undefined, Store, setting, event, jQuery[Store.name].getCache(url));});
        
      } else {
        var ajax, callbacks, defer, data, XMLHttpRequest, textStatus, errorThrown, dataSize;
        
        ajax = {};
        switch (event.type.toLowerCase()) {
          case 'click':
            ajax.type = 'GET';
            break;
            
          case 'submit':
            ajax.type = event.target.method.toUpperCase();
            if (ajax.type === 'POST') {ajax.data = jQuery(event.target).serializeArray();}
            break;
            
          case 'popstate':
            ajax.type = 'GET';
            break;
        }
        
        defer = jQuery.when ? jQuery.Deferred() : null;
        callbacks = {
          xhr: !setting.callbacks.ajax.xhr ? undefined : function() {
            XMLHttpRequest = Store.fire(setting.callbacks.ajax.xhr, this, [event, setting.parameter], setting.callbacks.async);
            XMLHttpRequest = typeof XMLHttpRequest === 'object' && XMLHttpRequest || jQuery.ajaxSettings.xhr();
            
            //if (XMLHttpRequest instanceof Object && XMLHttpRequest instanceof window.XMLHttpRequest && 'onprogress' in XMLHttpRequest) {
            //  XMLHttpRequest.addEventListener('progress', function(event) {dataSize = event.loaded;}, false);
            //}
            return XMLHttpRequest;
          },
          beforeSend: function() {
            XMLHttpRequest = arguments[0];
            
            setting.xhr && setting.xhr.readyState < 4 && setting.xhr.abort();
            setting.xhr = XMLHttpRequest;
            
            XMLHttpRequest.setRequestHeader(setting.nss.requestHeader, 'true');
            XMLHttpRequest.setRequestHeader(setting.nss.requestHeader + '-Area', setting.area);
            XMLHttpRequest.setRequestHeader(setting.nss.requestHeader + '-CSS', setting.load.css);
            XMLHttpRequest.setRequestHeader(setting.nss.requestHeader + '-Script', setting.load.script);
            
            Store.fire(setting.callbacks.ajax.beforeSend, this, [event, setting.parameter, XMLHttpRequest, arguments[1]], setting.callbacks.async);
          },
          dataFilter: !setting.callbacks.ajax.dataFilter ? undefined : function() {
            data = arguments[0];
            
            return Store.fire(setting.callbacks.ajax.dataFilter, this, [event, setting.parameter, data, arguments[1]], setting.callbacks.async) || data;
          },
          success: function() {
            data = arguments[0];
            textStatus = arguments[1];
            XMLHttpRequest = arguments[2];
            
            Store.fire(setting.callbacks.ajax.success, this, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async);
          },
          error: function() {
            XMLHttpRequest = arguments[0];
            textStatus = arguments[1];
            errorThrown = arguments[2];
            
            Store.fire(setting.callbacks.ajax.error, this, [event, setting.parameter, XMLHttpRequest, textStatus, errorThrown], setting.callbacks.async);
          },
          complete: function() {
            XMLHttpRequest = arguments[0];
            textStatus = arguments[1];
            
            Store.fire(setting.callbacks.ajax.complete, this, [event, setting.parameter, XMLHttpRequest, textStatus], setting.callbacks.async);
            
            if (!errorThrown) {
              defer && defer.resolve() || update(jQuery, window, document, undefined, Store, setting, event, cache);
            } else {
              defer && defer.reject();
              if (setting.fallback && textStatus !== 'abort') {
                return typeof setting.fallback === 'function' ? Store.fire(setting.fallback, null, [event, setting.parameter, setting.destination.href, setting.location.href])
                                                              : Store.fallback(event);
              }
            }
          }
        };
        jQuery.extend(true, ajax, setting.ajax, callbacks);
        var query = setting.server.query;
        if (query) {
          query = query.split('=');
          query = encodeURIComponent(query[0]) + (query.length > 0 ? '=' + encodeURIComponent(query[1]) : '');
        }
        ajax.url = url.replace(/([^#]+)(#[^\s]*)?$/, '$1' + (query ? (url.match(/\?/) ? '&' : '?') + query : '') + '$2');
        
        speedcheck && setting.log.speed.time.push(setting.speed.now() - setting.log.speed.fire);
        speedcheck && setting.log.speed.name.push('request(' + setting.log.speed.time[setting.log.speed.time.length - 1] + ')');
        jQuery.when && jQuery.when(defer.promise(), Store.wait(Store.fire(setting.wait, null, [event, setting.parameter, setting.destination.href, setting.location.href])))
                       .done(function() {update(jQuery, window, document, undefined, Store, setting, event, cache);});
        jQuery.ajax(ajax);
      }
      
      jQuery[Store.name].on();
      
      if (Store.fire(setting.callbacks.after, null, [event, setting.parameter], setting.callbacks.async) === false) {return;} // function: drive
      
      
      function update(jQuery, window, document, undefined, Store, setting, event, cache) {
        UPDATE: {
          var speedcheck = setting.speedcheck;
          speedcheck && setting.log.speed.time.push(setting.speed.now() - setting.log.speed.fire);
          speedcheck && setting.log.speed.name.push('loaded(' + setting.log.speed.time[setting.log.speed.time.length - 1] + ')');
          
          var callbacks_update = setting.callbacks.update;
          if (Store.fire(callbacks_update.before, null, [event, setting.parameter, data, textStatus, XMLHttpRequest, cache], setting.callbacks.async) === false) {break UPDATE;}
          
          if (setting.cache.mix && event.type.toLowerCase() !== 'popstate' && new Date().getTime() - event.timeStamp <= setting.cache.mix) {
            return typeof setting.fallback === 'function' ? Store.fire(setting.fallback, null, [event, setting.parameter, setting.destination.href, setting.location.href]) : Store.fallback(event);
          }
          
          /* variable initialization */
          var title, head, css, script;
          
          try {
            setting.xhr && setting.xhr.readyState < 4 && setting.xhr.abort();
            setting.xhr = null;
            if (!cache && !~(XMLHttpRequest.getResponseHeader('Content-Type') || '').toLowerCase().search(setting.contentType)) {throw new Error("throw: content-type mismatch");}
            
            /* cache */
            UPDATE_CACHE: {
              if (!cache) {break UPDATE_CACHE;}
              if (Store.fire(callbacks_update.cache.load.before, null, [event, setting.parameter, cache], setting.callbacks.async) === false) {break UPDATE_CACHE;}
              XMLHttpRequest = cache.XMLHttpRequest || XMLHttpRequest;
              data = XMLHttpRequest.responseText;
              textStatus = cache.textStatus || textStatus;
              css = cache.css;
              script = cache.script;
              if (Store.fire(callbacks_update.cache.load.after, null, [event, setting.parameter, cache], setting.callbacks.async) === false) {break UPDATE_CACHE;}
            }; // label: UPDATE_CACHE
            
            /* cache */
            UPDATE_CACHE: {
              if (cache && cache.XMLHttpRequest || !setting.cache.click && !setting.cache.submit && !setting.cache.popstate) {break UPDATE_CACHE;}
              if (event.type.toLowerCase() === 'submit' && !setting.cache[event.target.method.toLowerCase()]) {break UPDATE_CACHE;}
              if (Store.fire(callbacks_update.cache.save.before, null, [event, setting.parameter, cache], setting.callbacks.async) === false) {break UPDATE_CACHE;}
              
              jQuery[Store.name].setCache(url, cache && cache.data || null, textStatus, XMLHttpRequest);
              cache = jQuery[Store.name].getCache(url);
              
              if (Store.fire(callbacks_update.cache.save.after, null, [event, setting.parameter, cache], setting.callbacks.async) === false) {break UPDATE_CACHE;}
            }; // label: UPDATE_CACHE
            
            /* variable initialization */
            var newDocument, cacheDocument, areas, checker;
            areas = setting.area.match(/(?:[^,\(\[]+|\(.*?\)|\[.*?\])+/g);
            if (cache && cache.data) {
              cacheDocument = Store.createHTMLDocument(cache.data);
              newDocument = Store.createHTMLDocument(XMLHttpRequest.responseText);
              for (var i = 0, area, containers, elements; area = areas[i++];) {
                containers = jQuery(area, newDocument);
                elements = jQuery(area, cacheDocument);
                for (var j = 0; element = elements[j]; j++) {
                  containers.eq(j).html(jQuery(element).contents());
                }
              }
            } else {
              newDocument = Store.createHTMLDocument(XMLHttpRequest.responseText);
            }
            
            jQuery('noscript', newDocument).each(function() {this.children.length && jQuery(this).text(this.innerHTML);});
            title = jQuery('title', newDocument).text();
            
            if (!jQuery(setting.area).length || jQuery(setting.area).length !== jQuery(setting.area, newDocument).length) {throw new Error('throw: area length mismatch');}
            jQuery(window).trigger(setting.gns + '.unload');
            
            /* redirect */
            UPDATE_REDIRECT: {
              var redirect = jQuery('head meta[http-equiv="Refresh"][content*="URL="]', newDocument);
              if (!redirect[0]) {break UPDATE_REDIRECT;}
              if (Store.fire(callbacks_update.redirect.before, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_REDIRECT;};
              
              redirect = jQuery('<a>', {href: redirect.attr('content').match(/\w+:\/\/[^;\s]+/i)})[0];
              switch (true) {
                case !setting.load.redirect:
                case redirect.protocol !== setting.destination.protocol:
                case redirect.host !== setting.destination.host:
                case 'submit' === event.type.toLowerCase() && 'GET' === event.target.method.toUpperCase():
                  switch (event.type.toLowerCase()) {
                    case 'click':
                    case 'submit':
                      return window.location.assign(redirect.href);
                    case 'popstate':
                      return window.location.replace(redirect.href);
                  }
                default:
                  jQuery[Store.name].on();
                  switch (event.type.toLowerCase()) {
                    case 'click':
                      return jQuery[Store.name].click(redirect.href);
                    case 'submit':
                      return 'GET' === event.target.method.toUpperCase() ? jQuery[Store.name].click(redirect) : window.location.assign(redirect.href);
                    case 'popstate':
                      window.history.replaceState(window.history.state, title, redirect.href);
                      if (register && setting.fix.location) {
                        jQuery[Store.name].off();
                        window.history.back();
                        window.history.forward();
                        jQuery[Store.name].on();
                      }
                      return jQuery(window).trigger('popstate');
                  }
              }
              
              if (Store.fire(callbacks_update.redirect.after, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_REDIRECT;}
            }; // label: UPDATE_REDIRECT
            
            /* url */
            UPDATE_URL: {
              if (Store.fire(callbacks_update.url.before, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_URL;};
              
              register && url !== setting.location.href &&
              window.history.pushState(
                Store.fire(setting.state, null, [event, setting.parameter, setting.destination.href, setting.location.href]),
                window.opera || ~window.navigator.userAgent.toLowerCase().indexOf('opera') ? title : document.title,
                url);
              
              setting.location.href = url;
              if (register && setting.fix.location) {
                jQuery[Store.name].off();
                window.history.back();
                window.history.forward();
                jQuery[Store.name].on();
              }
              
              if (Store.fire(callbacks_update.url.after, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_URL;}
            }; // label: UPDATE_URL
            
            /* title */
            UPDATE_TITLE: {
              if (Store.fire(callbacks_update.title.before, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_TITLE;}
              document.title = title;
              setting.database && setting.fix.history && Store.dbTitle(url, title);
              if (Store.fire(callbacks_update.title.after, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_TITLE;}
            }; // label: UPDATE_TITLE
            
            setting.database && Store.dbCurrent();
            
            /* head */
            UPDATE_HEAD: {
              if (Store.fire(callbacks_update.head.before, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_HEAD;}
              
                var adds = [], removes = jQuery('head').find(setting.load.head).not('[rel~="stylesheet"]');
                head = jQuery('head', newDocument).find(setting.load.head).not(jQuery(setting.area, newDocument).find(setting.load.head));
                head = jQuery(head).not(setting.load.reject).not('[rel~="stylesheet"]');
                
                var selector;
                for (var i = 0, element; element = head[i]; i++) {
                  element = typeof element === 'object' ? element : jQuery(element)[0];
                  
                  switch (element.tagName.toLowerCase()) {
                    case 'base':
                      selector = 'base';
                      break;
                    case 'link':
                      switch ((element.getAttribute('rel') || '').toLowerCase()) {
                        case 'alternate':
                          selector = 'link[type="' + element.getAttribute('type') + '"][rel="' + element.getAttribute('rel') + '"]';
                          break;
                        default:
                          selector = 'link[rel="' + element.getAttribute('rel') + '"]';
                      }
                      break;
                    case 'meta':
                      if (element.getAttribute('charset')) {
                        selector = 'meta[charset]';
                      } else if (element.getAttribute('http-equiv')) {
                        selector = 'meta[http-equiv="' + element.getAttribute('http-equiv') + '"]';
                      } else if (element.getAttribute('name')) {
                        selector = 'meta[name="' + element.getAttribute('name') + '"]';
                      } else {
                        continue;
                      }
                      break;
                    default:
                      selector = null;
                  }
                  adds = head.filter(selector).not('[rel~="stylesheet"]');
                  function callback() {
                    var src = this, dst;
                    function callback() {
                      dst = this;
                      if (src.outerHTML === dst.outerHTML) {
                        adds = adds.not(dst);
                        removes = removes.not(src);
                        return false;
                      } else {
                        return true;
                      }
                    };
                    return !!adds.filter(callback)[0];
                  };
                  jQuery('head').find(selector).not(setting.load.reload).not('[rel~="stylesheet"]').filter(callback).remove();
                  jQuery('head').prepend(adds.map(function() {return jQuery(this.outerHTML)[0];}));
                }
                removes.not(setting.load.reload).remove();
                
              if (Store.fire(callbacks_update.head.after, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_HEAD;}
            }; // label: UPDATE_HEAD
            speedcheck && setting.log.speed.time.push(setting.speed.now() - setting.log.speed.fire);
            speedcheck && setting.log.speed.name.push('head(' + setting.log.speed.time[setting.log.speed.time.length - 1] + ')');
            
            /* content */
            UPDATE_CONTENT: {
              if (Store.fire(callbacks_update.content.before, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_CONTENT;}
              jQuery(setting.area).children('.' + setting.nss.class4html + '-check').remove();
              checker = jQuery('<div/>', {
                'class': setting.nss.class4html + '-check',
                'style': 'background: none !important; display: block !important; visibility: hidden !important; position: absolute !important; top: 0 !important; left: 0 !important; z-index: -9999 !important; width: auto !important; height: 0 !important; margin: 0 !important; padding: 0 !important; border: none !important; font-size: 12px !important; text-indent: 0 !important;'
              }).text(setting.gns);
              for (var i = 0, area, containers, elements; area = areas[i++];) {
                containers = jQuery(area);
                elements = jQuery(area, newDocument).clone().find('script').remove().end();
                for (var j = 0; element = elements[j]; j++) {
                  containers.eq(j).html(jQuery(element).contents()).append(checker.clone());
                }
              }
              checker = jQuery(setting.area).children('.' + setting.nss.class4html + '-check');
              jQuery(document).trigger(setting.gns + '.DOMContentLoaded');
              if (Store.fire(callbacks_update.content.after, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_CONTENT;}
            }; // label: UPDATE_CONTENT
            speedcheck && setting.log.speed.time.push(setting.speed.now() - setting.log.speed.fire);
            speedcheck && setting.log.speed.name.push('content(' + setting.log.speed.time[setting.log.speed.time.length - 1] + ')');
            
            /* scroll */
            function scroll(call) {
              if (Store.fire(callbacks_update.scroll.before, null, [event, setting.parameter], setting.callbacks.async) === false) {return;}
              var scrollX, scrollY;
              switch (event.type.toLowerCase()) {
                case 'click':
                case 'submit':
                  scrollX = call && typeof setting.scrollLeft === 'function' ? Store.fire(setting.scrollLeft, null, [event, setting.parameter, setting.destination.href, setting.location.href]) : setting.scrollLeft;
                  scrollX = 0 <= scrollX ? scrollX : 0;
                  scrollX = scrollX === false || scrollX === null ? jQuery(window).scrollLeft() : parseInt(Number(scrollX), 10);
                  
                  scrollY = call && typeof setting.scrollTop === 'function' ? Store.fire(setting.scrollTop, null, [event, setting.parameter, setting.destination.href, setting.location.href]) : setting.scrollTop;
                  scrollY = 0 <= scrollY ? scrollY : 0;
                  scrollY = scrollY === false || scrollY === null ? jQuery(window).scrollTop() : parseInt(Number(scrollY), 10);
                  
                  (jQuery(window).scrollTop() === scrollY && jQuery(window).scrollLeft() === scrollX) || window.scrollTo(scrollX, scrollY);
                  call && setting.database && setting.fix.scroll && Store.dbScroll(scrollX, scrollY);
                  break;
                case 'popstate':
                  call && setting.database && setting.fix.scroll && Store.dbScroll();
                  break;
              }
              if (Store.fire(callbacks_update.scroll.after, null, [event, setting.parameter], setting.callbacks.async) === false) {return;}
            } // function: scroll
            
            /* rendering */
            function rendering(callback) {
              if (Store.fire(callbacks_update.rendering.before, null, [event, setting.parameter], setting.callbacks.async) === false) {return;}
              
              var count = 0;
              (function() {
                if (checker.filter(function() {return this.clientWidth || this.clientHeight || jQuery(this).is(':hidden');}).length === checker.length || count >= 100) {
                  
                  rendered(callback);
                  
                } else if (checker.length) {
                  count++;
                  setTimeout(arguments.callee, setting.interval);
                }
              })();
            } // function: rendering
            function rendered(callback) {
              speedcheck && setting.log.speed.time.push(setting.speed.now() - setting.log.speed.fire);
              speedcheck && setting.log.speed.name.push('renderd(' + setting.log.speed.time[setting.log.speed.time.length - 1] + ')');
              
              checker.remove();
              setting.scroll.record = true;
              Store.hashscroll(event.type.toLowerCase() === 'popstate') || scroll(true);
              jQuery(window).trigger(setting.gns + '.load');
              Store.fire(callback);
              
              speedcheck && console.log(setting.log.speed.time);
              speedcheck && console.log(setting.log.speed.name);
              if (Store.fire(callbacks_update.rendering.after, null, [event, setting.parameter], setting.callbacks.async) === false) {return;}
            } // function: rendered
            
            /* escape */
            jQuery('noscript', newDocument).remove();
            
            /* css */
            function load_css() {
              UPDATE_CSS: {
                if (!setting.load.css) {break UPDATE_CSS;}
                if (Store.fire(callbacks_update.css.before, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_CSS;}
                
                var save, adds = [], removes = jQuery('link[rel~="stylesheet"], style').not(jQuery(setting.area).find('link[rel~="stylesheet"], style'));
                cache = jQuery[Store.name].getCache(url);
                save = cache && !cache.css;
                css = css || jQuery('link[rel~="stylesheet"], style', newDocument).not(jQuery(setting.area, newDocument).find('link[rel~="stylesheet"], style'));
                css = jQuery(css).not(setting.load.reject);
                
                if (cache && cache.css && css && css.length !== cache.css.length) {save = true;}
                if (save) {cache.css = [];}
                
                for (var i = 0, element; element = css[i]; i++) {
                  element = typeof element === 'object' ? save ? jQuery(element.outerHTML)[0] : element
                                                        : jQuery(element)[0];
                  element = typeof setting.load.rewrite === 'function' ? Store.fire(setting.load.rewrite, null, [element]) || element : element;
                  if (save) {cache.css[i] = element;}
                  
                  for (var j = 0; removes[j]; j++) {
                    if (Store.trim(removes[j].href || removes[j].innerHTML || '') === Store.trim(element.href || element.innerHTML || '')) {
                      if (adds.length) {
                        j ? removes.eq(j - 1).after(adds) : removes.eq(j).before(adds);
                        adds = [];
                      }
                      removes = removes.not(removes[j]);
                      j -= Number(!!j);
                      element = null;
                      break;
                    }
                  }
                  element && adds.push(element.cloneNode(true));
                }
                removes[0] ? removes.last().after(adds) : jQuery('head').append(adds);
                removes.not(setting.load.reload).remove();
                
                if (Store.fire(callbacks_update.css.after, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_CSS;}
                speedcheck && setting.log.speed.time.push(setting.speed.now() - setting.log.speed.fire);
                speedcheck && setting.log.speed.name.push('css(' + setting.log.speed.time[setting.log.speed.time.length - 1] + ')');
              }; // label: UPDATE_CSS
            } // function: css
            
            /* script */
            function load_script(selector) {
              UPDATE_SCRIPT: {
                if (!setting.load.script) {break UPDATE_SCRIPT;}
                if (Store.fire(callbacks_update.script.before, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_SCRIPT;}
                
                var save, execs = [];
                cache = jQuery[Store.name].getCache(url);
                save = cache && !cache.script;
                script = script || jQuery('script', newDocument);
                script = jQuery(script).not(setting.load.reject);
                
                if (cache && cache.script && script && script.length !== cache.script.length) {save = true;}
                if (save) {cache.script = [];}
                
                for (var i = 0, element; element = script[i]; i++) {
                  element = typeof element === 'object' ? save ? jQuery(element.outerHTML)[0] : element
                                                        : jQuery(element)[0];
                  element = typeof setting.load.rewrite === 'function' ? Store.fire(setting.load.rewrite, null, [element]) || element : element;
                  if (save) {cache.script[i] = element;}
                  
                  if (!jQuery(element).is(selector)) {continue;}
                  if (!element.src && !Store.trim(element.innerHTML)) {continue;}
                  if (element.src in setting.log.script || setting.load.reject && jQuery(element).is(setting.load.reject)) {continue;}
                  
                  if (!setting.load.reload || !jQuery(element).is(setting.load.reload)) {setting.log.script[element.src] = true;}
                  element && execs.push(element);
                }
                
                for (var i = 0, element; element = execs[i]; i++) {
                  try {
                    if (element.src) {
                      jQuery.ajax(jQuery.extend(true, {}, setting.ajax, setting.load.ajax, {url: element.src, async: !!element.async, global: false}));
                    } else {
                      typeof element === 'object' && (!element.type || ~element.type.toLowerCase().indexOf('text/javascript')) &&
                      window.eval.call(window, (element.text || element.textContent || element.innerHTML || '').replace(/^\s*<!(?:\[CDATA\[|\-\-)/, '/*$0*/'));
                    }
                  } catch (err) {
                    break;
                  }
                }
                
                if (Store.fire(callbacks_update.script.after, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE_SCRIPT;}
                speedcheck && setting.log.speed.time.push(setting.speed.now() - setting.log.speed.fire);
                speedcheck && setting.log.speed.name.push((selector === '[src][defer]'  ? 'defer' : 'script') + '(' + setting.log.speed.time[setting.log.speed.time.length - 1] + ')');
              }; // label: UPDATE_SCRIPT
            } // function: script
            
            /* verify */
            UPDATE_VERIFY: {
              if (Store.fire(callbacks_update.verify.before, null, [event, setting.parameter], setting.callbacks.async) === false) {break UPDATE_VERIFY;}
              if (url === Store.canonicalizeURL(window.location.href)) {
                setting.retry = true;
              } else if (setting.retry) {
                setting.retry = false;
                Store.drive(jQuery, window, document, undefined, Store, setting, event, window.location.href, false, setting.cache[event.type.toLowerCase()] && jQuery[Store.name].getCache(Store.canonicalizeURL(window.location.href)));
              } else {
                throw new Error('throw: location mismatch');
              }
              if (Store.fire(callbacks_update.verify.after, null, [event, setting.parameter], setting.callbacks.async) === false) {break UPDATE_VERIFY;}
            }; // label: UPDATE_VERIFY
            
            /* load */
            load_css();
            jQuery(window)
            .one(setting.gns + '.rendering', function(event) {
              event.preventDefault();
              event.stopImmediatePropagation();
              
              scroll(false);
              jQuery(document).trigger(setting.gns + '.ready');
              load_script(':not([defer]), :not([src])');
              if (setting.load.sync) {
                rendering(function() {load_script('[src][defer]');});
              } else {
                rendering();
                load_script('[src][defer]');
              }
            })
            .trigger(setting.gns + '.rendering');
            
            if (Store.fire(callbacks_update.success, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE;}
            if (Store.fire(callbacks_update.complete, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE;}
            if (Store.fire(setting.callback, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE;}
          } catch(err) {
            /* cache delete */
            cache && jQuery[Store.name].removeCache(url);
            
            if (Store.fire(callbacks_update.error, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE;}
            if (Store.fire(callbacks_update.complete, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE;}
            if (setting.fallback) {return typeof setting.fallback === 'function' ? Store.fire(setting.fallback, null, [event, setting.parameter, setting.destination.href, setting.location.href]) : Store.fallback(event);}
          };
          
          if (Store.fire(callbacks_update.after, null, [event, setting.parameter, data, textStatus, XMLHttpRequest], setting.callbacks.async) === false) {break UPDATE;}
        }; // label: UPDATE
      } // function: update
    },
    canonicalizeURL: function(url) {
      var ret;
      // Trim
      ret = Store.trim(url);
      // Remove string starting with an invalid character
      ret = ret.replace(/["`^|\\<>{}\[\]\s].*/, '');
      // Deny value beginning with the string of HTTP(S) other than
      ret = /^https?:/i.test(ret) ? ret : jQuery('<a/>', {href: ret})[0].href;
      // Unify to UTF-8 encoded values
      ret = encodeURI(decodeURI(ret));
      // Fix case
      ret = ret.replace(/(?:%\w{2})+/g, function(str) {
        return url.match(str.toLowerCase()) || str;
      });
      return ret;
    },
    trim: function(text) {
      if (String.prototype.trim) {
        text = String(text).trim();
      } else {
        if (text = String(text).replace(/^[\s\uFEFF\xA0]+/, '')) {
          for (var i = text.length; --i;) {
            if (/[^\s\uFEFF\xA0]/.test(text.charAt(i))) {
              text = text.substring(0, i + 1);
              break;
            }
          }
        }
      }
      return text;
    },
    fire: function(fn, context, args, async) {
      if (typeof fn === 'function') {return async ? setTimeout(function() {fn.apply(context, args)}, 0) : fn.apply(context, args);} else {return fn;}
    },
    hashscroll: function(cancel) {
      var setting = Store.settings[1];
      var hash = setting.destination.hash.slice(1);
      cancel = cancel || !hash;
      return !cancel && jQuery('#' + (hash ? hash : ', [name~=' + hash + ']')).first().each(function() {
        isFinite(jQuery(this).offset().top) && window.scrollTo(jQuery(window).scrollLeft(), parseInt(Number(jQuery(this).offset().top), 10));
      }).length;
    },
    wait: function(ms) {
      var defer = jQuery.Deferred();
      if (!ms) {return defer.resolve();}
      
      setTimeout(function() {defer.resolve();}, ms);
      return defer.promise(); // function: wait
    },
    fallback: function(event) {
      switch (event.type.toLowerCase()) {
        case 'click':
          window.location.assign(event.currentTarget.href);
          break;
        case 'submit':
          event.target.submit();
          break;
        case 'popstate':
          window.location.reload();
          break;
      }
    },
    scope: function(setting, src, dst, relocation) {
      var args, scp, arr, dirs, dir, keys, key, pattern, not, reg, rewrite, inherit, hit_src, hit_dst, option;
      
      args = [].slice.call(arguments);
      args.splice(1, 1, src || setting.location.href);
      args.splice(2, 1, dst || setting.destination.href);
      
      scp = setting.scope;
      src = (src || setting.location.href).replace(/.+?\w(\/[^#?]*).*/, '$1');
      dst = (dst || setting.destination.href).replace(/.+?\w(\/[^#?]*).*/, '$1');
      
      arr = src.replace(/^\//, '').replace(/([?#])/g, '/$1').split('/');
      keys = (relocation || src).replace(/^\//, '').replace(/([?#])/g, '/$1').split('/');
      if (relocation) {
        if (!~relocation.indexOf('*')) {return undefined;}
        dirs = [];
        for (var i = 0, len = keys.length; i < len; i++) {'*' === keys[i] && dirs.push(arr[i]);}
      }
      
      for (var i = keys.length + 1; i--;) {
        rewrite = inherit = hit_src = hit_dst = undefined;
        key = keys.slice(0, i).join('/').replace(/\/([?#])/g, '$1');
        key = '/' + key + ((relocation || src).charAt(key.length + 1) === '/' ? '/' : '');
        
        if (!key || !(key in scp)) {continue;}
        if (!scp[key] || !scp[key].length) {return false;}
        
        for (var j = 0; pattern = scp[key][j]; j++) {
          if (hit_src === false || hit_dst === false) {
            break;
          } else if (pattern === 'rewrite' && typeof scp.rewrite === 'function' && !relocation) {
            args.push(Store.fire(scp.rewrite, null, [dst]));
            rewrite = arguments.callee.apply(this, args);
            if (rewrite) {
              hit_src = hit_dst = true;
              break;
            } else if (false === rewrite) {
              return false;
            }
          } else if (pattern === 'inherit') {
            inherit = true;
          } else if (typeof pattern === 'string') {
            not = '^' === pattern.charAt(0);
            pattern = not ? pattern.slice(1) : pattern;
            reg = '*' === pattern.charAt(0);
            pattern = reg ? pattern.slice(1) : pattern;
            
            if (relocation && ~pattern.indexOf('/*/')) {
              for (var k = 0, len = dirs.length; k < len; k++) {pattern = pattern.replace('/*/', '/' + dirs[k] + '/');}
            }
            
            if ((not || !hit_src) && (reg ? !src.search(pattern) : !src.indexOf(pattern))) {
              if (not) {return false;} else {hit_src = true;}
            }
            if ((not || !hit_dst) && (reg ? !dst.search(pattern) : !dst.indexOf(pattern))) {
              if (not) {return false;} else {hit_dst = true;}
            }
          } else if (typeof pattern === 'object') {
            option = pattern;
          }
        }
        
        if (hit_src && hit_dst) {
          return jQuery.extend(true, {}, setting, (typeof rewrite === 'object' ? rewrite : option) || {});
        }
        if (inherit) {continue;}
        break;
      }
    },
    database: function(count) {
      var setting = Store.settings[1];
      var name, version, days, IDBFactory, IDBDatabase, IDBObjectStore;
      name = setting.gns; 
      version = 1;
      days = Math.floor(new Date().getTime() / (1000*60*60*24));
      IDBFactory = Store.IDBFactory;
      IDBDatabase = Store.IDBDatabase;
      count = count || 0;
      
      setting.database = false;
      if (!IDBFactory || !name || count > 5) {
        return false;
      }
      
      try {
        function retry(wait) {
          Store.IDBDatabase = null;
          IDBDatabase && IDBDatabase.close && IDBDatabase.close();
          IDBFactory.deleteDatabase(name);
          wait ? setTimeout(function() {Store.database(++count);}, wait) : Store.database(++count);
        }
        
        version = parseInt(days - days % 7 + version, 10);
        IDBDatabase = IDBFactory.open(name);
        IDBDatabase.onblocked = function() {
        };
        IDBDatabase.onupgradeneeded = function() {
          var IDBDatabase = this.result;
          try {
            for (var i = IDBDatabase.objectStoreNames ? IDBDatabase.objectStoreNames.length : 0; i--;) {IDBDatabase.deleteObjectStore(IDBDatabase.objectStoreNames[i]);}
            IDBDatabase.createObjectStore(setting.gns, {keyPath: 'id', autoIncrement: false}).createIndex('date', 'date', {unique: false});
          } catch (err) {
          }
        };
        IDBDatabase.onsuccess = function() {
          try {
            IDBDatabase = this.result;
            Store.IDBDatabase = IDBDatabase;
            if (IDBObjectStore = Store.dbStore()) {
              IDBObjectStore.get('_version').onsuccess = function() {
                if (!this.result || version === this.result.title) {
                  Store.dbVersion(version);
                  Store.dbCurrent();
                  Store.dbTitle(setting.location.href, document.title);
                  Store.dbScroll(jQuery(window).scrollLeft(), jQuery(window).scrollTop());
                  
                  setting.database = true;
                } else {
                  retry();
                }
              };
            } else {
              retry();
            }
          } catch (err) {
            retry(1000);
          }
        };
        IDBDatabase.onerror = function(event) {
          retry(1000);
        };
      } catch (err) {
        retry(1000);
      }
    },
    dbStore: function() {
      var setting = Store.settings[1], IDBDatabase = Store.IDBDatabase;
      for (var i = IDBDatabase && IDBDatabase.objectStoreNames ? IDBDatabase.objectStoreNames.length : 0; i--;) {
        if (setting.gns === IDBDatabase.objectStoreNames[i]) {
          return IDBDatabase && IDBDatabase.transaction && IDBDatabase.transaction(setting.gns, 'readwrite').objectStore(setting.gns);
        }
      }
      return false;
    },
    dbCurrent: function() {
      var setting = Store.settings[1], IDBObjectStore = Store.dbStore();
      
      if (!IDBObjectStore) {return;}
      var url;
      url = Store.canonicalizeURL(window.location.href);
      url = setting.hashquery ? url : url.replace(/#.*/, '');
      IDBObjectStore.put({id: '_current', title: url});
    },
    dbVersion: function(version) {
      var setting = Store.settings[1], IDBObjectStore = Store.dbStore();
      
      if (!IDBObjectStore) {return;}
      IDBObjectStore.put({id: '_version', title: version});
    },
    dbTitle: function(url, title) {
      var setting = Store.settings[1], IDBObjectStore = Store.dbStore();
      
      if (!IDBObjectStore) {return;}
      url = setting.hashquery ? url : url.replace(/#.*/, '');
      if (title) {
        IDBObjectStore.get(url).onsuccess = function() {
          IDBObjectStore.put(jQuery.extend(true, {}, this.result || {}, {id: url, title: title, date: new Date().getTime()}));
          Store.dbClean();
        };
      } else {
        IDBObjectStore.get(url).onsuccess = function() {
          this.result && this.result.title && (document.title = this.result.title);
        };
      }
    },
    dbScroll: function(scrollX, scrollY) {
      var setting = Store.settings[1], IDBObjectStore = Store.dbStore();
      var url = setting.location.href, title = document.title, len = arguments.length;
      
      if (!setting.scroll.record || !IDBObjectStore) {return;}
      url = setting.hashquery ? url : url.replace(/#.*/, '');
      IDBObjectStore.get('_current').onsuccess = function() {
        if (!this.result || !this.result.title || url !== this.result.title) {return;}
        if (len) {
          IDBObjectStore.get(url).onsuccess = function() {
            IDBObjectStore.put(jQuery.extend(true, {}, this.result || {}, {scrollX: parseInt(Number(scrollX), 10), scrollY: parseInt(Number(scrollY), 10)}));
          }
        } else {
          IDBObjectStore.get(url).onsuccess = function() {
            this.result && isFinite(this.result.scrollX) && isFinite(this.result.scrollY) &&
            window.scrollTo(parseInt(Number(this.result.scrollX), 10), parseInt(Number(this.result.scrollY), 10));
          }
        }
      };
    },
    dbClean: function() {
      var setting = Store.settings[1], IDBObjectStore = Store.dbStore();
      IDBObjectStore.count().onsuccess = function() {
        if (1000 < this.result) {
          IDBObjectStore.index('date').openCursor(Store.IDBKeyRange.upperBound(new Date().getTime() - (3*24*60*60*1000))).onsuccess = function() {
            var IDBCursor = this.result;
            if (IDBCursor) {
              IDBCursor['delete'](IDBCursor.value.id);
              IDBCursor['continue']();
            } else {
              IDBObjectStore.count().onsuccess = function() {1000 < this.result && IDBObjectStore.clear();}
            }
          }
        }
      };
    }
  };
  
  registrate.apply(this, [].slice.call(arguments).concat([Store]));
}) (jQuery, window, document, void 0);