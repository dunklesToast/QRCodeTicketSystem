const console = require('./Console')('Server');
const Database = require('./MySQL');
const config = require('../config.json');
const httpApp = require('http').createServer(function (req, res) {
        if (config.behavior.EnableFrontEnd) {
            if (req.method === 'POST') {
                console.debug("POST Request to Server");
                let body = '';
                req.on('data', function (data) {
                    body += data;
                    console.debug("Partial body: " + body);
                });
                req.on('end', function () {
                    if (body.split('=')[0] === "name") {
                        Database.addTicket({
                            name: body.split('=')[1].replace('+', ' ')
                        }).then((qr) => {
                            res.writeHead(200);
                            const html = '<html><body style="text-align: center"><h1>Your Ticket has been created!</h1><p>Please print this image and take it with you. It is your ticket</p><br><img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + config.prefix + qr + '"/><p>You will not be able to view this Ticket online again!</p></body></html>';
                            res.end(html);
                        }).catch((err) => {
                            const html = '<html><body style="text-align: center"><h1 style="color: red;">Your Ticket has not been created!</h1><p>Sorry. There was an eror while we performed your request. Please try again later</p></body></html>';

                        });
                    } else {
                        res.writeHead(400, {'Content-Type': 'text/html'});
                        res.end('Missing Name');
                    }
                })
            }
            else {
                console.debug("GET Request to Server");
                const html = '<html><body><form method="post" action="/">Name:<input name="name" /><input type="submit" value="Submit"/></form></body>';
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(html);
            }
        }else {
            res.end();
        }
    }
);

const io = require('socket.io').listen(httpApp);

io.on('connection', (socket) => {
    console.debug('Connection!');
    socket.on('start', (msg) => {
        if (msg.name) {
            console.log(msg.name + ' connected!');
        } else {
            socket.emit('refused', 'Name is missing');
            socket.disconnect();
        }
    });
    socket.on('scan', (msg) => {
        if (msg.id) {
            Database.checkTicket(msg.id).then((result) => {
                if(result[0]){
                    socket.emit('validTicket', result[0].NAME);
                }else {
                    socket.emit('validTicket', false);
                }
            }).catch((err) => {
                console.debug(err);
                socket.emit('validTicket', false);
            })
        }
    })
});

httpApp.listen(8002);
