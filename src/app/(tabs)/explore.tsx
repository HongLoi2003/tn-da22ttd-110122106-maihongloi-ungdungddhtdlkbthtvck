import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// This screen is disabled in navigation (href: null in _layout.tsx)
// Placeholder to prevent import errors
export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Explore screen (disabled)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
