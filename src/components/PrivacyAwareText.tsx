import React from 'react';
import { Text, TextProps } from 'react-native';
import { usePrivacy } from '../context/PrivacyContext';

interface PrivacyAwareTextProps extends TextProps {
  value: string | number;
  maskedValue?: string;
  format?: (val: any) => string;
}

export const PrivacyAwareText: React.FC<PrivacyAwareTextProps> = ({ 
  value, 
  maskedValue = '••••••', 
  format,
  style, 
  ...props 
}) => {
  const { isPrivacyMode } = usePrivacy();
  
  const displayValue = format ? format(value) : String(value);
  
  return (
    <Text style={style} {...props}>
      {isPrivacyMode ? maskedValue : displayValue}
    </Text>
  );
};
