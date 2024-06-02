const userNames = (function () {
  const names = {};

  const claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };

  const get = function () {
    return Object.keys(names);
  };

  const free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim,
    free,
    get
  };
})();

module.exports = function (socket) {
  socket.on('init', function (data) {
    const name = data.name;

    if (userNames.claim(name)) {
      socket.emit('init', {
        name: name,
        users: userNames.get()
      });

      socket.broadcast.emit('user:join', {
        name: name
      });
    } else {
      socket.emit('init', {
        error: 'Username already taken'
      });
    }
  });

  socket.on('send:message', function (data) {
    data.timestamp = new Date().toISOString();
    socket.broadcast.emit('send:message', {
      user: data.user,
      text: data.text,
      timestamp: data.timestamp
    });
  });

  socket.on('change:name', function (data, fn) {
    if (userNames.claim(data.name)) {
      const oldName = data.oldName;
      userNames.free(oldName);

      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: data.name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  socket.on('disconnect', function () {
    const name = socket.username;
    if (name) {
      socket.broadcast.emit('user:left', {
        name: name
      });
      userNames.free(name);
    }
  });
};
