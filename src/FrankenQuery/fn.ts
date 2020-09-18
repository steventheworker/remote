const rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))helpers/; //todo: figure out why this says "helpers"
//@ts-ignore
if (!Element.prototype.matches) Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || (s => {let matches = helpers.query(s), i = matches.length;while (--i >= 0 && matches.item(i) !== this) {}return i > -1;});

import networking from './networking';
class $ extends networking {
    selector: string;
    isQuery: boolean;
    documentReady(cb:{(): void} = function() {}) {
        this._on(document, 'DOMContentLoaded', undefined, function() {
            if (!document.body) return (function loopLoad() {
                if (document.body) return window.loadCallback();
                setTimeout(loopLoad, 1);
            })();
            if (window.loadCallback) window.loadCallback();
        });
        window.loadCallback = cb;
    }
    quickQuery(selector: string, context: any = document) {
        const test = rquickExpr.exec(selector);
        if (!test) return;
        if (test[1]) { //matched id regex
            const el = document.getElementById(test[1]);
            if (!el || (el && el.id !== test[1])) return []; //in case getById matches by name
            return [el];
        } else if (test[2]) { //matched tag regex
            return context.getElementsByTagName(selector);
        } else if (test[3]) { //matched class regex
            return context.getElementsByClassName(test[3]);
        }
    }
    addHandler(ev: string, el: any, handler: EventHandler) {
        handler.guid = (handler.guid || window.guid++);
        if (!el.handlerList) el.handlerList = {};
        if (!el.handlerList[ev]) el.handlerList[ev] = [];
        el.handlerList[ev].push(handler);
    }
    _on(el: any, ev: string, sel: string, handler: EventHandler, bubbling?: boolean, _one?:any) {
        const self = this;
        const callback = function handlerFunction(event:_Event) {
            event.originalEvent = event; //jQuery compatability
            if (_one) {
                self._off(el, event.type, sel, callback, bubbling);
                if (event.type === 'animationend') ["webkit", "o", "MS"].forEach(type => self._off(el, type + "AnimatonEnd", sel, callback, bubbling));
                if (event.type === 'transitionend') ["webkit", "o", "MS"].forEach(type => self._off(el, type + "TransitionEnd", sel, callback, bubbling));
            }
            let tar = event.target as ETar;
            if (!sel) return handler.call(el, event, el);
            while (tar && tar !== this) {
                if (tar.matches(sel)) handler.call(tar, event, tar);
                tar = tar.parentNode;
            }
        };
        this.addHandler(ev, el, callback);
        el.addEventListener(ev, callback, bubbling);
    }
    _off(el: any, ev:string, sel:string, handler?: any, bubbling:boolean = false) {
        const self = this;
        function removeListener(el: any, ev: string, sel: string, handler: EventHandler, bubbling: boolean) {
            if (typeof sel === "function") {handler = sel;sel = null;}
            if (handler) handler.guid = handler.guid || window.guid++;
            el.removeEventListener(ev, self.getAndRemoveHandler(ev, el, sel, handler), bubbling);
        }
       if (!handler) { //remove all events of type
            el.handlerList[ev].forEach((handler: EventHandler) => removeListener(el, ev, sel, handler, bubbling));
        } else removeListener(el, ev, sel, handler, bubbling);
        return this;
    }
    getAndRemoveHandler(ev: string, el: any, sel: string, handler: EventHandler) {
        const handlers = (el.handlerList || {})[ev];
        if (!handlers || !handlers.length) return handler;
        if (!handler.guid) return el.handlerList.splice(0, 1)[0];
        el.handlerList[ev] = handlers.filter((cur: EventHandler) => {
            if (cur.guid !== handler.guid) return false;
            handler = cur;
            return true;
        });
        return handler;
    }
    element(data: any) { //extract dom el from htmlstring/query
        if (!data) return;
        if (data && data.isQuery) return data[0];
        if (typeof data === "string") {
            let el = document.createElement('div');
            el.innerHTML = data;
            return !el.firstChild.localName ? undefined : el.firstChild; //(!isHTML) ? false : domEl
        }
        return data; //already is el
    }
    queryAll(selector: string, context:any = document) { //querySelectorAll with :eq()
        if (!selector || selector === undefined) return null;
        let queue:QueueEntry[] = [];
        let processSelector:{(input: string): void} = function(input) {
            if (input.indexOf(":eq(") === -1) return undefined;
            let eqlLoc = input.indexOf(":eq(");
            let sel = input.substring(0, eqlLoc);
            let ind = input.substring((eqlLoc + 4), input.indexOf(")", eqlLoc));
            selector = input.substring(input.indexOf(")", eqlLoc) + 1, input.length);
            if (sel.charAt(0) === ">") sel = sel.substring(1, sel.length);
            if (selector.charAt(0) === ">") selector = selector.substring(1, selector.length);
            queue.push({
                selector: sel,
                index: ind
            });
        }
        if (!selector.indexOf) return [selector]; //is an element
        while (selector.indexOf(":eq") !== -1) processSelector(selector);
        let result = context;
        while (queue.length > 0) {
            let item = queue.shift();
            result = result.querySelectorAll(item.selector)[item.index];
        }
        if (selector.trim().length > 0) return result.querySelectorAll(selector);
        return [result];
    }
    setResults(a: any, b: any) {this.changeResults(a, b, true);};
    changeResults(query: any, results: any, setResults:boolean = false) {
        if (results.length === undefined) results = [results];
        if (results.isQuery) results = Array.prototype.slice.call(results.res);
        let copy = query;
        if (!setResults) copy = this.copy(query);
        copy.selector = query.selector;
        for (let i in copy.res) delete copy[i];
        for (let i in results) if (!isNaN(i as any)) copy[i] = results[i];
        copy.res = results;
        copy.length = (results || []).length;
        if (!setResults) {
            copy.selector += "=>helpers";
            copy.prevObject = query;
            return copy;
        }
    }
    copy(query: any) {
        const copy = new $();
        this.setResults(copy, query.res);
        copy.selector = query.selector;
        return copy;
    }
    query(selector:string, context:any = document) {
        let res = this.quickQuery(selector, context);
        if (!res) res = this.queryAll(selector, context);
        return res;
    }
    ev(ctx: any, args: any[], fn: string) { //adds fn to front of args[]
        let a = Array.prototype.slice.call(args);
        a.splice(0, 0, fn);
        return ctx.event.apply(ctx, a);
    }
}


class _Event extends Event {
    originalEvent: Event;
}
class ETar extends EventTarget {
    matches?: {(s: string): boolean};
    parentNode?: any;
}

declare global {
    interface Window {
        guid: number;
        loadCallback: {(): void};
    }
    interface ChildNode {
        localName: string;
    }
    interface Element {
        name: string;
        checked: boolean;
        value: any;
        type: any;
        options: any;
    }
}

class EventHandler extends Function {
    guid?: number;
}

interface QueueEntry {
    selector: string;
    index: string | number;
}

export default $;
