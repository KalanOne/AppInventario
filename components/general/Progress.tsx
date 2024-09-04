import { FC } from 'react';
import { ThemedView } from '../ThemedView';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useProgressStore } from '@/stores/progress';



const Progress: FC = () => {
  const progresses = useProgressStore((state) => state.progresses);

  return (
    <ThemedView
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: "100%",
        justifyContent: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.1)',
        opacity: 0.5,
        zIndex: 99999,
      }}
    >
      <Text>
        {progresses.length} task{progresses.length > 1 ? 's' : ''} in progress
      </Text>
      <Text>
        {progresses.join(', ')}
      </Text>
      <ActivityIndicator animating={true} />
    </ThemedView>
  );
};

export default Progress;