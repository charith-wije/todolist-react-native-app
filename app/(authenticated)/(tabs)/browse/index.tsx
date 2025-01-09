import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import Fab from "@/components/Fab";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import * as ContextMenu from "zeego/context-menu";
import Animated, { LinearTransition } from "react-native-reanimated";

const Page = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);
  const { data } = useLiveQuery(drizzleDb.select().from(projects), []);
  const ispro = false;

  const onDeleteProject = async (id: number) => {
    await drizzleDb.delete(projects).where(eq(projects.id, id));
  };

  const onNewProject = async () => {
    if (data.length >= 5 && !ispro) {
      // go pro
    } else {
      router.push("/browse/new-project");
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.header}>My Project</Text>
          <TouchableOpacity onPress={onNewProject}>
            <Ionicons name="add" size={24} color={Colors.dark} />
          </TouchableOpacity>
        </View>
        <Animated.FlatList
          data={data}
          itemLayoutAnimation={LinearTransition}
          renderItem={({ item }) => (
            <ContextMenu.Root key={item.id}>
              <ContextMenu.Trigger>
                <TouchableOpacity style={styles.projectButton}>
                  <Text style={{ color: item.color }}>#</Text>
                  <Text style={styles.projectButtonText}>{item.name}</Text>
                </TouchableOpacity>
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                <ContextMenu.Item
                  key="delete"
                  onSelect={() => onDeleteProject(item.id)}
                >
                  <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon
                    ios={{
                      name: "trash",
                      pointSize: 18,
                    }}
                  />
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Root>
          )}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => signOut()}
            >
              <Text style={styles.clearButtonText}>Log Out</Text>
            </TouchableOpacity>
          }
        />
      </View>
      <Fab />
    </>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 10,
  },
  clearButton: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: Colors.primary,
    fontSize: 18,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.lightBorder,
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
});
