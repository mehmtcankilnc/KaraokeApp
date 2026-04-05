import React, { useEffect } from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

export const LyricItem = React.memo(
  ({ item, currentTime }: { item: any; currentTime: number }) => {
    const isPlaying =
      currentTime >= item.startTime && currentTime <= item.endTime;

    const progress = useSharedValue(isPlaying ? 1 : 0);

    useEffect(() => {
      progress.value = withTiming(isPlaying ? 1 : 0, { duration: 300 });
    }, [isPlaying, progress]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        fontSize: 16 + progress.value * 4,
        color: interpolateColor(progress.value, [0, 1], ["#131e29", "#f97362"]),
      };
    });

    return (
      <Animated.Text
        style={[
          {
            textAlign: "center",
            fontWeight: "500",
            marginHorizontal: wp(2),
          },
          animatedStyle,
        ]}
      >
        {item.text}
      </Animated.Text>
    );
  },
);
