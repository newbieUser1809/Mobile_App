import { Link, useRouter } from "expo-router";
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getUserByEmail } from '../database/db';

type UserRole = 'student' | 'teacher' | 'admin';

const LoginScreen = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register' | UserRole>('login');
  const [userName, setUserName] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
  if (!credentials.email || !credentials.password) {
    Alert.alert('Error', 'Please enter both email and password');
    return;
  }

  if (!validateEmail(credentials.email)) {
    Alert.alert('Error', 'Please enter a valid email address');
    return;
  }

  setIsLoading(true);

  try {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = getUserByEmail(credentials.email);
    
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (user.password !== credentials.password) {
      Alert.alert('Error', 'Incorrect password');
      return;
    }

    setUserName(user.name);
    Alert.alert('Success', `Welcome back, ${user.name}!`);
    
    // Navigate to appropriate dashboard with userId parameter
    switch(user.role) {
      case 'student':
        router.push({
          pathname: '/dashboards/StudentDashboard',
          params: { userId: user.id }
        });
        break;
      case 'teacher':
        router.push({
          pathname: '/dashboards/TeacherDashboard',
          params: { userId: user.id }
        });
        break;
      case 'admin':
        router.push({
          pathname: '/dashboards/AdminDashboard',
          params: { userId: user.id }
        });
        break;
    }
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Error', 'An error occurred during login');
  } finally {
    setIsLoading(false);
  }
};
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* <Image 
          source={require('../assets/123.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        /> */}
        
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Please sign in to your account</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={credentials.email}
            onChangeText={(text) => setCredentials({...credentials, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#999"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter your password"
              value={credentials.password}
              onChangeText={(text) => setCredentials({...credentials, password: text})}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.visibilityToggle}
            >
              <Text style={styles.visibilityText}>
                {passwordVisible ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
            {/* <Image 
              source={require('../assets/images/google-icon.png')} 
              style={styles.socialIcon}
            /> */}
            <Text style={[styles.socialButtonText, { color: '#4285F4' }]}>Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
            {/* <Image 
              source={require('../assets/images/apple-icon.png')} 
              style={styles.socialIcon}
            /> */}
            <Text style={[styles.socialButtonText, { color: '#000' }]}>Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <Link href="/auth/RegisterScreen" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}> Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  visibilityToggle: {
    padding: 10,
  },
  visibilityText: {
    color: '#007bff',
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#007bff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#a5d8ff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    width: 50,
    textAlign: 'center',
    color: '#666',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  appleButton: {
    backgroundColor: '#fff',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialButtonText: {
    fontWeight: '500',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: '#007bff',
    fontWeight: '500',
  },
});

export default LoginScreen;