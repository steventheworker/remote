import $ from './fn';
const forEach = Array.prototype.forEach,
      slice = Array.prototype.slice;

class FrankenQuery extends $ {
    length?: number;
    0?: any;
    res: any[];
    result: any[];
    constructor(selector: any) {
        super();
        if (selector && selector.isQuery) return selector;
        if (typeof selector === "function") {
            this.documentReady(selector);
            return;
        }
        let el, res = this.quickQuery(selector); //test for simple queries: ex: this('#id'), this('.class'), this('tag')
        if (!res && (el = this.element(selector))) {
            if (el === window) selector = "window";
            else if (el === document) selector = "document";
            else if (el === document.body) selector = "body";
            else selector = selector.selector || (el.localName + (!el.id?"": "#"+el.id) + (!el.className?"": "." + el.className.replace(/ /g, "."))); //TODO: + "eq(#)"
        }
        if (typeof selector === "string" && el) res = [el];
        res = res || this.queryAll(selector) || [];
        this.selector = selector;
        this.isQuery = true;
        this.setResults(this, res);
    }
    //  str   str      fn        bool
    //[ ev,   sel,   handler,   bubble]
    //[ 0,    1,     1 || 2,    2 || 3]
    event(ev: string, ...arg: any[]) {
        if (["on", "off", "one"].indexOf(ev) !== -1) {
            if (typeof arg[1] === "function") {
                arg[3] = arg[2];
                arg[2] = arg[1];
                arg[1] = undefined;
            }
            let evts = arg[0], callback = arg[2];
            callback.guid = callback.guid || window.guid++;
            evts = evts.split(" ");
            this.each((i, el) => evts.forEach((evt:string) => this[ev === "off" ? "_off" : "_on"](el, evt, arg[1], callback, arg[3], (ev === "one"))));
        } else { //listener w/o selector (ie.click() .focus()) OR trigger()
            if (!arg[0]) { //trigger
                this.trigger(ev);
            } else this.each((i, el) => this._on(el, ev, undefined, arg[0], arg[1]));
        }
        return this;
    }
    trigger(ev: string) {
        let evt = document.createEvent('HTMLEvents');
        evt.initEvent(ev, true, true);
        return this.each((i: number, el: HTMLElement) => el.dispatchEvent ? el.dispatchEvent(evt) : 0);
    }
    scrollTop(val: number) {
        if (val) return this.each((i: number, el: HTMLElement) => el.scrollTo(el.scrollLeft, val));
        if (!val) return this.attr('scrollTop', val);
    }
    scrollLeft(val: number) {
        if (val) return this.each((i: number, el: HTMLElement) => el.scrollTo(val, el.scrollTop));
        if (!val) return this.attr('scrollLeft', val);
    }
    attr(props: any, set?: any) {
        if (!this.length) return;
        function setVal(el: any, prop: string, val: string | number) {
            switch(prop) {
                case 'value':
                case 'textContent':
                case 'innerHTML':
                    el[prop] = val;
                    return;
                default:break;
            }
            el.setAttribute(prop, val);
        }
        if (set !== undefined) return this.each((i: number, el: HTMLElement) => setVal(el, props, set));
        if (typeof props === "string") return this[0][props];
        return this.each((i: number, el: HTMLElement) => {for (let prop in props) setVal(el, prop, props[prop]);});
    }
    slice(...a:any[]) {return this.slice.apply(this.res, a);}
    eq(index: number) {return this.get(index);}
    get(index: number) {
        if (!index && index !== 0) return this.result || this.res;
        return this.res[index];
    }
    prev() {
        let prevs:any[] = [];
        this.each((i: number, el: any) => prevs.push(el.previousElementSibling));
        return this.changeResults(this, prevs.filter(el => el !== null));
    }
    next() {
        let nexts:any[] = [];
        this.each((i: number, el: any) => nexts.push(el.nextElementSibling));
        return this.changeResults(this, nexts.filter(el => el !== null));
    }
    index(tar?: any) {
        if (!tar) { //eq() based on # same tag siblings within parent
            let res = this.siblings().res;
            for (let i in res) if (this[0] === res[i]) return Number(i);
        }
        tar = this.element(tar); //find index from tar in query
        if (!tar) tar = (this.query(tar) || "")[0];
        if (tar) for (let i in this.res) if (this.res[i] === tar) return Number(i);
        return -1;
    }
    first() {return this.changeResults(this, [this.get(0)]);}
    last() {return this.changeResults(this, [this.get(this.length - 1)]);}
    siblings() {
        let cache = this.res; //change w/ .parent()
        let siblings:HTMLElement[] = [];
        this.parent();
        this.each((i:number, parent: HTMLElement) => Array.from(parent.children).forEach((child: HTMLElement) => {
            siblings.push(child);
        }));
        cache.forEach((el: HTMLElement) => { //if you are in the cache, you are out, you cannot be a sibling to yourself
            let index = siblings.indexOf(el);
            if (index !== -1) siblings.splice(index, 1);
        });
        return this.changeResults(this, siblings);
    }
    parent() {
        const parents:any[] = [];
        this.each((i: number, el: any) => {
            if (!el.parentNode) return;
            for (let i in parents) if (parents[i] === el.parentNode) return;
            parents.push(el.parentNode);
        });
        return this.changeResults(this, parents);
    }
    add(query: FrankenQuery) { //combine two queries results
        let res = slice.call(this.res).concat(slice.call(query.res));
        res.forEach((tarEl: HTMLElement, tarI: number) => res.forEach((cur: HTMLElement, i: number) => (i !== tarI && tarEl === cur) ? res.splice(i, 1) : 0)); //remove duplicates
        return this.changeResults(this, res);
    }
    find(selector: any) {
        let res:any[] = [];
        this.each((i: number, el: HTMLElement) => {
            Array.from(this.query(selector, el)).forEach((el, i) => res.push(el));
        });
        return this.changeResults(this, res);
    }
    clone() {
        let clones:any[] = [];
        this.each((i: number, el: HTMLElement) => clones.push(el.cloneNode(true)));
        return this.changeResults(this, clones);
    }
    remove() {return this.each((i: number, el: HTMLElement) => el.parentNode.removeChild(el));}
    replaceWith(data: any) {
        let outer = this.element(data);
        outer = (outer && outer.outerHTML) || data;
        return this.each((i: number, el: HTMLElement) => el.outerHTML = outer);
    }
    innerWidth() {
        return (this[0] || {}).offsetWidth;
    }
    innerHeight() {
        return (this[0] || {}).offsetHeight;
    }
    val(v?: any) {return this.attr('value', v);}
    text(v?: any) {return this.attr('textContent', v);}
    html(v?: string) {return this.attr('innerHTML', v);}
    removeAttr(attr: string) {
        return this.each((i: number, el: HTMLElement) => {
            (attr.indexOf(" ") === -1 ? [attr] : attr.split(' ')).forEach((cur: string) => el.removeAttribute(cur))
        });
    }
    each(callback:{(i: number, el: any): void} = function() {}) {
        forEach.call(this.res, (el: HTMLElement, i: number) => callback.call(el, i, el));
        return this;
    }
    map(callback:{(i: number, el: any): void} = function() {}) {
        let self = this;
        this.result = []; //retrieved w/ .get()
        let res = [].filter.call(this.res, function(el: any, i: number) {
            let toInclude = callback(el, i);
            self.result.push(toInclude);
            if (toInclude === null) return false;
            return true;
        });
        return this.changeResults(this, res);
    }
    parents(sel: string) {
            function getParents(el: any, sel:string) {
            for (; el && el !== document; el = el.parentNode) {
                if (sel) {
                    if (el.matches(sel)) res.push(el);
                    continue;
                }
                res.push(el);
            }
        }
        let res:any[] = [];
        this.each((i, el) => getParents(el, sel));
        return res;
    }
    children() {
        let children:any[] = [];
        this.each((i, el) => Array.from(el ? el.children : []).forEach(child => children.push(child)));
        return this.changeResults(this, children);
    }
    empty() {return this.each((i, el) => el.innerHTML = "");}
    appendTo(selector: any) {
        let el:any;
        if (typeof selector === "string") el = fn(selector)[0]; else el = this.element(selector);
        if (!el) el = this.query(selector)[0];
        return this.each((i, cur) => el.appendChild(cur));
    }
    append(data: any) {
        if (typeof data === "number") data = data.toString();
        data = this.element(data) || document.createTextNode(data || '');
        return this.each((i, el) => el.appendChild(data));
    }
    prependTo() {} //TODO: 
    prepend(data: any) {
        if (typeof data === "number") data = data.toString();
        data = this.element(data) || document.createTextNode(data || '');
        return this.each((i, el) => el.insertBefore(data, el.firstChild));
    }
    before(a: any) {return this.after(a, true);}
    after(data: any, before: any) {
        data = this.element(data) || data;
        const buff = (data && data.outerHTML) || data || '';
        return this.each((i, el) => el.insertAdjacentHTML((before ? 'beforebegin' : 'afterend'), buff));
    }
    offsetParent() {
        return this.changeResults(this, [this[0].offsetParent || this[0]]);
    }
    offset() {
        const {top, right, bottom, left, width, height, x, y} = this[0].getBoundingClientRect();
        return {top, right, bottom, left, width, height, x, y}
    }
    hasClass(tarClass: string) {
        let has = false;
        this.each((i, el) => {
            if (el.classList && el.classList.contains(tarClass)) has = true;
            else if (new RegExp('(^| )' + tarClass + '( |fn)', 'gi').test(el.className)) has = true;
        });
        return has;
    }
    addClass(tarClass: string) {return this.each((i, el) => el.className += ' ' + tarClass);}
    removeClass(tarClass: string) {return this.each((i, el) => el.className = el.className.replace(new RegExp('(^|\\b)' + tarClass.split(' ').join('|') + '(\\b|fn)', 'gi'), ' '));}
    position() {
        if (!this.length) return;
        let offsetParent = this.offsetParent(),
            offset = this.offset(),
            parentOffset = /^body|html$/i.test(offsetParent[0].tagName) ? {
                top: 0,
                left: 0
            } : offsetParent.offset();
        const style = getComputedStyle(this[0]);
        const parentStyle = getComputedStyle(offsetParent[0]);
        offset.top -= parseFloat(style.marginTop);
        offset.left -= parseFloat(style.marginLeft);
        parentOffset.top += parseFloat(parentStyle.borderTopWidth);
        parentOffset.left += parseFloat(parentStyle.borderLeftWidth);
        return {
            top: offset.top - parentOffset.top,
            left: offset.left - parentOffset.left
        };
    }
    hide() {return this.each((i, el) => el.style.display = "none");}
    show(inline?:boolean) {
        return this.each((i, el) => {
            el.style.display = inline ? "inline-block" : "block";
            el.style.visibility = "visible";
        });
    }
    width(val?: number | string): any {
        if (val) {
            if (!isNaN(val as any)) val = val + "px";
            this.css('width', val);
            return this;
        }
        if (this[0] === window) return window.innerWidth;
        if (this[0] === document) {
            const   body = document.body,
                    html = document.documentElement;
            return Math.max( body.scrollWidth, body.offsetWidth,
            html.clientWidth, html.scrollWidth, html.offsetWidth );
        }
        let ret = parseFloat(getComputedStyle(this[0]).width);
        if (isNaN(ret)) ret = (this[0] || {}).offsetWidth;
        return ret;
    }
    height(val?: number | string): any {
        if (val) {
            if (!isNaN(val as any)) val = val + "px";
            this.css('height', val);
            return this;
        }
        if (this[0] === window) return window.innerHeight;
        if (this[0] === document) {
            const   body = document.body,
                    html = document.documentElement;
            return Math.max( body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight );
        }
        let ret = parseFloat(getComputedStyle(this[0]).height);
        if (isNaN(ret)) ret = (this[0] || {}).offsetHeight;
        return ret;
    }
    outerWidth(includeMargin = false) {
        let width = this[0].offsetWidth;
        if (includeMargin) {
            let style = getComputedStyle(this[0]);
            width += parseInt(style.marginLeft) + parseInt(style.marginRight);
        }
        return width;
    }
    outerHeight(includeMargin = false) {
        let height = this[0].offsetHeight;
        if (includeMargin) {
            let style = getComputedStyle(this[0]);
            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        }
        return height;
    }
    stop() {return this;}
    toggleClass(className: string, state?: boolean) {
        function ie9_plus_toggle(el: any, className: string) {
            if (el.classList) el.classList.toggle(className);
            else {
                let classes = el.className.split(' ');
                let existingIndex = classes.indexOf(className);
                if (existingIndex >= 0) classes.splice(existingIndex, 1); else classes.push(className);
                el.className = classes.join(' ');
            }
        }
        if (state !== undefined) return state ? this.addClass(className) : this.removeClass(className);
        else return this.each((i, el) => ie9_plus_toggle(el, className));
    }
    animate(...a: any[]) {
        a = slice.call(a);a[4] = true;
        return this.css.apply(this, a);
    }
    fadeIn(t?: number, callback:{(el?: any): void} = function() {}) {
        if (!callback) t = 400;
        return this.animate({
            visibility: 'visible',
            opacity: 1,
            duration: t
        }, function() {
            if (callback) callback.apply(this, arguments);
        });
    }
    fadeOut(t?: number, callback:{(el?: any): void} = function() {}) {
        if (!callback) t = 400;
        let self = this;
        return this.animate({
            visibility: 'visible',
            duration: t,
            opacity: 0
        }, function() {
            self.css({visibility: 'hidden'}); //can do width: '0px',height: '0px' for display:'none' style
            if (callback) callback.apply(this, arguments);
        });
    }
    css(...a: any[]): any {/* .css(rule, val, csscallback),
                    .css(rules),
                    .css(rules, cssCallback);
                    -------------------------a[4] = true; for animations
                    .animate(rules, duration),
                    .animate(rules, callback),
                    .animate(rules, duration, callback),
                    .animate(rules, duration, easing, callback); */
        function argByType(haystack: any[], type: string, instance = 1) {
            let t = 0;
            return haystack.filter((arg, i) => {
                arg = [arg, i];
                if (typeof arg[0] === type && ++t === instance) return true;
                return null;
            });
        }
        let rules: any = a[0], isAnim = a[4], //shared args
            val: object | number | string, cssCallback: any,            //.css() args
            duration, easing, callback;  //.animate() jQuery arg
        if (isAnim) {
            a = slice.call(a);
            duration = argByType(a, 'number')[0] || 1000;
            easing = argByType(a, 'string')[0] || 'ease-in-out';
            callback = argByType(a, 'function')[0] || argByType(a, 'object', 2)[0];
            if (callback) {
                if (callback.duration) duration = callback.duration;
                if (callback.complete) callback = callback.complete;
                if (callback.duration && !callback.complete) callback = function() {};
            }
            a.splice(4, 1); //remove isAnim
            a[1] = undefined;
            a[2] = callback; //cssCallback = callback
        }
        val = a[1];cssCallback = a[2];
        const self = this;
        if (!this.length) return (a.length === 1 && typeof rules === 'string') ? undefined : this;
        if (cssCallback || typeof val === "function" || duration) { //cssCallback for animation
            cssCallback = cssCallback || val;
            if (rules === "animation" || rules.animation) {
                this.one('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', cssCallback);
            } else if (rules === "transition" || rules.transition) {
                this.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', cssCallback);
            } else { //animate->css callback()
                let oldTrans: string[] = [];
                this.each((i, el) => oldTrans.push(el.style.transition));
                let calledFn = false;
                this.css('transition', 'all ' + duration + 'ms ' + easing, () => {
                    if (calledFn) return;
                    this.each((i, el) => {
                        el.style.transition = oldTrans[i];
                        if (cssCallback) cssCallback.call(el, el);
                    });
                    calledFn = true;
                });
                return setTimeout(() => this.css(rules), 0); //w/o this, transition isn't called immediately after
            }
            if (!a[2]) val = undefined;
        }
        function setCSS(el: any, rule: string, val: object | string | number, skip?: boolean) {
            el.style[rule] = val;
            if (skip) return; //avoids using .startsWith twice, needlessly, in case that affects performance???
            if (rule.startsWith('transition') || rule.startsWith('animation')) {
                setCSS(el, '-webkit-' + rule, val, true);
                setCSS(el, '-moz-' + rule, val, true);
                setCSS(el, '-o-' + rule, val, true);
                setCSS(el, '-ms-' + rule, val, true);
            }
        }
        if (val) return this.each((i, el) => setCSS(el, rules, val));
        if (typeof rules === "string") return getComputedStyle(this.res[0])[rules as any];
        return this.each((i, el) => {
            if (!el.style) return;
            for (let rule in rules) setCSS(el, rule, rules[rule]);
        });
    }
    one(...a:any[]) {return this.ev(this, a, "one");}
    on(...a:any[]) {return this.ev(this, a, "on");}
    off(...a:any[]) {return this.ev(this, a, "off");}
    focus(...a:any[]) {return this.ev(this, a, "focus");}
    blur(...a:any[]) {return this.ev(this, a, "blur");}
    click(...a:any[]) {return this.ev(this, a, "click");}
    dblclick(...a:any[]) {return this.ev(this, a, "dblclick");}
    mousedown(...a:any[]) {return this.ev(this, a, "mousedown");}
    mouseup(...a:any[]) {return this.ev(this, a, "mouseup");}
    mouseenter(...a:any[]) {return this.ev(this, a, "mouseenter");}
    mouseleave(...a:any[]) {return this.ev(this, a, "mouseleave");}
    keypress(...a:any[]) {return this.ev(this, a, "keypress");}
    keydown(...a:any[]) {return this.ev(this, a, "keydown");}
    keyup(...a:any[]) {return this.ev(this, a, "keyup");}
    change(...a:any[]) {return this.ev(this, a, "change");}
    resize(...a:any[]) {return this.ev(this, a, "resize");}
    load(...a:any[]) {return this.ev(this, a, "load");}
    unload(...a:any[]) {return this.ev(this, a, "unload");}
    scroll(...a:any[]) {return this.ev(this, a, "scroll");}
    submit(...a:any[]) {return this.ev(this, a, "submit");}
    reduce() {} //TODO
    filter() {} //TODO
    serialize() { /* serialize 0.2 */
        function serialize(form: HTMLFormElement){if(!form||form.nodeName!=="FORM"){return }let i,j,q=[];for(i=form.elements.length-1;i>=0;i=i-1){if(form.elements[i].name===""){continue}switch(form.elements[i].nodeName){case"INPUT":switch(form.elements[i].type){case"text":case"hidden":case"password":case"button":case"reset":case"email":case"submit":q.push(form.elements[i].name+"="+encodeURIComponent(form.elements[i].value));break;case"checkbox":case"radio":if(form.elements[i].checked){q.push(form.elements[i].name+"="+encodeURIComponent(form.elements[i].value))}break;case"file":break;default:break}break;case"TEXTAREA":q.push(form.elements[i].name+"="+encodeURIComponent(form.elements[i].value));break;case"SELECT":switch(form.elements[i].type){case"select-one":q.push(form.elements[i].name+"="+encodeURIComponent(form.elements[i].value));break;case"select-multiple":for(j=form.elements[i].options.length-1;j>=0;j=j-1){if(form.elements[i].options[j].selected){q.push(form.elements[i].name+"="+encodeURIComponent(form.elements[i].options[j].value))}}break;default:break}break;case"BUTTON":switch(form.elements[i].type){case"reset":case"submit":case"button":q.push(form.elements[i].name+"="+encodeURIComponent(form.elements[i].value));break;default:break}break;default:break}}return q.join("&")};
        let query = '';
        this.each((i, el) => {
            let res = serialize(el);
            query += res.length ? (query.length ? "&" : "") + res : "";
        });
        return query;
    }
}
const fn:{(selector?: any):FrankenQuery} = selector => new FrankenQuery(selector);

export default fn;
