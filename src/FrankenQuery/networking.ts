export default class {
    method() {
        console.log("method")
    }
}
/*
helpers.get = function(url, data, success, dataType) {
    if (typeof url === "object") return helpers.ajax(url);
    if (typeof data === "function") {
        success = data;
        data = null;
    }
    helpers.ajax({url: url, data: data, dataType: dataType, success: success});
};
helpers.put = function(url, data, success, dataType) {
    if (typeof url === "object") {
        url.method = 'PUT';
        return helpers.ajax(url);
    }
    if (typeof data === "function") {
        success = data;
        data = null;
    }
    helpers.ajax({url: url, data: data, method: 'PUT', dataType: dataType, success: success});
};
helpers.delete = function(url, data, success, dataType) {
    if (typeof url === "object") {
        url.method = 'DELETE';
        return helpers.ajax(url);
    }
    if (typeof data === "function") {
        success = data;
        data = null;
    }
    helpers.ajax({url: url, data: data, method: 'DELETE', dataType: dataType, success: success});
};
helpers.post = function(url, data, success, dataType) {
    if (typeof url === "object") {
        url.method = 'POST';
        return helpers.ajax(url);
    }
    if (typeof data === "function") {
        success = data;
        data = null;
    }
    helpers.ajax({url: url, data: data, method: 'POST', dataType: dataType, success: success});
};
helpers.ajax = function(url, settings = {}) {
    const nonGets = {'put':1,'post':1,'delete':1};
    function urlify(url, method, data) {
        let dataString = '';
        for (let key in data) dataString += key + "=" + escape(data[key]) + "&";
        dataString = dataString.slice(0, -1);
        if (!nonGets[(method || '').toLowerCase()]) url = url + (url.indexOf('?') >= 0 ? '&' : '?') + dataString; //GET method, so add dataString to end
        return {data: dataString, url: url};
    }
    if (url.url) {
        settings = url;
        url = url.url;
    }
    let urlified = urlify(url, settings.method, settings.data);
    if (nonGets[(settings.method || '').toLowerCase()]) {
        settings.headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
        settings.body = urlified.data;
    }
    if (settings.contentType) settings.headers = new Headers({'Content-type': settings.contentType});
    let res = fetch(url, settings);
    if (settings && settings.dataType) res = res.then(data => data[settings.dataType.toLowerCase()]());
    else res = res.then(data => data.text());
    if (settings.success) res.then(data => settings.success(data));
    if (settings.error) res.catch(e => settings.error(e));
    res.done = res.then;
    return res;
};
helpers.getJSON = function(url, data, callback = function() {}) {
    //TODO: if local url, use return helpers.ajax, else proceed
    let isJP = url.split("jsoncallback=?")
    if (isJP.length - 1 > 0) {
        function jsonp(url, callback) { // https://stackoverflow.com/questions/22780430/javascript-xmlhttprequest-using-jsonp
            let callbackName = 'callback' + Math.round(100000 * Math.random());
            window[callbackName] = function(data) {
                delete window[callbackName];
                document.body.removeChild(script);
                callback(data);
            };
            let script = document.createElement('script');
            script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'jsoncallback=' + callbackName;
            document.body.appendChild(script);
            return script.src;
        }
        url = isJP[0].substr(0, isJP[0].length - 1); //remove ('&' or '?') & 'jsoncallback=?'
        let x = 0;
        for (let i in data) url += (x++ === 0 ? '?' : '&') + i + "=" + data[i];
        return jsonp(url, callback);
    }
};
*/
