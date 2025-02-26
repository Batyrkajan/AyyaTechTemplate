import { supabase } from "../supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Sign Up Function
export async function signUp(email: string, password: string) {
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return user;
}

// Log In Function
export async function logIn(email: string, password: string) {
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  await AsyncStorage.setItem("user", JSON.stringify(user));
  return user;
}

// Log Out Function
export async function logOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  await AsyncStorage.removeItem("user");
}
