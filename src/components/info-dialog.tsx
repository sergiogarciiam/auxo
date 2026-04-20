import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Row({ children }: { children: React.ReactNode }) {
  return <View className="flex-row w-full gap-2 mb-3">{children}</View>;
}

export function InfoDialog({ open, onOpenChange }: InfoDialogProps) {
  const insets = useSafeAreaInsets();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[80vh] w-full"
        style={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 12,
        }}
      >
        <DialogHeader>
          <DialogTitle>Block Types</DialogTitle>
        </DialogHeader>

        <ScrollView className="mt-2">
          <Row>
            <Text>🔥</Text>
            <Text style={{ flexShrink: 1 }}>
              <Text className="font-bold">Warm Up:</Text> Short preparation
              before training to get your body ready and reduce injury risk.
            </Text>
          </Row>

          <Row>
            <Text>🧊</Text>
            <Text style={{ flexShrink: 1 }}>
              <Text className="font-bold">Cooldown:</Text> Helps your body
              recover and return to normal after training.
            </Text>
          </Row>

          <Row>
            <Text>🏋️</Text>
            <Text style={{ flexShrink: 1 }}>
              <Text className="font-bold">Standard:</Text> Do each exercise one
              by one with rest between sets.
            </Text>
          </Row>

          <Row>
            <Text>⚡</Text>
            <Text style={{ flexShrink: 1 }}>
              <Text className="font-bold">Superset:</Text> Alternate between two
              exercises with minimal rest.
            </Text>
          </Row>

          <Row>
            <Text>🔁</Text>
            <Text style={{ flexShrink: 1 }}>
              <Text className="font-bold">Circuit:</Text> Do several exercises
              in a row, then repeat the full round.
            </Text>
          </Row>

          <Row>
            <Text>🎯</Text>
            <Text style={{ flexShrink: 1 }}>
              <Text className="font-bold">Flexible:</Text> You choose exercises
              during the workout instead of a fixed order.
            </Text>
          </Row>
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
}
