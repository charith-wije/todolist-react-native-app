import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Colors, DEFAULT_PROJECT_COLOR } from "@/constants/Colors";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { projects } from "@/db/schema";
import { useHeaderHeight } from "@react-navigation/elements";
import { Ionicons } from "@expo/vector-icons";
import { useMMKVString } from "react-native-mmkv";

const Page = () => {
  const [projectName, setProjectName] = useState("");
  const router = useRouter();
  const { bg } = useLocalSearchParams<{ bg: string }>();
  const [selectedColor, setSelectedColor] = useMMKVString("selectedColor");
  if (!selectedColor) {
    setSelectedColor(DEFAULT_PROJECT_COLOR);
  }
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);
  const headerHeight = useHeaderHeight();

  const onCreateProject = async () => {
    await drizzleDb.insert(projects).values({
      name: projectName,
      color: selectedColor,
    });
    setSelectedColor(DEFAULT_PROJECT_COLOR);
    router.dismiss();
  };

  return (
    <View style={{ marginTop: headerHeight }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={onCreateProject}
              disabled={projectName.length === 0}
            >
              <Text
                style={
                  projectName.length === 0
                    ? styles.btnTextDisplayed
                    : styles.btnText
                }
              >
                Create
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.conainer}>
        <TextInput
          placeholder="Name"
          value={projectName}
          onChangeText={setProjectName}
          style={styles.input}
          autoFocus
        />
        <Link href={"/browse/new-project/color-select"} asChild>
          <TouchableOpacity style={styles.btnItem}>
            <Ionicons
              name="color-palette-outline"
              size={24}
              color={Colors.dark}
            />
            <Text style={styles.btnItemText}>Color</Text>
            <View
              style={[styles.colorPreview, { backgroundColor: selectedColor }]}
            ></View>
            <Ionicons name="chevron-forward" size={22} />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  btnText: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.primary,
  },
  btnTextDisplayed: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.dark,
  },
  conainer: {
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  input: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lightBorder,
    padding: 12,
    fontSize: 16,
  },
  btnItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    gap: 16,
  },
  btnItemText: {
    fontSize: 16,
    flex: 1,
    fontWeight: "500",
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
