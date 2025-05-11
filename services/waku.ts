import { createLightNode, Protocols } from "@waku/sdk";
import type { IDecodedMessage, IDecoder, IEncoder, LightNode } from "@waku/interfaces";
import { wakuPeerExchangeDiscovery } from "@waku/discovery"

import { BOOTSTRAP_PEERS, PUBSUB_TOPIC, CLUSTER_ID, SHARD_ID, CONTENT_TOPIC } from "../constants";
import { NativeEventEmitter } from 'react-native';

export interface IWaku {
  events: NativeEventEmitter;
  start(): Promise<void>;
  stop(): Promise<void>;
  send(payload: Uint8Array): Promise<void>;
}

const MESSAGE_EVENT = "message";

export class Waku implements IWaku {
  private static instance: Waku;

  // needed to cover case when Client.create run multiple times
  private static promise: Promise<Waku>;

  public static async create(): Promise<Waku> {
    const run = async (): Promise<Waku> => {
      let node: LightNode | undefined = undefined;

      try {
        node = await createLightNode({
          defaultBootstrap: false,
          networkConfig: {
            clusterId: CLUSTER_ID,
            shards: [SHARD_ID]
          },
          bootstrapPeers: BOOTSTRAP_PEERS,
          libp2p: {
            peerDiscovery: [
              wakuPeerExchangeDiscovery([PUBSUB_TOPIC])
            ],
          }
        });

        // expose for debugging purposes
        (window as any)["waku"] = node;

        await node.waitForPeers(
          [Protocols.Filter, Protocols.LightPush],
          60 * 1000 // one minute
        );
      } catch(e) {
        console.error("Failed to create Waku instance:", e);
        throw e;
      }

      Waku.instance = new Waku(node);

      await Waku.instance.start();

      return Waku.instance;
    };

    if (!Waku.promise) {
      Waku.promise = run();
    }

    return Waku.promise;
  }

  private readonly node: LightNode;
  private readonly encoder: IEncoder;
  private readonly decoder: IDecoder<IDecodedMessage>;

  private unsubscribe?: () => void;

  public readonly events = new NativeEventEmitter();

  public constructor(node: LightNode) {
    this.node = node;

    this.encoder = node.createEncoder({
      contentTopic: CONTENT_TOPIC,
      ephemeral: true,
      shardInfo: {
        clusterId: CLUSTER_ID,
        shard: SHARD_ID,
      },
    });

    this.decoder = node.createDecoder({
      contentTopic: CONTENT_TOPIC,
      shardInfo: {
        clusterId: CLUSTER_ID,
        shard: SHARD_ID,
      }
    });
  }

  public async start(): Promise<void> {
    this.unsubscribe = await this.node.filter.subscribeWithUnsubscribe(this.decoder, this.onMessage.bind(this));
  }

  public async stop(): Promise<void> {
    if (this.unsubscribe) {
      await this.unsubscribe();
      this.unsubscribe = undefined;
    }

    await this.node.stop();
  }

  public async send(payload: Uint8Array): Promise<void> {
    await this.node.lightPush.send(this.encoder, {
      payload,
    });
  }

  private async onMessage(data: IDecodedMessage): Promise<void> {
    this.events.emit(MESSAGE_EVENT, { data: data.payload });
  }
}
