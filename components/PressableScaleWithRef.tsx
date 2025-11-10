// PressableScaleWithRef.tsx
import React, { forwardRef } from "react";
import { Pressable, PressableProps, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

type Props = PressableProps & { activeScale?: number; weight?: "light" | "normal" };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PressableScaleWithRef = forwardRef<View, Props>(
  ({ children, activeScale = 0.96, style, onPressIn, onPressOut, ...rest }, ref) => {
    const scale = useSharedValue(1);
    const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }), []);

    return (
      <AnimatedPressable
        ref={ref}
        style={[style, aStyle]}
        onPressIn={(e) => {
          scale.value = withTiming(activeScale, { duration: 120 });
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withTiming(1, { duration: 120 });
          onPressOut?.(e);
        }}
        {...rest}
      >
        {children}
      </AnimatedPressable>
    );
  }
);

export default PressableScaleWithRef;
