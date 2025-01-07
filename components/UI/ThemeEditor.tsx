import { useColorScheme } from 'react-native';
import { useMaterial3ThemeContext } from '../providers/Material3ThemeProvider';
import { useState } from 'react';
import { Flex } from './Flex';
import { IconButton, Switch, Text, TouchableRipple } from 'react-native-paper';
import { useThemeStore } from '@/stores/defaultTheme';

const colors = [
  {
    light: '#FFE082',
    dark: '#FFE082',
  },
  {
    light: '#3E8260',
    dark: '#ADF2C7',
  },
  {
    light: '#756FAB',
    dark: '#E5DFFF',
  },
  {
    light: '#9F6C2C',
    dark: '#FDDDB9',
  },
  {
    light: '#F6B9FD', //8a4c91
    dark: '#f6b9fd',
  },
];

export function ThemeEditor() {
  const colorScheme = useColorScheme();
  const { theme, updateTheme, resetTheme } = useMaterial3ThemeContext();
  const { changeTheme: setUseDefaultTheme, defaultTheme: useDefaultTheme } =
    useThemeStore();

  // const [useDefaultTheme, setUseDefaultTheme] = useState<boolean>(true);
  const [sourceColor, setSourceColor] = useState<string | undefined>(undefined);

  const handleUseDefaultThemeChange = (value: boolean) => {
    if (value) {
      resetTheme();
      setSourceColor(undefined);
    }
    // setUseDefaultTheme(value);
    setUseDefaultTheme();
  };

  const handleSourceColorChange = (color: string) => {
    setSourceColor(color);
    updateTheme(color);
  };

  return (
    <Flex gap={20} style={{ paddingTop: 20 }}>
      {/* {isDynamicThemeSupported && ( */}
      <Flex direction="row" justify="space-between">
        <Text>Use default theme</Text>
        <Switch
          value={useDefaultTheme !== false}
          onValueChange={handleUseDefaultThemeChange}
        />
      </Flex>
      {/* )} */}

      <Flex gap={20}>
        <Text>Select source color</Text>
        <Flex gap={20} direction="row" justify="center" wrap="wrap">
          {colors.map(({ light, dark }) => {
            const color = colorScheme === 'dark' ? dark : light;
            return (
              <TouchableRipple
                style={{ height: 50, width: 50, borderRadius: 50 }}
                onPress={() => handleSourceColorChange(color)}
                borderless
                rippleColor="rgba(0, 0, 0, .32)"
                disabled={useDefaultTheme}
                key={color}
              >
                <Flex
                  backgroundColor={color}
                  justify="center"
                  align="center"
                  style={{
                    height: 50,
                    width: 50,
                    borderRadius: 50,
                    opacity: useDefaultTheme ? 0.5 : 1,
                  }}
                >
                  {sourceColor && [light, dark].includes(sourceColor) && (
                    <IconButton icon="check" iconColor="#000" size={20} />
                  )}
                </Flex>
              </TouchableRipple>
            );
          })}
        </Flex>
      </Flex>
    </Flex>
  );
}
