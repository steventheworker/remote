const robot = require("robotjs");

/* Type "Hello World".
robot.typeString("Hello World"); */

module.exports = {
    press: function(k) {
        robot.keyTap(k);
    }
};
