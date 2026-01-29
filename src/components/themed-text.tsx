import { StyleSheet, Text, type TextProps } from "react-native";
import { useTheme } from "../hooks/useTheme";

export interface ThemedTextProps extends TextProps {
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
}

export function ThemedText({ type = "default", ...rest }: ThemedTextProps) {
  const colors = useTheme();
  const styles = createStyles(colors);
  return (
    <Text
      style={[
        { color: colors.TEXT_PRIMARY },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? [styles.link, { color: colors.PRIMARY }] : undefined,
      ]}
      {...rest}
    />
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    default: {
      fontSize: 16,
      lineHeight: 24,
    },
    defaultSemiBold: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "600",
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      lineHeight: 32,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    link: {
      lineHeight: 30,
      fontSize: 16,
      color: "#0a7ea4",
    },
  });
