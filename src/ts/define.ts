/// <reference path=".d/jquery.d.ts"/>
/// <reference path=".d/jquery.pjax.d.ts"/>

interface Window {
  DOMParser?: any
  webkitIndexedDB?: IDBFactory
  mozIndexedDB?: IDBFactory
  IDBKeyRange?: IDBKeyRange
  webkitIDBKeyRange?: IDBKeyRange
  mozIDBKeyRange?: IDBKeyRange
  msIDBKeyRange?: IDBKeyRange
  opera?
}
interface JQueryXHR {
  follow: boolean
  host: string
  timeStamp: number
}
module MODULE {

  export var NAME: string = 'pjax'
  export var NAMESPACE: any = jQuery

  /*
   * 仕様
   * -----
   * 
   * 構成
   * 
   * Rayer:
   * - View
   * - Controller
   * - Model(mvc-interface)
   * - Model(application-rogic)
   * - Model(data-access)
   * 
   * Model:
   * - class Main (mvc-interface)
   *   single instance(M)
   * - class App (application-logic)
   *   single instance(APP)
   * - class Data (data-access)
   *   single instance(DATA)
   * - class Util
   *   static (UTIL)
   * 
   * View
   * - class Main (mvc-interface)
   *   multi instance
   * 
   * Controller
   * - class Main (mvc-interface)
   *   single instance(C)
   * - class Function
   *   single instance
   * - class Method
   *   single instance
   * 
   * -----
   * 
   * 規約
   * 
   * - MVCモジュール間のアクセスは各モジュールのインターフェイスを経由し、内部機能(APP/DATA)に直接アクセスしない。
   * - UTILはどこからでも自由に使用してよい。
   * - モデルインターフェイスへ渡されるデータはすべて正規化、検疫されてないものとして自身で正規化、検疫する。
   * 
   */
  export module MODEL { }
  export module VIEW { }
  export module CONTROLLER { }

  // Model
  export declare class ModelInterface extends StockInterface {
    constructor()

    // Property
    isDeferrable: boolean
    host(): string
    
    // Model
    state(): State
    convertUrlToKeyUrl(unsafe_url: string): string
    isImmediateLoadable(unsafe_url: string, setting?: SettingInterface): boolean
    isImmediateLoadable(event: JQueryEventObject, setting?: SettingInterface): boolean
    getGlobalSetting(): SettingInterface
    setGlobalSetting(setting: SettingInterface): SettingInterface
    getGlobalXHR(): JQueryXHR
    setGlobalXHR(xhr: JQueryXHR): JQueryXHR
    fallback(event: JQueryEventObject, setting: SettingInterface): void
    
    // View
    CLICK(event: JQueryEventObject): void
    SUBMIT(event: JQueryEventObject): void
    POPSTATE(event: JQueryEventObject): void
    SCROLL(event: JQueryEventObject, end: boolean): void
    
    // Controller
    enable(): void
    disable(): void
    getCache(unsafe_url: string): CacheInterface
    setCache(unsafe_url: string, data: string, textStatus: string, jqXHR: JQueryXHR, host?: string): any
    removeCache(unsafe_url: string): void
    clearCache(): void
    cleanCache(): void
  }
  export declare class AppLayerInterface extends StockInterface {
    balance: AppBalanceInterface
    page: AppPageInterface
    data: AppDataInterface

    initialize($context: ContextInterface, setting: SettingInterface): void
    configure(option: SettingInterface, origURL: string, destURL: string): SettingInterface
  }
  export declare class AppBalanceInterface {
    constructor(model: ModelInterface, app: AppLayerInterface)
    host(): string
    
    check(setting: SettingInterface): boolean
    enable(setting: SettingInterface): void
    disable(setting: SettingInterface): void
    changeServer(host: string, setting?: SettingInterface): void
    chooseServer(setting: SettingInterface): void
  }
  export declare class AppPageInterface extends AppPageUtilityInterface {
    constructor(model: ModelInterface, app: AppLayerInterface)

    landing: string
    recent: RecentInterface
    loadedScripts: { [index: string]: boolean }
    isScrollPosSavable: boolean
    globalXHR: JQueryXHR
    globalSetting: SettingInterface
    
    transfer(setting: SettingInterface, event: JQueryEventObject, register: boolean, cache: CacheInterface): void
    fetch(setting: SettingInterface,
          event: JQueryEventObject,
          register: boolean,
          cache: CacheInterface,
          done: (setting: SettingInterface, event: JQueryEventObject, register: boolean, cache: CacheInterface, data: string, textStatus: string, jqXHR: JQueryXHR, errorThrown: string, host: string) => void,
          fail: (setting: SettingInterface, event: JQueryEventObject, register: boolean, cache: CacheInterface, data: string, textStatus: string, jqXHR: JQueryXHR, errorThrown: string, host: string) => void
         ): void
    update(setting: SettingInterface, event: JQueryEventObject, register: boolean, cache: CacheInterface, data: string, textStatus: string, jqXHR: JQueryXHR, errorThrown: string, host: string): void
  }
  export declare class AppPageFetchInterface extends AppPageUtilityInterface {
    constructor(model: ModelInterface,
      app: AppLayerInterface,
      setting: SettingInterface,
      event: JQueryEventObject,
      register: boolean,
      cache: CacheInterface,
      done: (setting: SettingInterface, event: JQueryEventObject, register: boolean, cache: CacheInterface, data: string, textStatus: string, jqXHR: JQueryXHR, errorThrown: string, host: string) => any,
      fail: (setting: SettingInterface, event: JQueryEventObject, register: boolean, cache: CacheInterface, data: string, textStatus: string, jqXHR: JQueryXHR, errorThrown: string, host: string) => any)
  }
  export declare class AppPageUpdateInterface extends AppPageUtilityInterface {
    constructor(model: ModelInterface,
      app: AppLayerInterface,
      setting: SettingInterface,
      event: JQueryEventObject,
      register: boolean,
      cache: CacheInterface,
      data: string,
      textStatus: string,
      jqXHR: JQueryXHR,
      errorThrown: string,
      host: string)
  }
  export declare class AppPageUtilityInterface {
    chooseArea(area: string, srcDocument: Document, dstDocument: Document): string
    chooseArea(areas: string[], srcDocument: Document, dstDocument: Document): string
    movePageNormally(event: JQueryEventObject): void
    calAge(jqXHR: JQueryXHR): number
    calExpires(jqXHR: JQueryXHR): number
  }
  export declare class AppDataInterface {
    //cookie
    getCookie(key: string): string
    setCookie(key: string, value: string, option?: Object): string

    // db
    opendb(setting: SettingInterface): void
    storeNames: {
      meta: string
      history: string
      log: string
      server: string
    }
    
    // buffer
    getBuffer<U>(storeName: string): U
    getBuffer<T>(storeName: string, key: string): T
    getBuffer<T>(storeName: string, key: number): T
    setBuffer<T>(storeName: string, key: string, value: T, isMerge?: boolean): T
    loadBuffer(storeName: string, limit?: number): void
    saveBuffer(storeName: string): void
    loadBufferAll(limit?: number): void
    saveBufferAll(): void

    // meta

    // history
    loadTitleFromDB(unsafe_url: string): void
    saveTitleToDB(unsafe_url: string, title: string): void
    loadScrollPositionFromDB(unsafe_url: string): void
    saveScrollPositionToDB(unsafe_url: string, scrollX: number, scrollY: number): void

    // log
    loadLogFromDB(): void
    saveLogToDB(log: LogSchema): void

    // server
    loadServerFromDB(): void
    saveServerToDB(host: string, state?: number, unsafe_url?: string, expires?: number): void
  }
  export declare class DataLayerInterface {
    DB: DataDBInterface
    Cookie: DataCookieInterface
  }
  export declare class DataDBInterface {

    IDBFactory: IDBFactory
    IDBKeyRange: IDBKeyRange

    database(): IDBDatabase
    nowInitializing: boolean
    nowRetrying: boolean
    state(): State
    store: DatabaseSchema
    metaNames: {
      version: string
      update: string
    }
    
    conExtend(): void

    opendb(task: () => void, noRetry?: boolean): void
    closedb(): void
  }
  export declare class DataStoreInterface<T> {
    constructor(DB: DataDBInterface)

    name: string
    keyPath: string

    accessStore(success: (store?: IDBObjectStore) => void, mode?: string): void
    accessRecord(key: string, success: (event?: Event) => void, mode?: string): void

    loadBuffer(limit?: number): void
    saveBuffer(): void
    getBuffer(): T[]
    getBuffer(key: string): T
    getBuffer(key: number): T
    setBuffer(value: T, isMerge?: boolean): T
    addBuffer(value: any): T
    
    add(value: T): void
    set(value: T): void
    get(key: number, success: (event: Event) => void): void
    get(key: string, success: (event: Event) => void): void
    del(key: number): void
    del(key: string): void
  }
  export declare class DataStoreMetaInterface<T> extends DataStoreInterface<T> {
  }
  export declare class DataStoreHistoryInterface<T> extends DataStoreInterface<T> {
    clean(): void
  }
  export declare class DataStoreLogInterface<T> extends DataStoreInterface<T> {
    clean(): void
  }
  export declare class DataStoreServerInterface<T> extends DataStoreInterface<T> {
  }
  export declare class DataCookieInterface {
    constructor(age: number)

    getCookie(key: string): string
    setCookie(key: string, value: string, option?: CookieOptionInterface): string
  }
  export declare class StockInterface {
    stock(key?: string, value?: any, merge?: boolean): any
    stock(key?: Object): any
  }
  // View
  export declare class ViewInterface {
    constructor(context: ContextInterface)
    CONTEXT: ContextInterface
    
    BIND(setting: SettingInterface): ViewInterface
    UNBIND(setting: SettingInterface): ViewInterface
    OBSERVE(): ViewInterface
    RELEASE(): ViewInterface
  }
  // Controller
  export declare class ControllerInterface {
    constructor()

    CLICK(event: JQueryEventObject): void
    SUBMIT(event: JQueryEventObject): void
    POPSTATE(event: JQueryEventObject): void
    SCROLL(event: JQueryEventObject): void
  }
  export interface FunctionInterface {
    enable(): JQueryPjax
    disable(): JQueryPjax
    click(): JQueryPjax
    click(url: string, attr?: { href?: string; }): JQueryPjax
    click(url: HTMLAnchorElement, attr?: { href?: string; }): JQueryPjax
    click(url: JQuery, attr?: { href?: string; }): JQueryPjax
    submit(): JQueryPjax
    submit(url: string, attr: { action?: string; method?: string; }, data: any): JQueryPjax
    submit(url: HTMLFormElement, attr?: { action?: string; method?: string; }, data?: any): JQueryPjax
    submit(url: JQuery, attr?: { action?: string; method?: string; }, data?: any): JQueryPjax
    follow(event: JQueryEventObject, ajax: JQueryXHR, host?: string): boolean
    setCache(): JQueryPjax
    setCache(url: string): JQueryPjax
    setCache(url: string, data: string): JQueryPjax
    setCache(url: string, data: string, textStatus: string, jqXHR: JQueryXHR): JQueryPjax
    getCache(): PjaxCache
    getCache(url: string): PjaxCache
    removeCache(url: string): JQueryPjax
    removeCache(): JQueryPjax
    clearCache(): JQueryPjax
    host(): string
  }
  export interface MethodInterface {
  }

  // enum
  export enum State { wait = -1, ready, lock, seal, error }

  // Parameter
  export interface SettingInterface {
    // public
    area: string
    link: string
    filter(): boolean
    form: string
    scope: {
      [index: string]: any
      rewrite(url: string): string
    }
    rewrite: (document: Document, area: string, host: string) => void
    state: {}
    scrollTop: number
    scrollLeft: number
    ajax: JQueryAjaxSettings
    contentType: string
    cache: {
      click: boolean
      submit: boolean
      popstate: boolean
      get: boolean
      post: boolean
      limit: number
      size: number
      expires: {
        max: number
        min: number
      }
      mix: number
    }
    buffer: {
      limit: number
      delay: number
    }
    load: {
      head: string
      css: boolean
      script: boolean
      execute: boolean
      log: string
      reload: string
      ignore: string
      ajax: JQueryAjaxSettings
    }
    balance: {
      self: boolean
      weight: number
      client: {
        support: {
          userAgent: RegExp
          redirect: RegExp
        }
        exclude: RegExp
        cookie: {
          balance: string
          redirect: string
          host: string
        }
      }
      server: {
        header: string
        filter: RegExp
        error: number
        host: string //internal
      }
      log: {
        expires: number
        limit: number
      }
      option: PjaxSetting
    }
    redirect: boolean
    wait: number
    scroll: {
      delay: number
      queue: number[] //internal
    }
    fix: {
      location: boolean
      history: boolean
      scroll: boolean
      noscript: boolean
      reset: boolean
    }
    fallback: boolean
    database: boolean
    server: {
      query: any
      header: {
        area: boolean
        head: boolean
        css: boolean
        script: boolean
      }
    }
    callback(): any
    param: any
    callbacks: {
      ajax: {
        xhr?: (event: JQueryEventObject, param: any) => any
        beforeSend?: (event: JQueryEventObject, param: any, data: string, ajaxSettings: any) => any
        dataFilter?: (event: JQueryEventObject, param: any, data: string, dataType: any) => any
        success?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        error?: (event: JQueryEventObject, param: any, jqXHR: JQueryXHR, textStatus: string, errorThrown: any) => any
        complete?: (event: JQueryEventObject, param: any, jqXHR: JQueryXHR, textStatus: string) => any
        done?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        fail?: (event: JQueryEventObject, param: any, jqXHR: JQueryXHR, textStatus: string, errorThrown: any) => any
        always?: (event: JQueryEventObject, param: any, jqXHR: JQueryXHR, textStatus: string) => any
      }
      update: {
        redirect: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        url: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        rewrite: {
          before?: (event: JQueryEventObject, param: any, cache: any) => any
          after?: (event: JQueryEventObject, param: any, cache: any) => any
        }
        title: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        head: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        content: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        css: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        script: {
          before?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
          after?: (event: JQueryEventObject, param: any, data: string, textStatus: string, jqXHR: JQueryXHR) => any
        }
        scroll: {
          before?: (event: JQueryEventObject, param: any) => any
          after?: (event: JQueryEventObject, param: any) => any
        }
        balance: {
          before?: (event: JQueryEventObject, param: any) => any
          after?: (event: JQueryEventObject, param: any) => any
        }
      }
    }
    
    // internal
    uuid: string
    gns: string
    ns: string
    nss: {
      name: string
      event: string[]
      click: string
      submit: string
      popstate: string
      scroll: string
      data: string
      class4html: string
      requestHeader: string
    }
    origLocation: HTMLAnchorElement
    destLocation: HTMLAnchorElement
    areas: string[]
    loadtime: number
    retriable: boolean
    disable: boolean
    option: any
    speedcheck: boolean
  }

  // Member
  export interface ContextInterface extends JQuery { }
  export interface RecentInterface {
    order: string[]
    data: {
      [index: string]: CacheInterface
    }
    size: number
  }

  // Object
  export interface CacheInterface {
    jqXHR: JQueryXHR
    data: string
    textStatus: string
    size: number
    expires: number
    host: string
    timeStamp: number
  }
  export interface CookieOptionInterface {
    age: number
    path: string
    domain: string
    secure: boolean
  }

  // Database
  export interface DatabaseSchema {
    meta: DataStoreMetaInterface<MetaSchema>
    history: DataStoreHistoryInterface<HistorySchema>
    log: DataStoreLogInterface<LogSchema>
    server: DataStoreServerInterface<ServerSchema>
  }
  export interface MetaSchema {
    id: string
    value: any
  }
  export interface HistorySchema {
    id: string      // url
    title: string   // fix
    date: number    // fix
    scrollX: number // fix
    scrollY: number // fix
    expires: number // blanace
    host: string    // balance
  }
  export interface LogSchema {
    host: string
    performance: number
    date: number
  }
  export interface ServerSchema {
    id: string    // host
    state: number // 0:正常, !0:異常発生時刻(ミリ秒)
  }

  export var GEN_UUID: () => string = function () {
    // version 4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16).toUpperCase();
    });
  }
}