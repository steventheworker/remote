import {PythonShell} from 'python-shell';

const queue:CallbackArray[] = [];
const LAPSE_MS = 333;
let lastT = 0,
    isProcessing = false;

function processQueue() {
    if (isProcessing) return;
    const t = (new Date()).getTime();
    const firstT = queue[0] ? queue[0][0] : 0;
    if (t - firstT < LAPSE_MS) {
        isProcessing = true;
        return setTimeout(function() {
            isProcessing = false;
            processQueue();
        }, LAPSE_MS - (t - firstT));
    }
    //create the picture
    PythonShell.run('../../controls/screeny.py', {}, function (err) {
        if (err) throw err;
        console.log((((new Date()).getTime()-lastT)/1000)+'\t-\tgenerated a picture!!!')
        lastT = (new Date()).getTime();
        queue.forEach(el => el[1] ? el[1]() : 0); //perform callbacks
        queue.splice(0, queue.length); //reset array(queue = []) but keeping const!!! ugh
    });
}


interface Callback { (): void }
type CallbackArray = [time: number, callback: Callback];

export function generatePic(callback?: Callback) {
    const t:number = (new Date()).getTime();
    queue.push([t, callback]);
    processQueue();
}
