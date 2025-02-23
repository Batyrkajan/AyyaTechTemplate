import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { theme } from "../theme";
import { Ionicons } from "@expo/vector-icons";

type ProjectCardProps = {
  title: string;
  description: string;
  progress: number;
  onPress: () => void;
};

const CARD_WIDTH = (Dimensions.get("window").width - 140) / 2 - 20; // Account for sidebar and gaps

export default function ProjectCard({ title, description, progress, onPress }: ProjectCardProps) {
  return (
    <TouchableOpacity style={[styles.container, { width: CARD_WIDTH }]} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text} />
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.8,
  },
}); 