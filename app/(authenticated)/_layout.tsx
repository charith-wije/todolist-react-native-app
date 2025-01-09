import {
  Button,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import React from "react";
import { router, Stack } from "expo-router";
import { Colors } from "@/constants/Colors";

const Layout = () => {
  const { height } = useWindowDimensions();
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: "#fff" } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="task/new"
        options={{
          presentation: "formSheet",
          title: "",
          headerShown: false,
          sheetAllowedDetents: height > 700 ? [0.22] : "fitToContents",
          sheetGrabberVisible: false,
          sheetExpandsWhenScrolledToEdge: false,
          sheetCornerRadius: 10,
        }}
      />
      <Stack.Screen
        name="task/[id]"
        options={{
          presentation: "formSheet",
          title: "",
          headerShown: false,
          sheetAllowedDetents: height > 700 ? [0.22] : "fitToContents",
          sheetGrabberVisible: false,
          sheetExpandsWhenScrolledToEdge: false,
          sheetCornerRadius: 10,
        }}
      />
      <Stack.Screen
        name="task/date-select"
        options={{
          presentation: "formSheet",
          title: "Schedule",
          sheetAllowedDetents: height > 700 ? [0.45, 0.9] : "fitToContents",
          sheetGrabberVisible: true,
          sheetExpandsWhenScrolledToEdge: false,
          sheetCornerRadius: 10,
          headerLeft: () => (
            <Button
              title="Cancel"
              onPress={() => router.back()}
              color={Colors.primary}
            />
          ),
        }}
      />
    </Stack>
  );
};

export default Layout;

const styles = StyleSheet.create({});
