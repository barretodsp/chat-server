module.exports = function (io) {
  io.on('connection', function (socket) {
    console.log('IN A CONSUMER');

    socket.on('hello_medical', function (name) {
      console.log('SID - HELLO-MEDICAL', socket.id);
      socket.name = name
    });
  });
};

