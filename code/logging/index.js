const { createLogger, format, transports, config } = require('winston');
const Logsene = require('winston-logsene');
const { combine, timestamp, json, errors } = format;

const logger = createLogger({
    levels: config.npm.levels,
    format: format.simple(),
    //format: format.json(),
    //format: combine(errors(), timestamp(), json()),
    transports: [
      new transports.Console(), // You can remove this line if you do not want logging in the console. 
      new Logsene({
        token: '',
        level: 'debug',
        type: 'app_logs',
        url: 'https://logsene-receiver.eu.sematext.com'
      }
    )]
  });

let obect_to_log = {
    name: 'John Doe',
    age: 30,
    city: 'New York'
};

let error_to_log = new Error('This is an error message');


// Bad logs
logger.debug('debug');
logger.info('faszom');
logger.warn('finished at: ' + Date.now());
logger.error(error_to_log);
logger.log('info', 'log');

// Good logs
const childLogger = logger.child({ 
  correlationId: '123e4567-e89b-12d3-a456-426655440000', 
  context: 'User' 
});

childLogger.info('File uploaded successfully', {
  file: 'something.png',
  type: 'image/png',
  userId: 'jdn33d8h2',
});

childLogger.error('File upload failed: ', new Error('File too large'));
