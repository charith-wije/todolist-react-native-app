import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

const Page = () => {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>Page: {id}</Text>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({});
