const { PubSub } = require('@google-cloud/pubsub');

// A No-Op class that mirrors the PubSub client but does nothing.
class NoOpPubSub {
  topic(name) {
    return new NoOpTopic(name);
  }
}

class NoOpTopic {
  constructor(name) {
    this.name = name;
  }
  publish(data) {
    console.log(`[PubSub STUB] Publishing to ${this.name}:`, data.toString('utf-8'));
    return Promise.resolve();
  }
}

// Export a real client only if the project ID is set, otherwise export the No-Op stub.
let pubsubClient;
if (process.env.GOOGLE_PUB_SUB_PROJECT_ID) {
  pubsubClient = new PubSub({ projectId: process.env.GOOGLE_PUB_SUB_PROJECT_ID });
} else {
  console.info('[PubSub] Google Pub/Sub is disabled – GOOGLE_PUB_SUB_PROJECT_ID is not set.');
  pubsubClient = new NoOpPubSub();
}

module.exports = pubsubClient;