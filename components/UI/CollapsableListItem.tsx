import { Image, StyleSheet, Text, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { CollapsableContainer } from './CollapsableContainer';
import { useState } from 'react';

export { ListItem };

type ListItemType = {
  image: string;
  title: string;
  subtitle: string;
  details: string;
};

function ListItem({ item }: { item: ListItemType }) {
  const [expanded, setExpanded] = useState(false);

  function onItemPress() {
    setExpanded(!expanded);
  }

  return (
    <View style={styles.wrap}>
      <TouchableWithoutFeedback onPress={onItemPress}>
        <View style={styles.container}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.text}>{item.title}</Text>
            <Text style={styles.text}>{item.subtitle}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <CollapsableContainer expanded={expanded}>
        <Text style={[styles.details, styles.text]}>{item.details}</Text>
      </CollapsableContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
  },
  container: { flexDirection: 'row' },
  image: { width: 50, height: 50, margin: 10, borderRadius: 5 },
  textContainer: { justifyContent: 'space-around' },
  details: { margin: 10 },
  text: { opacity: 0.7 },
});
