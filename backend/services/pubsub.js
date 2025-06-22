const { PubSub } = require('@google-cloud/pubsub');

let pubsub;

if (process.env.GOOGLE_PUB_SUB_PROJECT_ID) {
  pubsub = new PubSub({
    projectId: process.env.GOOGLE_PUB_SUB_PROJECT_ID,
  });
}

module.exports = pubsub;