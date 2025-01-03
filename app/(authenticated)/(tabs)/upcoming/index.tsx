import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Fab from "@/components/Fab";

const Page = () => {
  return (
    <View style={styles.container}>
      <Text>Page</Text>
      <Fab />
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
