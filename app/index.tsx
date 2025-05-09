import "event-target-polyfill";

import { Text, View } from "react-native";
import { createLightNode } from "@waku/sdk";

export default function Index() {
  createLightNode({});

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
