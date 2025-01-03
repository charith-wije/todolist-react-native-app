import { Stack, usePathname, useRouter, useSegments } from "expo-router";

import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import { tokenCache } from "@/utils/cache";
import { Colors } from "@/constants/Colors";
import { Suspense, useEffect } from "react";
import { ActivityIndicator, LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";
import { addDummyData } from "@/utils/addDummyData";

LogBox.ignoreLogs(["Clerk: Clerk has been loaded with development keys"]);

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const pathName = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(authenticated)";

    if (isSignedIn && !inAuthGroup) {
      router.replace("/(authenticated)/(tabs)/today");
    } else if (!isSignedIn && pathName !== "/") {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
};

const RootLayout = () => {
  const expoDB = SQLite.openDatabaseSync("todos");
  const db = drizzle(expoDB);
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    console.log("useEffect");

    if (!success) return;

    console.log("Add dummy data....");

    addDummyData(db);
  }, [success]);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <Suspense fallback={<Loading />}></Suspense>
        <SQLite.SQLiteProvider
          databaseName="todos"
          useSuspense
          options={{ enableChangeListener: true }}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Toaster />
            <InitialLayout />
          </GestureHandlerRootView>
        </SQLite.SQLiteProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
};

function Loading() {
  return <ActivityIndicator size="large" color={Colors.primary} />;
}

export default RootLayout;
