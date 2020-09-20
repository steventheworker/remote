import {PythonShell} from 'python-shell';

const queue:CallbackArray[] = [];
const LAPSE_MS = 333;
const firstT = (new Date()).getTime();
let lastT = firstT,
    isProcessing = false;

function processQueue() {
    if (isProcessing) return;
    const t = (new Date()).getTime();
    const t0 = queue[0] ? queue[0][0] : 0;
    if (t - t0 < LAPSE_MS) {
        isProcessing = true;
        return setTimeout(function() {
            isProcessing = false;
            processQueue();
        }, LAPSE_MS - (t - t0));
    }
    //create the picture
    PythonShell.run('../../controls/screeny.py', {}, function (err) {
        if (err) throw err;
        queue.forEach(el => el[1] ? el[1]() : 0); //perform callbacks
        queue.splice(0, queue.length); //reset array(queue = []) but keeping const!!! ugh
        //debug helpers
        const t = (new Date()).getTime();
        console.log(((t-lastT)/1000)+'s\t-\tsince last pic');
        console.log(((t-firstT) / 1000)+'s\t-\tsince first pic');
        console.log('-------------------------------------');
        lastT = (new Date()).getTime();
    });
}


interface Callback { (): void }
type CallbackArray = [time: number, callback: Callback];

export function generatePic(callback?: Callback) {
    const t:number = (new Date()).getTime();
    queue.push([t, callback]);
    processQueue();
}
