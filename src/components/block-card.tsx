import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Edit } from "lucide-react-native";
import { memo, useState } from "react";
import { Pressable } from "react-native";
import { UIBlock } from "../types/ui";

export const BlockCard = memo(function BlockCard({
  block,
  drag,
  isActive,
  handleEditBlock,
}: {
  block: UIBlock;
  drag: () => void;
  isActive: boolean;
  handleEditBlock: (id: number | string) => void;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <Pressable
      onPressIn={() => setDragging(true)}
      onPressOut={() => setDragging(false)}
      onLongPress={drag}
      delayLongPress={200}
      onPress={() => handleEditBlock(block.id)}
    >
      <Card
        style={{
          opacity: dragging || isActive ? 0.7 : 1,
          transform: [{ scale: dragging || isActive ? 0.97 : 1 }],
          elevation: dragging || isActive ? 10 : 2,
          shadowOpacity: dragging || isActive ? 0.25 : 0.05,
        }}
      >
        <CardContent className="flex-row items-center justify-between">
          <Text>{block.name}</Text>
          <Icon as={Edit}></Icon>
        </CardContent>
      </Card>
    </Pressable>
  );
});
