process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log(`Uncaught Exception🔥 Shutting down...`);
  process.exit(1);
});

const app = require('./app');

const port = process.env.PORT || 5000;
const server = app.listen(port, () =>
  console.log(
    `Server started in ${process.env.NODE_ENV} mode on port ${port}...`
  )
);

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection🔥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
