import { StyleSheet, Text, View, Button } from "react-native";
import React from "react";
import { useAuth } from "@clerk/clerk-expo";

const Page = () => {
  const { signOut } = useAuth();
  return (
    <View>
      <Text>Page</Text>
      <Button title="Sign Out" onPress={() => signOut()} />
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({});
