import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useRef } from "react";
import { Todo } from "@/types/interfaces";
import { Link, router } from "expo-router";
import { Colors } from "@/constants/Colors";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useMMKVString } from "react-native-mmkv";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface TaskRowProps {
  task: Todo;
}

function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
  const hasReachedThresholdUp = useSharedValue(false);
  const hasReachedThresholdDown = useSharedValue(false);

  useAnimatedReaction(
    () => drag.value,
    (dragValue) => {
      if (Math.abs(dragValue) > 100 && !hasReachedThresholdUp.value) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        hasReachedThresholdUp.value = true;
        hasReachedThresholdDown.value = false;
      } else if (Math.abs(dragValue) < 100 && !hasReachedThresholdDown.value) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        hasReachedThresholdUp.value = false;
        hasReachedThresholdDown.value = true;
      }
    }
  );

  const animatedStyle = useAnimatedStyle(() => {
    if (Math.abs(drag.value) > 100) {
      return {
        backgroundColor: Colors.secondary,
      };
    }

    return {
      backgroundColor: "#8b8a8a",
    };
  });

  return (
    <Reanimated.View style={{ flex: 1 }}>
      <Reanimated.View style={[styles.rightAction, animatedStyle]}>
        <Ionicons name="calendar-outline" size={24} color="#fff" />
      </Reanimated.View>
    </Reanimated.View>
  );
}

const TaskRow = ({ task }: TaskRowProps) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);
  const [previouslySelectedDate, setPreviouslySelectedDate] =
    useMMKVString("selectedDate");

  const markAsCompleted = async () => {
    heightAnim.value = withTiming(0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
    opacityAnim.value = withTiming(0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    await drizzleDb
      .update(todos)
      .set({ completed: 1 })
      .where(eq(todos.id, task.id));
  };

  // Animation
  const heightAnim = useSharedValue(70);
  const opacityAnim = useSharedValue(1);
  const reanimatedRef = useRef<SwipeableMethods>(null);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: heightAnim.value,
      opacity: opacityAnim.value,
    };
  });

  const onSwipeableWillOpen = () => {
    setPreviouslySelectedDate(new Date(task.date_added || 0).toISOString());
    reanimatedRef.current?.close();
    router.push(`/task/date-select`);
  };

  return (
    <Reanimated.View style={animatedStyle}>
      <ReanimatedSwipeable
        ref={reanimatedRef}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={100}
        renderRightActions={RightAction}
        onSwipeableWillOpen={onSwipeableWillOpen}
      >
        <Link href={`/task/${task.id}`} style={styles.container} asChild>
          <TouchableOpacity>
            <View style={styles.row}>
              <BouncyCheckbox
                size={25}
                textContainerStyle={{ display: "none" }}
                fillColor={task.project_color}
                unFillColor="#fff"
                isChecked={task.completed === 1}
                onPress={markAsCompleted}
              />
              <Text style={styles.name}>{task.name}</Text>
            </View>
            <Text style={styles.projectName}>{task.project_name}</Text>
          </TouchableOpacity>
        </Link>
      </ReanimatedSwipeable>
    </Reanimated.View>
  );
};

export default TaskRow;

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.lightBorder,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  name: {
    fontSize: 16,
    flex: 1,
  },
  projectName: {
    fontSize: 12,
    color: Colors.dark,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  rightAction: {
    height: 90,
    backgroundColor: "#8b8a8a",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    flex: 1,
  },
});
