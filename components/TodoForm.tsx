import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Project, Todo } from "@/types/interfaces";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { projects, todos } from "@/db/schema";
import { Colors, DATE_COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { router } from "expo-router";
import { useMMKVString } from "react-native-mmkv";
import { format, isSameDay, isThisWeek, isTomorrow } from "date-fns";

type TodoFormProps = {
  todo?: Todo & {
    project_name: string;
    project_color: string;
    project_id: number;
  };
};

type TodoFormData = {
  name: string;
  description: string;
};

const TodoForm = ({ todo }: TodoFormProps) => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);
  const {
    control,
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<TodoFormData>({
    defaultValues: {
      name: todo?.name || "",
      description: todo?.description || "",
    },
    mode: "onChange",
  });
  const [showProject, setShowproject] = useState(false);
  const { data } = useLiveQuery(drizzleDb.select().from(projects));
  const [selectedProject, setSelectedProjects] = useState<Project>(
    todo?.project_id
      ? {
          id: todo.project_id,
          name: todo.project_name,
          color: todo.project_color,
        }
      : {
          id: 1,
          name: "Inbox",
          color: "#000",
        }
  );
  const [selectedDate, setSelectedDate] = useState<Date>(
    todo?.due_date ? new Date(todo.due_date) : new Date()
  );
  const [previouslySlectedDate, setPreviouslySelectedDate] =
    useMMKVString("selectedDate");

  useEffect(() => {
    if (previouslySlectedDate) {
      setSelectedDate(new Date(previouslySlectedDate));
      setPreviouslySelectedDate(undefined);
    }
  }, [previouslySlectedDate]);

  useEffect(() => {
    trigger();
  }, [trigger]);

  const onSubmit: SubmitHandler<TodoFormData> = async (data) => {
    if (todo) {
      // UPDATE
      await drizzleDb
        .update(todos)
        .set({
          name: data.name,
          description: data.description,
          project_id: selectedProject.id,
          due_date: selectedDate.getTime(),
        })
        .where(eq(todos.id, todo.id));
    } else {
      // CREATE
      await drizzleDb.insert(todos).values({
        name: data.name,
        description: data.description,
        project_id: selectedProject.id,
        priority: 0,
        date_added: Date.now(),
        completed: 0,
        due_date: selectedDate.getTime(), // TODO: Add due date
      });
    }
    router.dismiss();
  };

  const changeDate = () => {
    const dateString = selectedDate.toISOString();
    setPreviouslySelectedDate(dateString);
    router.push("/task/date-select");
  };

  const getDateObject = (date: Date) => {
    console.log(date);
    if (isSameDay(date, new Date())) {
      return {
        name: "Today",
        color: DATE_COLORS.today,
      };
    } else if (isTomorrow(new Date(date))) {
      return {
        name: "Tomorrow",
        color: DATE_COLORS.tomorrow,
      };
    } else {
      return {
        name: format(new Date(date), "EEE, d MMM"),
        color: DATE_COLORS.other,
      };
    }
  };

  const onProjectPress = (project: Project) => {
    setSelectedProjects(project);
    setShowproject(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Modal
        visible={showProject}
        transparent
        animationType="fade"
        onRequestClose={() => setShowproject(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <FlatList
              data={data}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.projectButton}
                  onPress={() => onProjectPress(item)}
                >
                  <Text style={{ color: item.color }}>#{item.id}</Text>
                  <Text style={{ color: item.color }}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              style={{ borderRadius: 12 }}
            />
          </View>
        </View>
      </Modal>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
      >
        <Controller
          control={control}
          name="name"
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Task name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoFocus
              autoCorrect={false}
              style={styles.titleInput}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Description"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              style={styles.descriptionInput}
            />
          )}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.actionButtonsContainer}
          keyboardShouldPersistTaps="always"
        >
          <Pressable
            onPress={() => changeDate()}
            style={({ pressed }) => {
              return [
                styles.outlinedButton,
                {
                  backgroundColor: pressed ? Colors.lightBorder : "transparent",
                  borderColor: getDateObject(selectedDate).color,
                },
              ];
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={24}
              color={getDateObject(selectedDate).color}
            />
            <Text
              style={[
                styles.outlinedButtonText,
                { color: getDateObject(selectedDate).color },
              ]}
            >
              {getDateObject(selectedDate).name}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => {
              return [
                styles.outlinedButton,
                {
                  backgroundColor: pressed ? Colors.lightBorder : "transparent",
                },
              ];
            }}
          >
            <Ionicons name="flag-outline" size={24} color={Colors.dark} />
            <Text style={styles.outlinedButtonText}>Priority</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => {
              return [
                styles.outlinedButton,
                {
                  backgroundColor: pressed ? Colors.lightBorder : "transparent",
                },
              ];
            }}
          >
            <Ionicons name="location-outline" size={24} color={Colors.dark} />
            <Text style={styles.outlinedButtonText}>Location</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => {
              return [
                styles.outlinedButton,
                {
                  backgroundColor: pressed ? Colors.lightBorder : "transparent",
                },
              ];
            }}
          >
            <Ionicons name="pricetags-outline" size={24} color={Colors.dark} />
            <Text style={styles.outlinedButtonText}>Label</Text>
          </Pressable>
        </ScrollView>
        <View style={styles.bottomRow}>
          <Pressable
            onPress={() => setShowproject(true)}
            style={({ pressed }) => {
              return [
                styles.outlinedButton,
                {
                  backgroundColor: pressed ? Colors.lightBorder : "transparent",
                },
              ];
            }}
          >
            {selectedProject.id === 1 && (
              <Ionicons
                name="file-tray-outline"
                size={20}
                color={Colors.dark}
              />
            )}
            {selectedProject.id !== 1 && (
              <Text style={{ color: selectedProject.color }}>#</Text>
            )}
            <Text style={styles.outlinedButtonText}>
              {selectedProject.name}
            </Text>
            <Ionicons name="caret-down" size={14} color={Colors.dark} />
          </Pressable>

          <Pressable
            onPress={handleSubmit(onSubmit)}
            style={[
              styles.submitButton,
              {
                opacity: errors.name ? 0.5 : 1,
              },
            ]}
          >
            <Ionicons name="arrow-up" size={24} color={"#fff"} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default TodoForm;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    gap: 12,
    paddingTop: 16,
  },
  titleInput: {
    fontSize: 20,
    paddingHorizontal: 16,
  },
  descriptionInput: {
    fontSize: 18,
    paddingHorizontal: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  outlinedButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lightBorder,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  outlinedButtonText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: "500",
  },
  bottomRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lightBorder,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    padding: 6,
  },
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalView: {
    margin: 20,
    width: Dimensions.get("window").width - 60,
    height: 200,
    backgroundColor: "white",
    borderRadius: 12,
    boxShadow: "0 0 10px 0 rgba(0,0,0,0.2)",
    elevation: 5,
  },
  projectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 5,
    gap: 14,
  },
  projectButtonText: {
    fontSize: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.lightBorder,
  },
});
