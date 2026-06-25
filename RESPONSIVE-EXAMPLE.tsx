/**
 * ============================================
 * RESPONSIVE LAYOUT EXAMPLES
 * ============================================
 * Ví dụ cách viết code responsive cho mọi thiết bị
 */

import { responsive } from '@/utils/responsive';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ❌ SAI - HARDCODED SIZES
const BadExample = () => {
  return (
    <View style={{ width: 400, height: 600, padding: 20 }}>
      <Text style={{ fontSize: 18 }}>Sẽ bị lỗi trên màn hình nhỏ!</Text>
      <Image 
        source={require('./local-image.png')} 
        style={{ width: 300, height: 200 }}
      />
    </View>
  );
};

// ✅ ĐÚNG - RESPONSIVE
const GoodExample = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ 
        flex: 1, 
        padding: responsive.padding.md 
      }}>
        <Text style={{ 
          fontSize: responsive.fontSize(18) 
        }}>
          Chạy tốt mọi màn hình!
        </Text>
        <Image 
          source={{ uri: 'https://firebase-url.com/image.png' }}
          style={{ 
            width: responsive.width(300), 
            height: responsive.height(200) 
          }}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

// ✅ BUTTON RESPONSIVE
const ResponsiveButton = ({ title, onPress }: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#00BCD4',
        padding: responsive.padding.md,
        borderRadius: responsive.moderate(10),
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: responsive.height(48), // Touch target 48dp minimum
      }}
    >
      <Text style={{
        color: '#fff',
        fontSize: responsive.fontSize(16),
        fontWeight: '600',
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// ✅ CARD RESPONSIVE
const ResponsiveCard = ({ title, description, imageUrl }: any) => {
  return (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: responsive.moderate(12),
      padding: responsive.padding.md,
      marginBottom: responsive.padding.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: '100%',
          height: responsive.height(200),
          borderRadius: responsive.moderate(8),
          marginBottom: responsive.padding.sm,
        }}
        resizeMode="cover"
      />
      <Text style={{
        fontSize: responsive.fontSize(18),
        fontWeight: 'bold',
        marginBottom: responsive.padding.xs,
      }}>
        {title}
      </Text>
      <Text style={{
        fontSize: responsive.fontSize(14),
        color: '#666',
      }}>
        {description}
      </Text>
    </View>
  );
};

// ✅ ADAPTIVE LAYOUT (Phone vs Tablet)
const AdaptiveLayout = ({ children }: any) => {
  if (responsive.isTablet) {
    // Tablet: 2 cột
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {React.Children.map(children, (child) => (
          <View style={{ width: '50%', padding: responsive.padding.sm }}>
            {child}
          </View>
        ))}
      </View>
    );
  } else {
    // Phone: 1 cột
    return (
      <View>
        {children}
      </View>
    );
  }
};

// ✅ COMPLETE SCREEN EXAMPLE
const ResponsiveScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView 
        contentContainerStyle={{ 
          padding: responsive.padding.md 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={{
          fontSize: responsive.fontSize(28),
          fontWeight: 'bold',
          marginBottom: responsive.padding.lg,
        }}>
          Tiêu đề màn hình
        </Text>

        {/* Cards in adaptive layout */}
        <AdaptiveLayout>
          <ResponsiveCard
            title="Card 1"
            description="Mô tả ngắn"
            imageUrl="https://example.com/image1.jpg"
          />
          <ResponsiveCard
            title="Card 2"
            description="Mô tả ngắn"
            imageUrl="https://example.com/image2.jpg"
          />
        </AdaptiveLayout>

        {/* Buttons */}
        <View style={{ marginTop: responsive.padding.lg }}>
          <ResponsiveButton 
            title="Nút chính" 
            onPress={() => {}} 
          />
        </View>

        {/* Spacing for bottom navigation */}
        <View style={{ height: responsive.padding.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ✅ CONDITIONAL STYLING BY SCREEN SIZE
const ConditionalStyling = () => {
  const styles = {
    container: {
      padding: responsive.isSmallPhone 
        ? responsive.padding.sm 
        : responsive.padding.md,
    },
    text: {
      fontSize: responsive.isTablet
        ? responsive.fontSize(20)
        : responsive.fontSize(16),
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Tự động điều chỉnh theo kích thước màn hình
      </Text>
    </View>
  );
};

export {
    AdaptiveLayout, ConditionalStyling, GoodExample,
    ResponsiveButton,
    ResponsiveCard, ResponsiveScreen
};

