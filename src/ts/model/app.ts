/// <reference path="../define.ts"/>
/// <reference path="_template.ts"/>
/// <reference path="app.balance.ts"/>
/// <reference path="app.page.ts"/>
/// <reference path="app.data.ts"/>
/// <reference path="utility.ts"/>
/// <reference path="../view/main.ts"/>

/* MODEL */

module MODULE.MODEL {
  
  export class App extends Template implements AppLayerInterface {

    constructor(public model_: ModelInterface, public controller_: ControllerInterface) {
      super();
    }

    balance: AppBalanceInterface = new AppBalance(this.model_, this)
    page: AppPageInterface = new AppPage(this.model_, this)
    data: AppDataInterface = new AppData(this.model_, this)

    initialize($context: ContextInterface, setting: SettingInterface): void {
      var loadedScripts = this.page.loadedScripts;
      setting.load.script && jQuery('script').each(function () {
        var element: HTMLScriptElement = this;
        if (element.src) { loadedScripts[element.src] = !setting.load.reload || !jQuery(element).is(setting.load.reload); }
      });

      new VIEW.Main(this.model_, this.controller_, $context).BIND(setting);
      setTimeout(() => this.data.loadBufferAll(setting.buffer.limit), setting.buffer.delay);
      setting.balance.self && setTimeout(() => this.balance.enable(setting), setting.buffer.delay);
      setTimeout(() => this.page.landing = null, 1500);
    }

    configure(option: SettingInterface, origURL: string, destURL: string): SettingInterface {
      var that = this;

      origURL = Util.normalizeUrl(origURL || option.origLocation.href);
      destURL = Util.normalizeUrl(destURL || option.destLocation.href);
      option = jQuery.extend(true, {}, option.option || option, { option: option.option || option });

      option = option.scope ? jQuery.extend(true, {}, option, scope(option, origURL, destURL) || { disable: true })
                            : jQuery.extend(true, {}, option);

      var initial = {
            gns: NAME,
            ns: '',
            disable: false,
            
            area: 'body',
            link: 'a:not([target])',
            // this.protocolはIEでエラー
            filter: function(){return /^https?:/.test(this.href) && /(\/[^.]*|\.html?|\.php)$/.test('/' + this.pathname);},
            form: null,
            scope: null,
            rewrite: null,
            state: null,
            scrollTop: 0,
            scrollLeft: 0,
            ajax: { dataType: 'text' },
            contentType: 'text/html',
            cache: {
              click: false, submit: false, popstate: false, get: true, post: true, mix: 0,
              limit: 100 /* pages */, size: 1 * 1024 * 1024 /* 1MB */, expires: { max: null, min: 5 * 60 * 1000 /* 5min */}
            },
            buffer: {
              limit: 30,
              delay: 500 
            },
            load: {
              head: '',
              css: false,
              script: false,
              execute: true,
              log: 'head, body',
              reload: '',
              ignore: '[src*="jquery.js"], [src*="jquery.min.js"], [href^="chrome-extension://"]',
              ajax: { dataType: 'script', cache: true }
            },
            balance: {
              self: false,
              weight: 3,
              client: {
                support: {
                  userAgent: /msie|trident.+ rv:|chrome|firefox|safari/i,
                  redirect: /chrome|firefox|safari/i
                },
                exclude: /mobile|phone|android|iphone|blackberry/i,
                cookie: {
                  balance: 'ajax_balanceable',
                  redirect: 'ajax_redirectable',
                  host: 'ajax_host'
                }
              },
              server: {
                header: 'X-Ajax-Host',
                filter: null,
                error: 10 * 60 * 1000,
              },
              log: {
                expires: 10 * 24 * 60 * 60 * 1000,
                limit: 30
              },
              option: {
                server: {
                  header: false
                },
                ajax: {
                  crossDomain: true
                },
                callbacks: {
                  ajax: {
                    beforeSend: null
                  }
                }
              }
            },
            callback: null,
            callbacks: {
              ajax: {},
              update: { redirect: {}, rewrite: {}, url: {}, title: {}, head: {}, content: {}, scroll: {}, css: {}, script: {}, balance: {} }
            },
            param: null,
            redirect: true,
            wait: 0,
            scroll: { delay: 300 },
            fix: {
              location: true,
              history: true,
              scroll: true,
              noscript: true,
              reset: false
            },
            fallback: true,
            database: true,
            server: {
              query: 'pjax=1',
              header: true
            },
            speedcheck: false
          },
          force = {
            origLocation: (function (url, a) { a.href = url; return a; })(origURL, document.createElement('a')),
            destLocation: (function (url, a) { a.href = url; return a; })(destURL, document.createElement('a')),
            balance: {
              server: {
                host: ''
              }
            },
            scroll: { queue: [] },
            loadtime: null,
            retriable: true,
            option: option.option
          },
          compute = function () {
            var nsArray: string[] = [setting.gns || NAME].concat(setting.ns && String(setting.ns).split('.') || []);
            var query: string = setting.server.query;
            switch (query && typeof query) {
              case 'string':
                query = eval('({' + query.replace(/"/g, '\\"').replace(/([^?=&]+)=([^&]*)/g, '"$1": "$2"').replace(/&/g, ',') + '})');
              case 'object':
                query = jQuery.param(query);
                break;
            }
            return {
              nss: {
                name: setting.ns || '',
                array: nsArray,
                event: nsArray.join('.'),
                data: nsArray.join('-'),
                class4html: nsArray.join('-'),
                click: ['click'].concat(nsArray.join(':')).join('.'),
                submit: ['submit'].concat(nsArray.join(':')).join('.'),
                popstate: ['popstate'].concat(nsArray.join(':')).join('.'),
                scroll: ['scroll'].concat(nsArray.join(':')).join('.'),
                requestHeader: ['X', nsArray[0].replace(/^\w/, function (str) { return str.toUpperCase(); })].join('-')
              },
              fix: !/android|iphone os|like mac os x/i.test(window.navigator.userAgent) ? { location: false, reset: false } : {},
              contentType: setting.contentType.replace(/\s*[,;]\s*/g, '|').toLowerCase(),
              server: {
                query: query
              },
              timeStamp: new Date().getTime()
            };
          };

      var setting: SettingInterface;
      setting = jQuery.extend(true, initial, option);
      setting = jQuery.extend(true, setting, setting.balance.self && setting.balance.option, force);
      setting = jQuery.extend(true, setting, compute());

      return setting; //new this.stock(setting);

      function scope(setting: SettingInterface, origURL: string, destURL: string, rewriteKeyUrl: string = ''): any {
        var origKeyUrl: string,
            destKeyUrl: string,
            scpTable = setting.scope,
            dirs: string[],
            scpKeys: string[],
            scpKey: string,
            scpTag: string,
            patterns: string[],
            inherit: boolean,
            hit_src: boolean,
            hit_dst: boolean,
            option: Object;

        origKeyUrl = that.model_.convertUrlToKeyUrl(origURL).match(/.+?\w(\/.*)/).pop();
        destKeyUrl = that.model_.convertUrlToKeyUrl(destURL).match(/.+?\w(\/.*)/).pop();
        rewriteKeyUrl = rewriteKeyUrl.replace(/[#?].*/, '');

        scpKeys = (rewriteKeyUrl || destKeyUrl).replace(/^\/|\/$/g, '').split('/');
        if (rewriteKeyUrl) {
          if (!~rewriteKeyUrl.indexOf('*')) { return undefined; }
          dirs = [];
          var arr: string[] = origKeyUrl.replace(/^\/|\/$/g, '').split('/');
          for (var i = 0, len = scpKeys.length; i < len; i++) { '*' === scpKeys[i] && dirs.push(arr[i]); }
        }

        for (var i = scpKeys.length + 1; i--;) {
          inherit = option = hit_src = hit_dst = undefined;
          scpKey = scpKeys.slice(0, i).join('/');
          scpKey = '/' + scpKey + ('/' === (rewriteKeyUrl || origKeyUrl).charAt(scpKey.length + 1) ? '/' : '');

          if (!scpKey || !(scpKey in scpTable)) { continue; }

          if (scpTable[scpKey] instanceof Array) {
            scpTag = '';
            patterns = scpTable[scpKey];
          } else {
            scpTag = scpTable[scpKey];
            patterns = scpTable[scpTag];
          }

          if (!patterns || !patterns.length) { return false; }

          patterns = patterns.concat();
          for (var j = 0, pattern; pattern = patterns[j]; j++) {
            if (hit_src === false || hit_dst === false) { break; }

            if ('#' === pattern[0]) {
              scpTag = pattern.slice(1);
              [].splice.apply(patterns, [j, 1].concat(scpTable[scpTag]));
              pattern = patterns[j];
            }

            if ('inherit' === pattern) {
              inherit = true;
            } else if ('rewrite' === pattern && 'function' === typeof scpTable.rewrite && !rewriteKeyUrl) {
              var rewrite: any = scope.apply(this, [].slice.call(arguments).slice(0, 3).concat([Util.fire(scpTable.rewrite, null, [destKeyUrl])]));
              if (rewrite) {
                hit_src = hit_dst = true;
                option = rewrite;
                break;
              } else if (false === rewrite) {
                return false;
              }
            } else if ('string' === typeof pattern) {
              var not: boolean = '!' === pattern[0];
              pattern = not ? pattern.slice(1) : pattern;
              var reg: boolean = '*' === pattern[0];
              pattern = reg ? pattern.slice(1) : pattern;

              if (rewriteKeyUrl && ~pattern.indexOf('/*/')) {
                for (var k = 0, len = dirs.length; k < len; k++) { pattern = pattern.replace('/*/', '/' + dirs[k] + '/'); }
              }

              if (reg ? !origKeyUrl.search(pattern) : !origKeyUrl.indexOf(pattern)) {
                if (not) {
                  return false;
                } else {
                  hit_src = true;
                }
              }
              if (reg ? !destKeyUrl.search(pattern) : !destKeyUrl.indexOf(pattern)) {
                if (not) {
                  return false;
                } else {
                  hit_dst = true;
                  option = scpTable['$' + scpTag] || scpTable['$' + pattern] || null;
                }
              }
            }
          }

          if (hit_src && hit_dst) {
            return jQuery.extend(true, {}, setting, option);
          }
          if (inherit) { continue; }
          break;
        }
      }
    
    }

  }

}