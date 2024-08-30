import { FC } from 'react';
import { ThemedView } from '../ThemedView';
import { ActivityIndicator } from 'react-native-paper';



const Progress: FC = () => {

  return (
    <ThemedView
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        // backgroundColor: 'rgba(0, 0, 0, 0.1)',
        opacity: 0.5,
        zIndex: 99999,
      }}
    >
      <ActivityIndicator animating={true} />
    </ThemedView>
  );
};

export default Progress;