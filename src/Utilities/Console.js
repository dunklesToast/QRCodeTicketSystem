require('colors');
const host = require('os').hostname;

module.exports = (name) => {
    let module = {};
    name = name || "unknown";
    module.log = function (msg) {
        process.stdout.write(`${getDate()} [${host}] [${name}] [i] ${msg} \n`.green);
    };
    module.success = function (msg) {
        process.stdout.write(`${getDate()} [${host}] [${name}] [✓] ${msg} \n`.green);
    };
    module.error = function (msg) {
        process.stderr.write(`${getDate()} [${host}] [${name}] [⚠] ${msg} \n`.red);
    };
    module.debug = function (msg) {
        const args = process.argv.slice(2);
        if (args.includes('-d') || args.includes('--debug')) {
            process.stdout.write(`${getDate()} [${host}] [${name}] [dbg] ${msg} \n`.blue);
        }
    };
    return module;
};


function getDate() {
    const d = new Date();
    return `[${('0' + d.getDate()).toString().substr(-2)}.${('0' + (d.getMonth() + 1)).toString().substr(-2)}.${d.getFullYear()} / ${('0' + d.getHours()).toString().substr(-2)}:${('0' + d.getMinutes()).toString().substr(-2)}:${('0' + d.getSeconds()).toString().substr(-2)}]`
}