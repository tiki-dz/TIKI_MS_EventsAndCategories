const amqp = require('amqplib/callback_api')
const { MESSAGE_BROKER_URL, EXCHANGE_NAME } = require('../config/config.js')
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
      channel.assertQueue(EXCHANGE_NAME, {
        durable: false
      })
      console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', EXCHANGE_NAME)
      channel.consume(EXCHANGE_NAME, function (msg) {
        console.log(' [x] Received %s', msg.content.toString())
      },
      {
        // automatic acknowledgment mode,
        noAck: true
      })
    })
  })
}
