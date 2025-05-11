export const BOOTSTRAP_PEERS = [
  "/dns4/boot-01.do-ams3.status.prod.status.im/tcp/443/wss/p2p/16Uiu2HAmAR24Mbb6VuzoyUiGx42UenDkshENVDj4qnmmbabLvo31",
  "/dns4/boot-01.gc-us-central1-a.status.prod.status.im/tcp/443/wss/p2p/16Uiu2HAm8mUZ18tBWPXDQsaF7PbCKYA35z7WB2xNZH2EVq1qS8LJ",
  "/dns4/boot-01.ac-cn-hongkong-c.status.prod.status.im/tcp/443/wss/p2p/16Uiu2HAmGwcE8v7gmJNEWFtZtojYpPMTHy2jBLL6xRk33qgDxFWX",
];

export const CLUSTER_ID = 16;
export const SHARD_ID = 32;
export const PUBSUB_TOPIC = `/waku/2/rs/${CLUSTER_ID}/${SHARD_ID}`;
export const CONTENT_TOPIC = "/mul/1/chat/proto";