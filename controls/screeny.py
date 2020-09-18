from PIL import Image
from mss import mss

# The simplest use, save a screen shot of the 1st monitor
with mss() as sct:
    sct.shot(output='../screen.png')
