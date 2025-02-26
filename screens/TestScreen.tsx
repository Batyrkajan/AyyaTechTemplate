import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../supabaseClient";

// Define the Task type
type Task = {
  id: number;
  title: string;
  created_at: string;
};

export default function TestScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simple test query
      const { data, error } = await supabase
        .from("tasks")
        .select("count")
        .single();

      if (error) {
        throw error;
      }

      console.log("Connection successful!", data);
      alert("Successfully connected to Supabase!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      console.error("Connection test failed:", err);
      alert("Failed to connect to Supabase. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks from Supabase</Text>
      {tasks.length === 0 ? (
        <Text style={styles.noTasks}>No tasks found</Text>
      ) : (
        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  taskItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  taskTitle: {
    fontSize: 18,
  },
  taskDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  noTasks: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});
