import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type ActionCardVariant = 'default' | 'primary' | 'accent' | 'outline' | 'surface';

export interface ActionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badgeText?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  variant?: ActionCardVariant;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  footerText?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  badgeText,
  badgeColor,
  badgeTextColor,
  variant = 'default',
  onPress,
  disabled = false,
  style,
  titleStyle,
  descriptionStyle,
  children,
  footerText,
}) => {
  const isInteractive = Boolean(onPress) && !disabled;

  const cardStyle = [
    styles.baseCard,
    variantStyles[variant],
    disabled && styles.disabledCard,
    style,
  ];

  const content = (
    <View style={styles.innerContainer}>
      <View style={styles.headerRow}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}

        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.titleText,
                variant === 'primary' ? styles.lightText : styles.darkText,
                titleStyle,
              ]}
              numberOfLines={2}
            >
              {title}
            </Text>
            {badgeText && (
              <View
                style={[
                  styles.badge,
                  badgeColor ? { backgroundColor: badgeColor } : styles.defaultBadge,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    badgeTextColor ? { color: badgeTextColor } : styles.defaultBadgeText,
                  ]}
                >
                  {badgeText}
                </Text>
              </View>
            )}
          </View>

          {description && (
            <Text
              style={[
                styles.descriptionText,
                variant === 'primary' ? styles.lightDescriptionText : styles.darkDescriptionText,
                descriptionStyle,
              ]}
              numberOfLines={3}
            >
              {description}
            </Text>
          )}
        </View>

        {isInteractive && (
          <View style={styles.chevronWrapper}>
            <Text
              style={[
                styles.chevronText,
                variant === 'primary' ? styles.lightChevron : styles.darkChevron,
              ]}
            >
              →
            </Text>
          </View>
        )}
      </View>

      {children && <View style={styles.customContent}>{children}</View>}

      {footerText && (
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{footerText}</Text>
        </View>
      )}
    </View>
  );

  if (isInteractive) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  baseCard: {
    borderRadius: 14,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  innerContainer: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    marginRight: 12,
    marginTop: 2,
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 0, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  darkText: {
    color: '#1A1A1A',
  },
  lightText: {
    color: '#FFFFFF',
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  darkDescriptionText: {
    color: '#555555',
  },
  lightDescriptionText: {
    color: '#FFE082',
  },
  chevronWrapper: {
    marginLeft: 8,
    alignSelf: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  darkChevron: {
    color: '#8B0000',
  },
  lightChevron: {
    color: '#FFFFFF',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadge: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  defaultBadgeText: {
    color: '#E65100',
  },
  customContent: {
    marginTop: 12,
  },
  footerRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  footerText: {
    fontSize: 11,
    color: '#777777',
    fontWeight: '500',
  },
  disabledCard: {
    opacity: 0.6,
  },
});

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  surface: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  primary: {
    backgroundColor: '#8B0000',
    borderColor: '#6B0000',
    borderWidth: 1,
  },
  accent: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#8B0000',
  },
});

export default ActionCard;
