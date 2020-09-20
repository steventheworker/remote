import controller
import sys
import time

from screeninfo import get_monitors
screen = get_monitors()[0]
screen_width = screen.width
screen_height = screen.height

events = sys.argv[1].split(',')
for _e in events:
    e = _e.split('~')
    t = int(e[0]) / 1000
    if e[1] == "u" or e[1] == "d":
        #keyboard event
        numType = 1 if e[1] == "d" else 2 #key#d(own) = press, #key#u(p) = release
        key = e[2]
        shift = e[3]
        controller.press(key, type=numType, shift=shift)
    else: #mouse event
        #scroll
        if e[1] == "scrllms": controller.scroll_mouse(screen_width * float(e[2]), screen_height * float(e[3]))
        #move, set
        if e[1] == "mm": controller.move_mouse(screen_width * float(e[2]), screen_height * float(e[3]))
        if e[1] == "sm": controller.set_mouse(screen_width * float(e[2]), screen_height * float(e[3]))
        #press
        if e[1].startswith('p'): controller.press_mouse(True if e[1][1] == "r" else False)
        #release
        if e[1].startswith('r'): controller.release_mouse(True if e[1][1] == "r" else False)
    if t: time.sleep(t)
