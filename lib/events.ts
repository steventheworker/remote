import {PythonShell} from 'python-shell';
import {generatePic} from './generatePic';

generatePic();
interface Events {
    [index: string]: {(...a: any[]): any} | string;
    init: { (user: User, ...data: any): void },
    es: { (user: User, es: string, ...data: any): void }
}
const events:Events = {
    init: function(user, event) {
        generatePic(() => {
            user.send('r');
        });
    },
    es: function(user, data) {
        PythonShell.run('../../controls/es.py', {
            args: [data]
        }, function (err, results) {
            if (err) {const fs = require('fs');fs.writeFileSync('es.txt', err + '|||' + results);}
            generatePic(() => {
                user.send('r');
            });
        });
    }
};
export default events;