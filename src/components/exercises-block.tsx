import { Text } from "@/components/ui/text";
import React, { useEffect, useRef } from "react";
import { FlatList, View } from "react-native";
import { UIExercise } from "../types/ui";
import { ExerciseCard } from "./exercise-card";

interface Props {
  exercises: UIExercise[];
  blockId: string;

  updateExercise: (
    blockId: string,
    exerciseId: string,
    data: Partial<UIExercise>,
  ) => void;

  handleDeleteExercise: (exerciseId: string) => void;

  onMovePrev: (index: number) => void;
  onMoveNext: (index: number) => void;
}

export function ExercisesBlock({
  exercises,
  blockId,
  updateExercise,
  handleDeleteExercise,
  onMovePrev,
  onMoveNext,
}: Props) {
  const listRef = useRef<FlatList>(null);
  const prevLengthRef = useRef(exercises.length);
  const lastRemovedIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const prevLength = prevLengthRef.current;

    if (exercises.length > prevLength) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({
          index: exercises.length - 1,
          animated: true,
          viewPosition: 0.5,
        });
      });
    }

    if (exercises.length < prevLength && lastRemovedIndexRef.current !== null) {
      const targetIndex = Math.min(
        lastRemovedIndexRef.current,
        exercises.length - 1,
      );

      if (targetIndex >= 0) {
        requestAnimationFrame(() => {
          listRef.current?.scrollToIndex({
            index: targetIndex,
            animated: true,
            viewPosition: 0.5,
          });
        });
      }

      lastRemovedIndexRef.current = null;
    }

    prevLengthRef.current = exercises.length;
  }, [exercises.length]);

  const handleUpdate = (exerciseId: string, data: Partial<UIExercise>) => {
    updateExercise(blockId, exerciseId, data);
  };

  const handleRemove = (index: number, exerciseId: string) => {
    lastRemovedIndexRef.current = index;
    handleDeleteExercise(exerciseId);
  };

  return (
    <FlatList
      ref={listRef}
      data={exercises}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 12 }}
      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      ListEmptyComponent={
        <Text className="mt-4 text-center text-gray-400">No exercises yet</Text>
      }
      renderItem={({ item, index }) => (
        <ExerciseCard
          exercise={item}
          exerciseId={item.id}
          index={index}
          setExercise={handleUpdate}
          onRemoveExercise={() => handleRemove(index, item.id)}
          handleMovePrev={(i) => {
            onMovePrev(i);

            requestAnimationFrame(() => {
              listRef.current?.scrollToIndex({
                index: i - 1,
                animated: true,
                viewPosition: 0.5,
              });
            });
          }}
          handleMoveNext={(i) => {
            onMoveNext(i);

            requestAnimationFrame(() => {
              listRef.current?.scrollToIndex({
                index: i + 1,
                animated: true,
                viewPosition: 0.5,
              });
            });
          }}
          isDisabledPrev={index === 0}
          isDisabledNext={index === exercises.length - 1}
        />
      )}
      getItemLayout={(_, index) => ({
        length: 340,
        offset: 340 * index,
        index,
      })}
    />
  );
}
