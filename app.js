"use strict";

/**
 * Module dependencies.
 */

var express = require("express");
// const session = require('express-session');
var http = require("http");
var socket = require("./routes/socket.js");

var app = express();
var server = http.createServer(app);

const mysql = require("mysql");

app.use(express.json()); // Add this line
app.use(express.urlencoded({ extended: false }));

const con = mysql.createConnection({
  host: "localhost",
  user: "space",
  password: "12345678",
  database: "chatdb",
});

con.connect((err) => {
  if (err) throw err;
  else console.log("Connect to database");
});

app.post("/join", (req, res) => {
  const { username, password } = req.body;
  console.log("Join request received:", { username, password });
  con.query(
    "INSERT INTO User (username, password) VALUES(?, ?)",
    [username, password],
    (error, result) => {
      if (error) res.json({ success: false });
      else res.json({ success: true });
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Join request received:", { username, password });
  con.query(
    "SELECT * FROM User WHERE username = ? AND password = ?",
    [username, password],
    (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        //req.session.username = username;
        // req.session.room = room;
        res.json({ success: true, message: "Login successful" });
      } else {
        res.json({ success: false, message: "Invalid username or password" });
      }
    }
  );
});

app.post("/chatLobby", (req, res) => {
  const { roomName } = req.body;
  console.log("Join request received:", { roomName });
  con.query(
    "SELECT * FROM Room WHERE room = ?",
    [roomName],
    (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        res.json({ success: true, message: "already" });
      } else {
        res.json({ success: false, message: "nothing" });
      }
    }
  );
});

app.post("/LobbyCreate", (req, res) => {
  const { roomName } = req.body;
  console.log("Join request received:", { roomName });
  con.query(
    "INSERT INTO Room (room) VALUES(?)",
    [roomName],
    (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        res.json({ success: true, message: "already" });
      }
    }
  );
});

// app.post("/chatRoom", (req, res) => {
//   const { user, room, text } = req.body.message;
//   console.log("Join request received:", { user, room, text });
//   con.query(
//     "INSERT INTO Chat (user, room, text, timestamp) VALUES(?, ?, ?, NOW())",
//     [user, room, text],
//     (error, result) => {
//       if (error) throw error;
//       res.json({ success: true });
//     }
//   );
// });

app.post("/chatRoom", (req, res) => {
  const { user, room, text } = req.body.message;
  console.log("Join request received:", { user, room, text });
  con.query(
    "INSERT INTO Chat (user, room, text, timestamp) VALUES(?, ?, ?, NOW())",
    [user, room, text],
    (error, result) => {
      if (error) {
        res.json({ success: false });
        throw error;
      } else {
        con.query(
          "SELECT * FROM Chat WHERE chatid = ?",
          [result.insertId],
          (error, results) => {
            if (error) throw error;
            res.json({ success: true, message: results[0] });
          }
        );
      }
    }
  );
});

app.post("/pastChat", (req, res) => {
  const { currentUser, roomName } = req.body;
  console.log("Join request received:", { currentUser, roomName });
  con.query(
    "SELECT * FROM Chat WHERE room = ?  ORDER BY timestamp ASC",
    [roomName],
    (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        res.json({ success: true, message: "already", data: results });
      } else {
        res.json({ success: false, message: "nothing" });
      }
    }
  );
});

/* Configuration */
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
app.set("port", 3000);

if (process.env.NODE_ENV === "development") {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

/* Socket.io Communication */
var io = require("socket.io").listen(server);
io.sockets.on("connection", socket);

/* Start server */
server.listen(app.get("port"), function () {
  console.log(
    "Express server listening on port %d in %s mode",
    app.get("port"),
    app.get("env")
  );
});

module.exports = app;
