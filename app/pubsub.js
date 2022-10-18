// const redis = require('redis');

// const CHANNELS = {
//   TEST: 'TEST'
// };

// class PubSub {
//   constructor() {
//     this.publisher = redis.createClient();
//     this.subscriber = redis.createClient();

//     this.subscriber.subscribe(CHANNELS.TEST);

//     this.subscriber.on(
//       'message',
//       (channel, message) => this.handleMessage(channel, message)
//     );
//   }

//   handleMessage(channel, message) {
//     console.log(`Message received. Channel: ${channel}. Message: ${message}`);
//   }
// }

// const testPubSub = new PubSub();

// setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST, 'foo'), 1000);





// const PubNub = require('pubnub');
// const credentials = {
//   publishKey: 'pub-c-cecc76a9-a9a8-4448-8c3f-3464c116fc33',
//   subscribekey: 'sub-c-c360f9ad-4af5-4ed8-bce0-8a184c13a51f',
//   secretKey: 'sec-c-MGIxNDk1ZTItMGYxYS00YWRmLWE0N2YtNDA5OGRmMjRkNTZk'
// };

// const CHANNELS = {
//     TEST: 'TEST'
//   };

// class PubSub {
//     constructor() {
     
//       this.pubnub = new PubNub(credentials);
  
//       this.pubnub.subscribe({ channels: Object.values(CHANNELS) });
  
//       this.pubnub.addListener(this.listener());
//     }

//     listener() {
//         return {
//             message: messageObject => {
//                 const { channel , message } = messageObject;

//                 console.log(`Message received. Channel: ${channel}. Message; ${message}`);
//             }
//         };
//     }
//     publish({ channel, message }) {
//         this.pubnub.publish({ channel, message });
//       }
//     }
//     const testPubSub = new PubSub();
//     testPubSub.publish({ channel: CHANNELS.TEST, message: 'hello pubnub' });
//     module.exports = PubSub;



// const redis = require('redis');
// const PubNub = require('pubnub');

// const credentials = {
//   publishKey: 'pub-c-cecc76a9-a9a8-4448-8c3f-3464c116fc33',
//   subscribeKey: 'sub-c-c360f9ad-4af5-4ed8-bce0-8a184c13a51f',
//   secretKey: 'sec-c-MGIxNDk1ZTItMGYxYS00YWRmLWE0N2YtNDA5OGRmMjRkNTZk'
// };

// const CHANNELS = {
//   TEST: 'TEST',
//   BLOCKCHAIN: 'BLOCKCHAIN'
// };

// class PubSub {
//   constructor() {
//     // this.publisher = redis.createClient();
//     // this.subscriber = redis.createClient();
//     this.pubnub = new PubNub(credentials);

//     this.pubnub.subscribe({ channels: Object.values(CHANNELS) });

//     this.pubnub.addListener(this.listener());
//   }

//     // this.subscriber.subscribe(CHANNELS.TEST);
//   listener() {
//     return {
//       message: messageObject => {
//         const { channel, message } = messageObject;

//     // this.subscriber.on(
//     //   'message',
//     //   (channel, message) => this.handleMessage(channel, message)
//     // );
//         console.log(`Message received. Channel: ${channel}. Message; ${message}`);
//       }
//     };
//   }

// //   handleMessage(channel, message) {
// //     console.log(`Message received. Channel: ${channel}. Message: ${message}`);
//   publish({ channel, message }) {
//     this.pubnub.publish({ channel, message });
//   }
// }

// // const testPubSub = new PubSub();
// // testPubSub.publish({ channel: CHANNELS.TEST, message: 'hello pubnub' });

// // setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST, 'foo'), 1000);
// module.exports = PubSub;


const PubNub = require('pubnub');

const credentials = {
  publishKey: 'pub-c-cecc76a9-a9a8-4448-8c3f-3464c116fc33',
  subscribeKey: 'sub-c-c360f9ad-4af5-4ed8-bce0-8a184c13a51f',
  secretKey: 'sec-c-MGIxNDk1ZTItMGYxYS00YWRmLWE0N2YtNDA5OGRmMjRkNTZk'
};

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

class PubSub {
  constructor({ blockchain, transactionPool }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;

    this.pubnub = new PubNub(credentials);
    this.pubnub.subscribe({ channels: Object.values(CHANNELS) });
    this.pubnub.addListener(this.listener());
  }

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}. Message: ${message}`);

    const parsedMessage = JSON.parse(message);

    switch(channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage, true, () => {
          this.transactionPool.clearBlockchainTransactions({
             chain: parsedMessage
          });
        });
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage);
        break;
      default:
        return;
    }
  }


  listener() {
    return {
      message: messageObject => {
        const { channel, message } = messageObject;

        this.handleMessage(channel, message);
      }
    };
  }

  // publish({ channel, message}) {
  //   this.pubnub.publish({ channel, message });
  // }

  publish({ channel, message}) {
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    })
  }
}

module.exports = PubSub;