import { FC } from 'react';
import { ActivityIndicator, Portal, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flex } from '../UI/Flex';
import { useAppTheme } from '../providers/Material3ThemeProvider';
import { HextoRGBA } from '@/utils/color';
import LottieView from 'lottie-react-native';
import { useProgressStore } from '@/stores/progress';

const Progress: FC = () => {
  const insets = useSafeAreaInsets();
  const color = useAppTheme();
  const backgroundColor = HextoRGBA(color.colors.background, 0.5);
  const progresses = useProgressStore((state) => state.progresses);

  return (
    <Portal>
      <Flex
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          justifyContent: 'center',
          zIndex: 99999,
          paddingTop: insets.top,
          backgroundColor: backgroundColor,
        }}
      >
        {/* <ActivityIndicator animating={true} size={'large'} /> */}
        <LottieView
          source={require('../../assets/animations/Loading.json')}
          autoPlay
          loop
          style={{
            width: 100,
            height: 100,
            alignSelf: 'center',
          }}
        />
        {/* <Text>{JSON.stringify(progresses)}</Text> */}
      </Flex>
    </Portal>
  );
};

export default Progress;
