import { ViewStyle } from 'react-native';
import { useAppTheme } from '../providers/Material3ThemeProvider';
import { Checkbox, CheckboxProps, HelperText } from 'react-native-paper';
import { Controller } from 'react-hook-form';
import { Flex } from '../Flex';

type CCheckBoxProps = {
  name: string;
  label: string;
  flexStyles?: ViewStyle;
  helperText?: string;
} & Omit<CheckboxProps, 'status' | 'onPress'>;

export function CCheckBox({
  name,
  label,
  flexStyles,
  helperText,
  ...props
}: CCheckBoxProps) {
  const color = useAppTheme();

  return (
    <Controller
      name={name}
      render={({ field: { onChange, onBlur, value, ref }, fieldState }) => (
        <Flex style={{ marginVertical: 3, ...flexStyles }}>
          <Checkbox.Item
            label={label}
            status={Boolean(value) ? 'checked' : 'unchecked'}
            onPress={() => onChange(!Boolean(value))}
            style={{ backgroundColor: color.colors.surfaceVariant }}
            {...props}
          />
          {helperText && (
            <HelperText
              type="info"
              padding="none"
              style={{
                color: color.colors.primary,
              }}
            >
              {helperText}
            </HelperText>
          )}
          {fieldState.invalid && (
            <HelperText
              type="error"
              visible={fieldState.invalid}
              padding="none"
              style={{ marginTop: helperText ? -10 : undefined }}
            >
              {fieldState.error?.message}
            </HelperText>
          )}
        </Flex>
      )}
    />
  );
}
