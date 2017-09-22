const console = require('./Utilities/Console')('MainThread');

require('./Utilities/MySQL').connect().then((db) => {
    console.success('Connected to MySQL Database : ' + db);
    require('./Utilities/server');
}).catch((err) => {
    console.error('Cannot start TicketScanServer!');
    console.debug(err);
    process.exit();
});