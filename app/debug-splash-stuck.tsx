import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from './config/firebase';
import { useAuth } from './context/AuthContext';

export default function DebugSplashStuck() {
  const { isLoggedIn, loading, user, userData } = useAuth();
  const [firebaseStatus, setFirebaseStatus] = useState({
    authInitialized: false,
    dbInitialized: false,
    authStateChecked: false,
    userLoaded: false,
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    // Check Firebase initialization
    setFirebaseStatus({
      authInitialized: !!auth,
      dbInitialized: !!db,
      authStateChecked: !!user || !loading,
      userLoaded: !!userData || !loading,
    });

    addLog('=== DEBUG SPLASH STUCK ===');
    addLog(`Auth initialized: ${!!auth}`);
    addLog(`DB initialized: ${!!db}`);
    addLog(`Loading: ${loading}`);
    addLog(`isLoggedIn: ${isLoggedIn}`);
    addLog(`User: ${user?.email || 'null'}`);
    addLog(`UserData: ${userData?.email || 'null'}`);
    addLog(`UserData role: ${userData?.role || 'null'}`);
  }, [loading, isLoggedIn, user, userData]);

  const testFirebaseConnection = async () => {
    addLog('Testing Firebase connection...');
    
    if (!auth) {
      Alert.alert('Error', 'Firebase Auth not initialized');
      return;
    }

    if (!db) {
      Alert.alert('Error', 'Firebase Firestore not initialized');
      return;
    }

    try {
      // Try to get current user
      const currentUser = auth.currentUser;
      addLog(`Current user: ${currentUser?.email || 'none'}`);

      if (currentUser) {
        addLog(`User UID: ${currentUser.uid}`);
        addLog(`User email verified: ${currentUser.emailVerified}`);
      }

      Alert.alert('Success', 'Firebase connection OK');
    } catch (error: any) {
      addLog(`ERROR: ${error.message}`);
      Alert.alert('Error', error.message);
    }
  };

  const forceReload = () => {
    addLog('Force reloading app...');
    // Navigate to index to trigger auth check again
    router.replace('/');
  };

  const forceLogout = async () => {
    addLog('Force logout...');
    try {
      if (auth) {
        await auth.signOut();
        addLog('Logged out successfully');
        router.replace('/login');
      }
    } catch (error: any) {
      addLog(`Logout error: ${error.message}`);
      Alert.alert('Error', error.message);
    }
  };

  const clearAuthCache = () => {
    addLog('Clearing auth cache...');
    Alert.alert(
      'Clear Cache',
      'Please restart the app after this',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: async () => {
            try {
              if (auth) {
                await auth.signOut();
              }
              addLog('Cache cleared');
              Alert.alert('Success', 'Cache cleared. Please restart app.');
            } catch (error: any) {
              addLog(`Error: ${error.message}`);
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Debug Splash Screen Stuck</Text>
      
      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>Firebase Status</Text>
        <Text style={styles.statusText}>
          Auth: {firebaseStatus.authInitialized ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusText}>
          Firestore: {firebaseStatus.dbInitialized ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusText}>
          Auth State: {firebaseStatus.authStateChecked ? '✅' : '⏳'}
        </Text>
        <Text style={styles.statusText}>
          User Data: {firebaseStatus.userLoaded ? '✅' : '⏳'}
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>Auth Context</Text>
        <Text style={styles.statusText}>Loading: {loading ? '⏳ Yes' : '✅ No'}</Text>
        <Text style={styles.statusText}>Logged In: {isLoggedIn ? '✅ Yes' : '❌ No'}</Text>
        <Text style={styles.statusText}>User Email: {user?.email || '❌ None'}</Text>
        <Text style={styles.statusText}>User Role: {userData?.role || '❌ None'}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testFirebaseConnection}>
          <Text style={styles.buttonText}>Test Firebase</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={forceReload}>
          <Text style={styles.buttonText}>Force Reload</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={forceLogout}>
          <Text style={styles.buttonText}>Force Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearAuthCache}>
          <Text style={styles.buttonText}>Clear Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={goToLogin}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logsCard}>
        <Text style={styles.cardTitle}>Logs</Text>
        <ScrollView style={styles.logsScroll}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  buttonContainer: {
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#00BCD4',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logsScroll: {
    flex: 1,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 2,
  },
});
