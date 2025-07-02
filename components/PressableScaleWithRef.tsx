import React, { forwardRef } from "react";
import { View, ViewProps } from "react-native";
import { PressableScale, type PressableScaleProps } from "react-native-pressable-scale";

// Wrappa PressableScale dentro una View che riceve il ref
const PressableScaleWithRef = forwardRef<View, ViewProps & PressableScaleProps>(
  ({ children, ...rest }, ref) => {
    return (
      <View ref={ref}>
        <PressableScale {...rest}>
          {children}
        </PressableScale>
      </View>
    );
  }
);

export default PressableScaleWithRef;
