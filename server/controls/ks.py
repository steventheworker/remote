import controller
import sys
import time

ks = sys.argv[1].split(',')
for _k in ks:
    k = _k.split('~')
    pressRelease = k[0]
    key = k[1]
    shift = k[2]
    t = int(k[3]) / 1000
    type = 1 if pressRelease == "d" else 2
    controller.press(key, type=type, shift=shift)
    if t: time.sleep(t)
