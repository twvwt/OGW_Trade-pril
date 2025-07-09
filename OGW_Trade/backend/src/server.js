const app = require('./app');
const http = require('http');
const { notifyAdminAboutNewOrder } = require('./services/telegram.service');

const port = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  
  // Test notification
  if (process.env.NODE_ENV === 'development') {
    notifyAdminAboutNewOrder('64d5a9a8e4b3d3a7f0e3b5a9')
      .then(() => console.log('Test notification sent'))
      .catch(console.error);
  }
});