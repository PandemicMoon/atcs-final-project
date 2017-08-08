var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();
var debug = require('debug')('express-socketio-starter:server');
var http = require('http');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
{
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next)
{
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development')
{
    app.use(function(err, req, res, next)
    {
        res.status(err.status || 500);
        res.render('error',
        {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next)
{
    res.status(err.status || 500);
    res.render('error',
    {
        message: err.message,
        error:
        {}
    });
});

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Create Socket server.
 */

var clients = new Map();
var rooms = new Map();

function Client(room, name, id)
{
  this.room = room;
  this.name = name;
  this.id = id;
}

function ChatMessage(date, sender, text)
{
  this.date = date;
  this.sender = sender;
  this.text = text;
}

var io = require('socket.io')(server);

io.on('connection', function(client)
{
  client.on('disconnect', function()
  {
    clients.delete(client);
  });

  client.on('newMessage', function(message)
  {
    var room = clients.get(client).room;
    var chatMessage = new ChatMessage(new Date(), { name: clients.get(client).name, id: clients.get(client).id }, message);
    rooms.get(room).push(chatMessage);
    io.in(room).emit('newMessage', chatMessage);
  });

  client.emit('getValues', function(room, name, id) {
    client.join(room);
    clients.set(client, new Client(room, name, id));
    if (!rooms.has(room))
    {
      rooms.set(room, []);
    }
    client.emit('loadMessages', rooms.get(room));
  });
});

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val)
{
    var port = parseInt(val, 10);

    if (isNaN(port))
    {
        // named pipe
        return val;
    }

    if (port >= 0)
    {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error)
{
    if (error.syscall !== 'listen')
    {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code)
    {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening()
{
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    debug('Listening on ' + bind);
}

module.exports = app;
