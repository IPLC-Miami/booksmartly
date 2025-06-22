const { PubSub } = require('@google-cloud/pubsub');

let pubsub;

if (process.env.GOOGLE_PUB_SUB_PROJECT_ID) {
  pubsub = new PubSub({
    projectId: process.env.GOOGLE_PUB_SUB_PROJECT_ID,
  });
} else {
  console.info('[PubSub] Google Pub/Sub disabled – env var missing');
  pubsub = {
    topic: () => ({
      publish: () => Promise.resolve(),
    }),
    publish: () => Promise.resolve(),
  };
}

if (!pubsub.topicName) {
  pubsub.topicName = 'getUpdatedEmployee';
}


module.exports = pubsub;