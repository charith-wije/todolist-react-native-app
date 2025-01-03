import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Todo } from "@/types/interfaces";
import { Link } from "expo-router";
import { Colors } from "@/constants/Colors";
import BouncyCheckbox from "react-native-bouncy-checkbox";
interface TaskRowProps {
  task: Todo;
}

const TaskRow = ({ task }: TaskRowProps) => {
  return (
    <View>
      <Link href={`/task/${task.id}`} style={styles.container} asChild>
        <TouchableOpacity>
          <View style={styles.row}>
            <BouncyCheckbox
              size={25}
              textContainerStyle={{ display: "none" }}
              fillColor={Colors.primary}
              isChecked={task.completed === 1}
              onPress={() => {}}
            />
            <Text style={styles.name}>{task.name}</Text>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
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
});
