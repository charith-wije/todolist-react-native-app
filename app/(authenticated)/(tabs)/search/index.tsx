import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import Fab from "@/components/Fab";

const Page = () => {
  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View></View>
      </ScrollView>
      <Fab />
    </>
  );
};

export default Page;

const styles = StyleSheet.create({});
