from pynput.keyboard import Key, Controller

keyboard = Controller()
def press(letter):
    keyboard.press(letter)
    keyboard.release(letter)