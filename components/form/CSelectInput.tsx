import { HelperText } from 'react-native-paper';
import { Controller } from 'react-hook-form';
import { Flex } from '../UI/Flex';
import { useEffect, useState } from 'react';
import {
  MultipleSelectList,
  SelectList,
} from 'react-native-dropdown-select-list';
import { useAppTheme } from '../providers/Material3ThemeProvider';

type CSelectInputProps<T> = {
  name: string;
  label: string;
  data: Array<T>;
  getKey: (item: T) => string;
  getValue: (item: T) => string;
  multiple?: boolean;
  getDisabled?: (item: T) => boolean;
};

export function CSelectInput<T = any>({
  name,
  label,
  data,
  getKey,
  getValue,
  multiple = false,
  getDisabled,
}: CSelectInputProps<T>) {
  const color = useAppTheme();
  const [newData, setNewData] = useState<
    Array<{
      key: string;
      value: string;
      disabled?: boolean;
    }>
  >([]);

  useEffect(() => {
    const newData = data.map((item) => ({
      key: getKey(item),
      value: getValue(item),
      disabled: getDisabled ? getDisabled(item) : undefined,
    }));
    setNewData(newData);
  }, [data, getKey, getValue, getDisabled]);

  return (
    <Controller
      name={name}
      render={({ field: { onChange, onBlur, value, ref }, fieldState }) => (
        <Flex style={{ marginVertical: 3 }}>
          {multiple ? (
            <MultipleSelectList
              setSelected={(val: any) => onChange(val)}
              data={newData}
              save="key"
              label={label}
              placeholder={label}
              // ref={ref}
              boxStyles={{
                borderColor: fieldState.invalid
                  ? color.colors.error
                  : undefined,
              }}
            />
          ) : (
            <SelectList
              setSelected={(val: any) => onChange(val)}
              data={newData}
              save="key"
              placeholder={label}
              // ref={ref}
              boxStyles={{
                borderColor: fieldState.invalid
                  ? color.colors.error
                  : undefined,
              }}
            />
          )}
          {fieldState.invalid && (
            <HelperText
              type="error"
              visible={fieldState.invalid}
              padding="none"
            >
              {fieldState.error?.message}
            </HelperText>
          )}
        </Flex>
      )}
    />
  );
}
