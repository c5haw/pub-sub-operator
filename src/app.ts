import Watcher from './watcher'
import { PubSub } from './pubsub'
import { TopicHandler, SubscriptionHandler, Handler } from './handler'
import logger from './logger'

const SUPPORTED_RESOURCES = {
  TOPICS: 'pubsubtopics',
  SUBSCRIPTIONS: 'pubsubsubscriptions',
};
const LOGGER = logger({ name: 'pubsub:app' })

export class App {
  private readonly watcher: Watcher
  public readonly client: PubSub
  public readonly handler: Handler

  constructor(
    public readonly group: string,
    public readonly version: string,
    public readonly resource: string,
    kubeConfig: any,
    pubSubConfig: any,
    namespace: string,
  ) {
    this.watcher = new Watcher(kubeConfig, namespace)
    this.client = new PubSub(pubSubConfig)
    switch (resource) {
      case SUPPORTED_RESOURCES.TOPICS:
        this.handler = new TopicHandler(this.client)
        break
      case SUPPORTED_RESOURCES.SUBSCRIPTIONS:
        this.handler = new SubscriptionHandler(this.client)
        break
      default:
        throw new Error('The resource ' + resource + ' is not one of the supported resources')
    }
  }

  public async main() {
    try {
      await this.watcher.start(this.group, this.version, this.resource, this.handler)
    } catch (err) {
      LOGGER.error(err, 'Fatal error')
      process.exit(1)
    }
  }
}