const cls = require("./lib/class");
const http = require("http");
const WebSocket = require("websocket").server;
const url = require("url");
const Utils = require("./utils");
const _ = require("underscore");
const BISON = require("bison");
// const log = require("log");
const log = require("./logger");
const WS = {};
const useBison = false;

module.exports = WS;

const Server = cls.Class.extend({
  init: function (port) {
    this.port = port;
    this._connections = {};
    this._counter = 0;
  },

  onConnect: function (callback) {
    this.connection_callback = callback;
  },

  onError: function (callback) {
    this.error_callback = callback;
  },

  forEachConnection: function (callback) {
    _.each(this._connections, callback);
  },

  addConnection: function (connection) {
    this._connections[connection.id] = connection;
  },

  removeConnection: function (id) {
    delete this._connections[id];
  },

  getConnection: function (id) {
    return this._connections[id];
  },

  broadcast: function (message) {
    this.forEachConnection(function (connection) {
      connection.send(message);
    });
  },

  onRequestStatus: function (status_callback) {
    this.status_callback = status_callback;
  }
});

const Connection = cls.Class.extend({
  init: function (id, connection, server) {
    this._connection = connection;
    this._server = server;
    this.id = id;

    const self = this;

    this._connection.on("message", function (message) {
      if (self.listen_callback) {
        if (message.type === "utf8") {
          try {
            const data = useBison
              ? BISON.decode(message.utf8Data)
              : JSON.parse(message.utf8Data);
            self.listen_callback(data);
          } catch (e) {
            if (e instanceof SyntaxError) {
              self.close("Invalid JSON");
            } else {
              throw e;
            }
          }
        }
      }
    });

    this._connection.on("close", function () {
      if (self.close_callback) {
        self.close_callback();
      }
      self._server.removeConnection(self.id);
    });
  },

  onClose: function (callback) {
    this.close_callback = callback;
  },

  listen: function (callback) {
    this.listen_callback = callback;
  },

  send: function (message) {
    const data = useBison ? BISON.encode(message) : JSON.stringify(message);
    this._connection.sendUTF(data);
  },

  sendUTF8: function (data) {
    this._connection.sendUTF(data);
  },

  close: function (logError) {
    console.log(`Closing connection to ${this._connection.remoteAddress}. Error: ${logError}`);
    this._connection.close();
  }
});

WS.WebSocketServer = Server.extend({
  init: function (port) {
    this._super(port);
    const self = this;

    const httpServer = http.createServer(function (req, res) {
      const path = url.parse(req.url).pathname;
      if (path === "/status" && self.status_callback) {
        res.writeHead(200);
        res.write(self.status_callback());
      } else {
        res.writeHead(404);
      }
      res.end();
    });

    httpServer.listen(port, function () {
      log.info("Server is listening on port " + port);
    });

    const wsServer = new WebSocket({
      httpServer: httpServer,
      autoAcceptConnections: false
    });

    wsServer.on("request", function (request) {
      const connection = request.accept(null, request.origin);
      const id = self._createId();
      const c = new Connection(id, connection, self);
      if (self.connection_callback) {
        self.connection_callback(c);
      }
      self.addConnection(c);
    });
  },

  _createId: function () {
    return "5" + Utils.random(99) + "" + (this._counter++);
  }
});
