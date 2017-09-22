const mysql = require('mysql');
const console = require('./Console')('MySQL Bridge');
const uuid = require('uuid').v4;
//https://github.com/mysqljs/mysql#connection-options
let config;
try {
    config = require('../config.json');
} catch (err) {
    console.error('Cannot read Config File.');
    console.debug(err);
    process.exit();
}
let connection;
module.exports = {
    connect: () => {
        return new Promise((resolve, reject) => {
            connection = mysql.createConnection(config.mysql);
            connection.connect((err) => {
                if (err) reject(err);
                else {
                    connection.query('CREATE TABLE IF NOT EXISTS `ticket`.`tickets` ( `ID` VARCHAR(36) NOT NULL , `NAME` VARCHAR(200) NOT NULL , `BOOKED` DATE NOT NULL ) ENGINE = InnoDB;', (err) => {
                        if (err) reject(err);
                        else resolve(`${config.user}@${config.host}`)
                    })
                }
            })
        })
    },
    checkTicket: (ticket) => {
        return new Promise((resolve, reject) => {
            if (ticket) {
                if (ticket.id) {
                    connection.query('SELECT * FROM tickets WHERE id=' + connection.escape(ticket.id), (err, result) => {
                        if (err) reject(err);
                        else {
                            resolve(result);
                            if (config.behavior.OneTimeTicket) {
                                module.exports.invalidateTicket(ticket).catch((err) => {
                                    console.error('Cannot invalidate Ticket: ' + ticket.id);
                                    console.debug(err);
                                })
                            }
                        }
                    });
                } else {
                    reject(new Error('Missing Variables'));
                }
            } else {
                reject(new Error('Missing Variables'));
            }
        })
    },
    invalidateTicket: (ticket) => {
        return new Promise((resolve, reject) => {
            if (ticket) {
                if (ticket.id) {
                    connection.query('UPDATE `tickets` SET `VALID`=0 WHERE id=' + connection.escape(ticket.id), (err) => {
                        if (err) reject(err);
                        else {
                            resolve();
                        }
                    });
                } else {
                    reject(new Error('Missing Variables'));
                }
            } else {
                reject(new Error('Missing Variables'));
            }
        })
    },
    addTicket: (data) => {
        return new Promise((resolve, reject) => {
            const ticket = uuid();
            if (data.name) {
                connection.query('INSERT INTO `tickets`(`ID`, `NAME`, `BOOKED`) VALUES (' + connection.escape(ticket) + ',"' + data.name + '",CURRENT_DATE())', function (err) {
                    if (err) reject(err);
                    else {
                        resolve(ticket);
                    }
                })
            } else {
                reject('No Name given.')
            }
        })
    }
};