from pynput.keyboard import Key, Controller
keyboard = Controller()

SpecialChars = {
    "Space": Key.space,
    "Enter": Key.enter,
    "Backspace": Key.backspace,
    "Escape": Key.esc,
    "ShiftRight": Key.shift_r,
    "ShiftLeft": Key.shift_l,
    "CapsLock": Key.caps_lock,
    "ControlRight": Key.ctrl_r,
    "ControlLeft": Key.ctrl_l,
    #"ContextMenu": ,
    #"MetaLeft": ,
    #"MetaRight": ,
    #home, end, insert, pageupdown, delete, numlock, scrollock, prntscreen, pausebreak, keypadenter&0-9
    "Slash": "/",
    "Period": ".",
    "Comma": ",",
    "Backquote": "`",
    "Equal": "=",
    "Minus": "-",
    "Semicolon": ";",
    "Quote": "'",
    "Backslash": "\\",
    "BracketLeft": "[",
    "BracketRight": "]",
    "ArrowDown": Key.down,
    "ArrowLeft": Key.left,
    "ArrowRight": Key.right,
    "ArrowUp": Key.up,
    #dont get sent vvvvv
    "AltLeft": Key.alt_l,
    "AltRight": Key.alt_r,
    #windowskey, tab
}
def press(char):
    if char.startswith('Digit'):
        char = char[5:]
    elif char.startswith('Key'):
        char = char[3:]
    elif SpecialChars[char]:
        char = SpecialChars[char]
    keyboard.press(char)
    keyboard.release(char)
press('ArrowUp')
