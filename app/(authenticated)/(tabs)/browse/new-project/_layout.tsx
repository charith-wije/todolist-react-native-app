import React from "react";
import { router, Stack } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Button } from "react-native";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          color: "#000",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "New Project",
          headerTransparent: true,
          headerLeft: () => (
            <Button
              title="Cancel"
              color={Colors.primary}
              onPress={() => router.dismiss()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="color-select"
        options={{ title: "Color", headerTransparent: true }}
      />
    </Stack>
  );
};

export default Layout;
