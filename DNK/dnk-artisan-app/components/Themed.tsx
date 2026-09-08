/**
 * Themed Component Wrapper
 */
import { Text as DefaultText, View as DefaultView } from 'react-native';
import Colors from '../constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, ...otherProps } = props;
  const color = lightColor || Colors.textPrimary;

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, ...otherProps } = props;
  const backgroundColor = lightColor || Colors.background;

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
