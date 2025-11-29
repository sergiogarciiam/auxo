import { Picker } from "@react-native-picker/picker";
import { Button } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "../components/themed-text";
import { SectionInterface } from "../types/section";

export default function NewSection() {
  const router = useRouter();
  const [section, setSection] = useState<SectionInterface>();

  const onSave = async () => {
    router.push({
      pathname: "/workout",
      params: { section: JSON.stringify(section) },
    });
  };

  return (
    <View style={styles.container}>
      <View>
        <ThemedText type="title">New Section</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter workout name"
          value={section?.name}
          onChangeText={(text: string) =>
            setSection({ ...section, name: text } as SectionInterface)
          }
        />
        <Picker
          selectedValue={section?.type}
          onValueChange={(value) =>
            setSection({ ...section, type: value } as SectionInterface)
          }
        >
          <Picker.Item label="Select a type" value="" />
          <Picker.Item label="Warm up" value="warmup" />
          <Picker.Item label="Cooldown" value="cooldown" />
        </Picker>
        <TextInput
          style={styles.input}
          placeholder="Enter rest time between exercises (seconds)"
          keyboardType="numeric"
          value={section?.rest_exercise?.toString()}
          onChangeText={(text: string) =>
            setSection({
              ...section,
              rest_exercise: parseInt(text, 10),
            } as SectionInterface)
          }
        />
        <TextInput
          style={styles.input}
          placeholder="Enter rest time between groups (seconds)"
          keyboardType="numeric"
          value={section?.rest_group?.toString()}
          onChangeText={(text: string) =>
            setSection({
              ...section,
              rest_group: parseInt(text, 10),
            } as SectionInterface)
          }
        />
      </View>
      <View style={styles.buttonRow}>
        <Button onPressIn={() => router.navigate("/homepage")}>Cancel</Button>
        <Button onPressIn={onSave}>Save</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
});
