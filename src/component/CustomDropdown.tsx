import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';

// Define the type for the dropdown item
interface DropdownItem {
  label: string;
  value: string | number; // Can be a string or number depending on your data
}

// Define the props for the CustomDropdown component
interface CustomDropdownProps {
  title: string;
  data: DropdownItem[];
  selectedValue: string | number; // Can be a string or number depending on your state
  setSelectedValue: (item: DropdownItem) => void; // Function to set selected value
  subTitle?: string; // Optional subtitle
}

const CustomDropdown: React.FC<CustomDropdownProps> = props => {
  const {title, data, selectedValue, setSelectedValue, subTitle} = props;
  const [value, setValue] = useState<string | number>(selectedValue);
  const [isFocus, setIsFocus] = useState<boolean>(false);

  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && {color: 'black'}]}>
          {subTitle}
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {renderLabel()}
      <Dropdown
        itemTextStyle={styles.textStyle}
        style={[styles.dropdown, isFocus && {borderColor: '#C9DFEF'}]}
        containerStyle={styles.border}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        iconStyle={styles.iconStyle}
        data={data}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? title : '...'}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setValue(item.value);
          setSelectedValue(item);
          setIsFocus(false);
        }}
        // renderLeftIcon={() => (
        //   <View style={styles.iconView}>
        //     <ShieldIcon color={isFocus ? '#C9DFEF' : 'black'} />
        //   </View>
        // )}
      />
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  iconView: {paddingRight: 10},
  border: {borderRadius: 15},
  textStyle: {color: 'black'},
  container: {
    paddingVertical: 16,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.3,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    color: 'black',
    fontWeight: '700',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'black',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
