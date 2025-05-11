import { useAuth } from "../context/AuthContext";
import LoginScreen from "../components/LoginScreen";
import ContactsScreen from "../components/ContactsScreen";

export default function Index() {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <ContactsScreen /> : <LoginScreen />;
}
