import { FC } from 'react';
import { ThemedView } from '../ThemedView';
import { ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flex } from '../Flex';
import { useAppTheme } from '../providers/Material3ThemeProvider';
import { HextoRGBA } from '@/utils/color';



const Progress: FC = () => {
  const insets = useSafeAreaInsets();
  const color = useAppTheme();
  const backgroundColor = HextoRGBA(color.colors.background, 0.5);
  return (
    <Flex
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: "100%",
        justifyContent: 'center',
        zIndex: 99999,
        paddingTop: insets.top,
        backgroundColor: backgroundColor
      }}
    >
      <ActivityIndicator animating={true} size={'large'} />
    </Flex>
  );
};

export default Progress;