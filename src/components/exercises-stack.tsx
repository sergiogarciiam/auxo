import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { UIExercise } from "../types/ui";
import { ExerciseCard } from "./exercise-card";
import { Sizes, Colors, Spacing } from "../constants/theme";

const { width } = Dimensions.get("window");

interface ExercisesStackProps {
  exercises: UIExercise[];
  onUpdateExercise: (
    exerciseId: string | number,
    data: Partial<UIExercise>,
  ) => void;
  onRemoveExercise: (exerciseId: string | number) => void;
}

const SWIPE_THRESHOLD = 50;
const CARD_HORIZONTAL_PADDING = 40;

/**
 * Stack-based card viewer for exercises with swipe navigation
 */
export function ExercisesStack({
  exercises,
  onUpdateExercise,
  onRemoveExercise,
}: ExercisesStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);

  const filteredExercises = exercises.filter(
    (ex) => ex.localStatus !== "deleted",
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            translateX.value,
            [-width, 0, width],
            [-width * 0.3, 0, width * 0.3],
            Extrapolate.CLAMP,
          ),
        },
      ],
      opacity: interpolate(
        translateX.value,
        [-width, 0, width],
        [0.5, 1, 0.5],
        Extrapolate.CLAMP,
      ),
    };
  });

  if (filteredExercises.length === 0) {
    return null;
  }

  const currentExercise = filteredExercises[currentIndex];

  const handleSwipe = (event: any): void => {
    const { translationX } = event.nativeEvent;

    if (translationX > SWIPE_THRESHOLD && currentIndex > 0) {
      // Swipe right - go to previous
      setCurrentIndex((prev) => prev - 1);
      translateX.value = 0;
    } else if (
      translationX < -SWIPE_THRESHOLD &&
      currentIndex < filteredExercises.length - 1
    ) {
      // Swipe left - go to next
      setCurrentIndex((prev) => prev + 1);
      translateX.value = 0;
    } else {
      // Snap back
      translateX.value = 0;
    }
  };

  const handleRemoveExercise = (): void => {
    onRemoveExercise(currentExercise.id);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler onEnded={handleSwipe}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <ExerciseCard
            key={currentExercise.id}
            exercise={currentExercise}
            index={currentExercise.id}
            setExercise={(exerciseId, ex) => {
              onUpdateExercise(exerciseId, ex);
            }}
            onRemoveExercise={handleRemoveExercise}
          />
        </Animated.View>
      </PanGestureHandler>

      {/* Exercise Indicator Dots */}
      <View style={styles.indicator}>
        <View style={styles.indicatorText}>
          {filteredExercises.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentIndex ? styles.dotActive : undefined,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.DOUBLE_EXTRA_LARGE,
  },
  card: {
    width: width - CARD_HORIZONTAL_PADDING,
    maxHeight: 600,
  },
  indicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.LARGE,
  },
  indicatorText: {
    flexDirection: "row",
    gap: Spacing.MEDIUM,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.INDICATOR_INACTIVE,
  },
  dotActive: {
    backgroundColor: Colors.PRIMARY,
    width: 24,
  },
});
