import { withLayoutContext } from "expo-router";
import {
  createNativeBottomTabNavigator,
  NativeBottomTabNavigationOptions,
  NativeBottomTabNavigationEventMap,
} from "@bottom-tabs/react-navigation";

const { Navigator } = createNativeBottomTabNavigator();

export const Tabs = withLayoutContext<
  NativeBottomTabNavigationOptions,
  typeof Navigator,
  any,
  NativeBottomTabNavigationEventMap
>(Navigator);
