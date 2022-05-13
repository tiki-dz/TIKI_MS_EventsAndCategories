/* ----------------------- Message broker ----------------------- */

const amqp = require('amqplib/callback_api')
// const { MESSAGE_BROKER_URL, EXCHANGE_NAME } = require('../config/config.js')
const { MESSAGE_BROKER_URL } = require('../config/config.js')
module.exports.CreatChannel1 = () => {
  amqp.connect(MESSAGE_BROKER_URL, function (error0, connection) {
    if (error0) {
      throw error0
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1
      }
      // This makes sure the queue is declared before attempting to consume from it
      // channel.assertQueue(EXCHANGE_NAME, {
      //   durable: false
      // })
      const exchange = 'logs'
      channel.assertExchange(exchange, 'fanout', {
        durable: false
      })
      channel.assertQueue('', {
        exclusive: true
      }, function (error2, q) {
        if (error2) {
          throw error2
        }
        console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q.queue)
        channel.bindQueue(q.queue, exchange, '')

        channel.consume(q.queue, function (msg) {
          if (msg.content) {
            console.log(' [x] %s', msg.content.toString())
          }
        }, {
          noAck: true
        })
      })
    //     // Don't dispatch a new message to a worker until it has processed and acknowledged the previous one. Instead, it will dispatch it to the next worker that is not still busy.
    //     channel.prefetch(1)
    //     console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', EXCHANGE_NAME)
    //     channel.consume(EXCHANGE_NAME, function (msg) {
    //       console.log(' [x] Received %s', msg.content.toString())
    //     },
    //     {
    //       // automatic acknowledgment mode,
    //       // false = the worker will send ack in the end of prossesing
    //       noAck: false
    //     })
    //   })
    // })
    })
  })
}
