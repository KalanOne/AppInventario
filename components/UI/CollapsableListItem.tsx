import { Image, StyleSheet, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { CollapsableContainer } from './CollapsableContainer';
import { ComponentProps, ReactNode, useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Material3ThemeProvider';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';

export { ListItem };

interface ListItemType {
  image?: string;
  title: string;
  subtitle: string;
  details?: string;
  children?: ReactNode;
  icon?: ComponentProps<typeof Ionicons>['name'];
}

function ListItem(item: ListItemType) {
  const [expanded, setExpanded] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const color = useAppTheme();

  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (!interacted) {
      opacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
    } else {
      cancelAnimation(opacity);
      opacity.value = 1;
    }
  }, [interacted]);

  function onItemPress() {
    setExpanded(!expanded);
    setInteracted(true);
  }

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <TouchableWithoutFeedback onPress={onItemPress}>
        <View style={styles.container}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} />
          ) : item.icon ? (
            <Ionicons
              size={50}
              style={styles.image}
              name={item.icon}
              color={color.colors.primary}
            />
          ) : null}
          <View style={styles.textContainer}>
            <Text style={styles.text}>{item.title}</Text>
            <Text style={styles.text}>{item.subtitle}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <CollapsableContainer expanded={expanded}>
        {item.children ? (
          item.children
        ) : (
          <Text style={[styles.details, styles.text]}>
            {item.details ?? ''}
          </Text>
        )}
      </CollapsableContainer>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
  },
  container: { flexDirection: 'row', padding: 10, cursor: 'pointer' },
  image: { width: 50, height: 50, borderRadius: 5, marginRight: 10 },
  textContainer: { justifyContent: 'space-around' },
  details: { margin: 10 },
  text: { opacity: 1 },
});
