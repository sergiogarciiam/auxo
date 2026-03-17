import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Play } from "lucide-react-native";
import { memo, useState } from "react";
import { Pressable } from "react-native";

export const WorkoutCard = memo(function WorkoutCard({
  workout,
  drag,
  isActive,
  handleEditWorkout,
  handleStartWorkout,
}: {
  workout: any;
  drag: () => void;
  isActive: boolean;
  handleEditWorkout: (id: number) => void;
  handleStartWorkout: (id: number) => void;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <Pressable
      onPressIn={() => setDragging(true)}
      onPressOut={() => setDragging(false)}
      onLongPress={drag} // drag real
      delayLongPress={200}
      onPress={() => handleEditWorkout(workout.id)}
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
          <Text>{workout.name}</Text>
          <Button
            variant="outline"
            size="icon"
            onPress={(e) => {
              e.stopPropagation();
              handleStartWorkout(workout.id);
            }}
          >
            <Icon as={Play} />
          </Button>
        </CardContent>
      </Card>
    </Pressable>
  );
});
