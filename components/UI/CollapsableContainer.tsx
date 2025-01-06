import { ReactNode, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export { CollapsableContainer };

function CollapsableContainer({
  children,
  expanded,
}: {
  children: ReactNode;
  expanded: boolean;
}) {
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const measuredHeightRef = useRef(0);
  const animatedHeight = useSharedValue(0);

  function onLayout(event: LayoutChangeEvent) {
    const contentHeight = event.nativeEvent.layout.height;

    if (contentHeight > 0 && measuredHeightRef.current !== contentHeight) {
      measuredHeightRef.current = contentHeight;
      setMeasuredHeight(contentHeight);
    }
  }

  useEffect(() => {
    animatedHeight.value = expanded
      ? withTiming(measuredHeight, { duration: 300 })
      : withTiming(0, { duration: 300 });
  }, [expanded, measuredHeight]);

  const collapsableStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <Animated.View
      style={[collapsableStyle, { overflow: 'hidden', width: '100%' }]}
    >
      <View style={{ position: 'absolute', width: '100%' }} onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  );
}
