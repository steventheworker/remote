import $ from "./FrankenQuery/FrankenQuery";
import { KeyCodes } from "./KeyMapping";
import { Socket } from "./sockets";

import "./app.css";

interface _Touch {
  x?: number;
  y?: number;
}
interface QueueEvent {
  pressRelease?: string;
  key?: string;
  shift?: boolean;
  t: number;
  a?: any[];
}
export default class App {
  lastTouch: _Touch = {};
  queue: QueueEvent[] = [];
  keyCodes = KeyCodes;
  keys: any = {};
  send_t_millisecs = 175;
  last_send_t = 0;
  screenTimeout = 5000;
  socket: WebSocket = Socket;
  focused: boolean;
  gesturing: { dir?: { x: number; y: number }; counter?: any } = {};
  device: string = (function is_mobile_device() {
    //@ts-ignore
    const a = navigator.userAgent || navigator.vendor || window.opera;
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
        a.substr(0, 4)
      )
    )
      return true;
  })()
    ? "android"
    : "desktop";
  constructor() {
    this.socket.app = this;
  }
  initializeDom() {
    const dev = this.device;
    $("body")
      .on("textInput", "#is_mobile", this.listenKeys)
      .keydown(this.listenKeys)
      .keyup(this.listenKeys)
      .on("contextmenu", ".screen_container", (e: Event) => e.preventDefault())
      .on("mousewheel DOMMouseScroll", ".screen_container", this.mouse_scroll)
      .on(dev === "desktop" ? "mouseup" : "touchend", this.mouse_up)
      .on(
        dev === "desktop" ? "mouseover" : "touchstart",
        ".screen_container",
        this.mouse_start
      )
      .on(dev === "desktop" ? "mousedown" : "touchstart", this.mouse_down)
      .on(dev === "desktop" ? "mousemove" : "touchmove", this.mouse_move)
      .on("blur", "#is_mobile", () => {
        app.hideKeyboard();
      });
    $(window).blur(function() {
      app.hideKeyboard();
    });
  }
  addQueue(...a: any[]) {
    const [pressRelease, key, shift] = a;
    const t = new Date().getTime();
    if (pressRelease === "u" || pressRelease === "d")
      this.queue.push({ pressRelease, key, shift, t });
    else {
      this.queue.push({ a, t });
    }
    this.processQueue();
  }
  delFirstKey() {
    const el = $("#is_mobile");
    el.val(el.val().substr(1));
  }
  send(data: string) {
    if (!this.socket.readyState) return; //todo: add to queue instead of ignoring
    this.socket.send(data);
    console.log('=>"' + data + '"');
  }
  nextShotURL() {
    $(".magnification").css(
      "background-image",
      "url(" + ($("#screen")[0] && $("#screen")[0].src) + ")"
    );
    const src =
      window.location.href + "/dist/screen.png?t=" + new Date().getTime();
    return src;
  }
  nextShot(cb: { (img?: HTMLImageElement): void } = function() {}) {
    const img = new Image();
    img.id = "screen";
    img.src = this.nextShotURL();
    img.onload = function() {
      cb.call(img, img);
    };
  }
  refreshScreen() {
    this.nextShot((img) => {
      $("#screen").attr("id", "_oldScreen");
      $(".screen_container").append(img);
      $("#screen").attr({ width: "100%", height: "100%" });
      $("#_oldScreen").remove();
    });
  }
  init_screen_loop() {
    this.refreshScreen();
    setTimeout(() => this.init_screen_loop(), this.screenTimeout);
  }
  processQueue() {
    console.log(
      "\t\t\t\t\t\t\t\t\t\t\t...\t\t\t\t\t\tprocessing\t\t\t\t\t\t\t\t...\t..."
    );
    if (!this.queue.length) return;
    const last = this.queue[this.queue.length - 1];
    const deltaT = last.t - this.last_send_t;
    const curT = new Date().getTime();
    let delay_processing = false;
    const self = this;
    function do_process() {
      let dataString = "";
      for (let i in self.queue) {
        let cur = self.queue[i];
        let { pressRelease, key, shift, t } = cur;
        dataString += t - self.queue[0].t + "~"; //add T
        if (!cur.a) {
          //keyboard event
          dataString += pressRelease + "~" + key + "~" + shift + ",";
        } else {
          //mouse event
          let [eventType, x, y] = cur.a;
          let prefix = "",
            extraData = "";
          if (!eventType.startsWith("p") && !eventType.startsWith("r"))
            extraData += x.toFixed(3) + "~" + y.toFixed(3);
          if (extraData) prefix = "~";
          dataString += eventType + prefix + extraData + ",";
        }
      }
      dataString = dataString.slice(0, -1);
      self.send("es|" + dataString);
      self.last_send_t = curT;
      self.queue = [];
    }
    if (last.pressRelease === "u" || !last.pressRelease /* mouse event */) {
      if (deltaT < this.send_t_millisecs || curT - this.send_t_millisecs < 333)
        delay_processing = true;
      else do_process();
    }
    if (last.pressRelease === "d" || delay_processing) {
      if (curT - last.t > this.send_t_millisecs) return do_process();
      clearTimeout(window.key_processing);
      window.key_processing = setTimeout(
        this.processQueue,
        333 - (curT - deltaT)
      );
    }
  }
  //event handlers
  mouse_scroll(e: any) {
    const vals = e.originalEvent;
    const valX = vals.deltaX;
    const valY = vals.deltaY;
    app.addQueue("scrllms", -valX / 100, -valY / 100);
  }
  withinBounds(e: any) {
    const container = $(".screen_container"),
      off = container.offset();
    const min = off;
    const max = { ...off };
    max.left += container.width();
    max.top += container.height();
    let val = true;
    const touches = e.originalEvent.touches;
    const it = (touches && Array.prototype.slice.call(touches)) || [e];
    it.forEach((t: Touch) => {
      if (
        t.pageX > min.left &&
        t.pageY > min.top &&
        t.pageY < max.top &&
        t.pageX < max.left
      ) {
      } else val = false;
    });
    return val;
  }
  focusKeyboard() {
    $("#is_mobile")
      .show()[0]
      .focus();
    this.focused = true;
  }
  hideKeyboard() {
    this.focused = false;
    $("#is_mobile").hide();
  }
  UI_down(e: any) {
    const wb = this.withinBounds(e);
    const touches = e.originalEvent.touches || [e],
      t0 = touches[0],
      t1 = touches[1];
    if (touches.length === 2 && !wb && !this.gesturing.dir) {
      //two touches on opposite sides of #screen @outsideBounds = show keyboard
      if (Math.abs(t0.pageX - t1.pageX) > 0.4 * $("body").width())
        this.focusKeyboard();
      //or two touches, same side @outsideBounds = rightclick/leftclick
      if (
        Math.abs(t0.pageX - t1.pageX) <= $(".screen_container").offset().left
      ) {
        const isLeftClick = t1.pageX < 0.5 * $("body").width();
        this.addQueue("p" + (isLeftClick ? "l" : "r"));
        this.addQueue("r" + (isLeftClick ? "l" : "r"));
      }
    }
    return wb;
  }
  UI_up(e: any) {
    this.gesturing = {};
    return this.withinBounds(e);
  }
  UI_move(e: any) {
    const wb = this.withinBounds(e);
    const touches = e.originalEvent.touches || [e];
    if ((touches.length === 2 && !wb) || app.gesturing.dir) {
      //scrolling with two fingers
      const plusOrMinusX = app.lastTouch.x - e.pageX > 0 ? -1 : 1;
      const plusOrMinusY = app.lastTouch.y - e.pageY > 0 ? 1 : -1;
      const dir = app.gesturing.dir || { x: null, y: null };
      let pOmX = dir.x || plusOrMinusX,
        pOmY = dir.y || plusOrMinusY;
      const counter = app.gesturing.counter || { x: null, y: null };
      if (pOmX !== plusOrMinusX) counter.x++;
      if (pOmY !== plusOrMinusY) counter.y++;
      if (counter.x === 3) {
        counter.x = 0;
        pOmX = plusOrMinusX;
        app.gesturing.dir.x = pOmX;
      }
      if (counter.y === 3) {
        counter.y = 0;
        pOmY = plusOrMinusY;
        app.gesturing.dir.y = pOmY;
      }
      app.addQueue("scrllms", (-1 / 20) * pOmX, (-1 / 20) * pOmY);
      app.lastTouch = { x: e.pageX, y: e.pageY };
      if (!app.gesturing.dir)
        app.gesturing = {
          counter: { x: 0, y: 0 },
          dir: { x: plusOrMinusX, y: plusOrMinusY },
        };
      return false;
    }
    return wb;
  }
  mouse_down(e: any) {
    if (!app.UI_down(e)) return;
    if (e.which === 2) return;
    const event_type = "p" + (e.which === 1 || e.which === 0 ? "l" : "r"); //p = press = down
    app.addQueue(event_type);
  }
  mouse_up(e: any) {
    $(".magnification").hide();
    if (!app.UI_up(e)) return;
    if (e.which === 2) return;
    const event_type = "r" + (e.which === 1 || e.which === 0 ? "l" : "r"); //r = release = up
    app.addQueue(event_type);
  }
  updateCursor(e: _Touch) {
    const marginLeft = parseFloat($(".magnification").css("margin-left"));
    const screen = $("#screen");
    const w = screen[0].naturalWidth * 1.5, //getscreenshot dimensions
      h = screen[0].naturalHeight * 1.5;
    const zX = screen.width() / w;
    const zY = screen.height() / h;
    let { x, y } = e;
    x = -x / zX;
    y = -y / zY;
    $(".magnification").css({
      top: e.y + "px",
      left: e.x + "px",
      "background-position": `${x - marginLeft}px ${y - marginLeft}px`,
      "background-size": `${w}px ${h}px`,
    });
  }
  mouse_move(e: any) {
    if (!app.UI_move(e)) return;
    const container = $(".screen_container"),
      off = container.offset();
    const touch = { x: e.pageX - off.left, y: e.pageY - off.top };
    app.updateCursor(touch);
    touch.x = touch.x / container.width();
    touch.y = touch.y / container.height();
    const delta = {
      x: touch.x - app.lastTouch.x,
      y: touch.y - app.lastTouch.y,
    };
    app.lastTouch = touch;
    app.addQueue("mm", delta.x, delta.y);
    e.preventDefault();
  }
  mouse_start(e: any) {
    const container = $(".screen_container"),
      off = container.offset();
    const touch = { x: e.pageX - off.left, y: e.pageY - off.top };
    $(".magnification").show();
    touch.x = touch.x / container.width();
    touch.y = touch.y / container.height();
    app.lastTouch = touch;
    app.addQueue("sm", touch.x, touch.y);
    e.preventDefault();
  }
  listenKeys(e: any) {
    const self = app,
      char = e.data;
    let key =
      e.code ||
      KeyCodes[
        (char && char.charCodeAt(0)) || e.keyCode || e.charCode || e.which
      ];
    if (e.type === "keydown") {
      if (self.device === "desktop") $("#is_mobile").attr("disabled", true);
      else {
        if (key === "Backspace" || key === "Enter") {
        } else return; //ignore keydowns on mobile, textinput specifically for mobile, unless these two annoyings
      }
    }
    if (key && key.length === 1) {
      if (isNaN(Number(key))) key = "Key" + key;
      else key = "Digit" + key;
    }
    if (!e.shiftKey)
      key = key.substr(0, key.length - 1) + key[key.length - 1].toLowerCase();
    if (!key || key === "WakeUp" || key.startsWith("Shift") || key === "Hyper")
      return; //python library has no fn (aka WakeUp)           same with hyper
    let pressRelease = e.type === "keyup" ? "u" : "d"; //default to "d" since e can be textInput or keydown
    if (!e.code) setTimeout(self.delFirstKey, 1000);
    function add2queue() {
      self.keys[key] = 1;
      self.addQueue(pressRelease, key, e.shiftKey);
    }
    if (pressRelease === "u") {
      add2queue();
      delete self.keys[key];
    } else if (!self.keys[key]) add2queue();
  }
}

//initialize
$(function() {
  $("body")
    .html(
      `
        <textarea type="text" id="is_mobile"></textarea>
        <div class="screen_container">
            <div class="magnification"><div class="cursorLineHorizontal"></div><div class="cursorLineVertical"></div><div class="cursor"></div></div>
            <div class="screen-cover"></div>
            <img id="screen" src="${app.nextShotURL()}" />
        </div>
    `
    )
    .attr("ontouchstart", "");
  app.initializeDom();
  app.init_screen_loop();
  app.send("init");
});

//globals
const app = new App();
window.app = app;
window.$ = $;
declare global {
  interface Window {
    key_processing?: ReturnType<typeof setTimeout>;
    app: App;
    $: any;
  }
  interface WebSocket {
    app: App;
  }
}
