import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: "#fff" } }} />
  );
};

export default Layout;

const styles = StyleSheet.create({});
