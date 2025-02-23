import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from "react-native";
import { theme } from "../../theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { Ionicons } from "@expo/vector-icons";
import ProjectCard from "../../components/ProjectCard";
import CreateProjectModal from "../../components/CreateProjectModal";

type Project = {
  id: string;
  title: string;
  description: string;
  progress: number;
};

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export default function DashboardScreen({ navigation }: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "Mobile App Development",
      description: "Building a cross-platform mobile application using React Native",
      progress: 65,
    },
    {
      id: "2",
      title: "Website Redesign",
      description: "Modernizing the company website with new branding",
      progress: 30,
    },
    {
      id: "3",
      title: "AI Integration",
      description: "Implementing machine learning features for data analysis",
      progress: 15,
    },
  ]);

  const handleCreateProject = ({ title, description }: { title: string; description: string }) => {
    const newProject: Project = {
      id: (projects.length + 1).toString(),
      title,
      description,
      progress: 0,
    };
    setProjects([...projects, newProject]);
  };

  const renderProject = ({ item: project }: { item: Project }) => (
    <ProjectCard
      title={project.title}
      description={project.description}
      progress={project.progress}
      onPress={() => {
        console.log(`Opening project: ${project.title}`);
      }}
    />
  );

  return (
    <View style={styles.container}>
      {/* Sidebar Navigation */}
      <View style={styles.sidebar}>
        <TouchableOpacity style={styles.sidebarItem}>
          <Ionicons name="home" size={24} color={theme.colors.text} />
          <Text style={styles.sidebarText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sidebarItem}>
          <Ionicons name="folder" size={24} color={theme.colors.text} />
          <Text style={styles.sidebarText}>Projects</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sidebarItem}>
          <Ionicons name="analytics" size={24} color={theme.colors.text} />
          <Text style={styles.sidebarText}>Analytics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sidebarItem}>
          <Ionicons name="settings" size={24} color={theme.colors.text} />
          <Text style={styles.sidebarText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={theme.colors.text} />
            <Text style={styles.searchText}>Search...</Text>
          </View>
          
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="person-circle" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dashboard Content */}
        <View style={styles.dashboardContent}>
          <Text style={styles.welcomeText}>Welcome back, User!</Text>
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={theme.colors.background} />
            <Text style={styles.createButtonText}>Create New Project</Text>
          </TouchableOpacity>

          <View style={styles.projectsGrid}>
            <Text style={styles.sectionTitle}>Your Projects</Text>
            <FlatList
              data={projects}
              renderItem={renderProject}
              keyExtractor={(item) => item.id}
              horizontal={false}
              numColumns={2}
              columnWrapperStyle={styles.projectsRow}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.projectsList}
            />
          </View>
        </View>
      </View>

      <CreateProjectModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateProject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 80,
    backgroundColor: theme.colors.secondary,
    padding: 20,
    alignItems: "center",
    gap: 30,
  },
  sidebarItem: {
    alignItems: "center",
  },
  sidebarText: {
    color: theme.colors.text,
    fontSize: 12,
    marginTop: 5,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 20,
  },
  searchText: {
    color: theme.colors.text,
    marginLeft: 10,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 15,
  },
  iconButton: {
    padding: 5,
  },
  dashboardContent: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 20,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 30,
  },
  createButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  projectsGrid: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 15,
  },
  projectsList: {
    padding: 10,
    gap: 20,
  },
  projectsRow: {
    gap: 20,
    justifyContent: "flex-start",
  },
}); 