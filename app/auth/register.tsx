import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../../src/config/fonts';
import { useAuth } from '../../src/context/AuthContext';
import { fontScale, scale } from '../../src/utils/scaling';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the Terms and Conditions');
      return;
    }
    
    try {
      clearError();
      await register(email.trim(), password);
    } catch (err) {}
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#10B95F' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: scale(24), paddingBottom: scale(40) }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
            <TouchableOpacity 
              style={{ 
                width: scale(44), 
                height: scale(44), 
                borderRadius: scale(12),
                backgroundColor: 'rgba(255,255,255,0.15)',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: scale(8),
                marginBottom: scale(16),
              }}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={scale(24)} color="#FFFFFF" />
            </TouchableOpacity>
            
            {/* Header - Centered */}
            <View style={{ alignItems: 'center', marginBottom: scale(24) }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(48), color: '#FFFFFF', textAlign: 'center', marginBottom: scale(8) }}>Sign Up</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(15), color: 'rgba(255,255,255,0.8)', lineHeight: fontScale(22), textAlign: 'center' }}>
                One Step, One way{'\n'}to financial freedom.
              </Text>
            </View>
            
            {/* Error Message */}
            {error && (
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: scale(12), borderRadius: scale(12), backgroundColor: 'rgba(239, 68, 68, 0.2)', marginBottom: scale(16), gap: scale(8) }}>
                <Ionicons name="alert-circle" size={scale(18)} color="#FFFFFF" />
                <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(14), color: '#FFFFFF', flex: 1 }}>{error}</Text>
              </View>
            )}
            
            {/* Form */}
            <View style={{ gap: scale(20), marginBottom: scale(24) }}>
              <View style={{ gap: scale(8) }}>
                <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(12), color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>EMAIL</Text>
                <View 
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(255,255,255,0.15)', 
                    borderRadius: scale(12),
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.3)',
                    paddingHorizontal: scale(16),
                    height: scale(56),
                  }}
                >
                  <Ionicons name="mail-outline" size={scale(20)} color="rgba(255,255,255,0.6)" style={{ marginRight: scale(12) }} />
                  <TextInput
                    style={{ 
                      flex: 1, 
                      fontFamily: fonts.regular,
                      fontSize: fontScale(16), 
                      color: '#FFFFFF',
                      height: '100%',
                    }}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
              
              <View style={{ gap: scale(8) }}>
                <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(12), color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>PASSWORD</Text>
                <View 
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(255,255,255,0.15)', 
                    borderRadius: scale(12),
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.3)',
                    paddingHorizontal: scale(16),
                    height: scale(56),
                  }}
                >
                  <Ionicons name="lock-closed-outline" size={scale(20)} color="rgba(255,255,255,0.6)" style={{ marginRight: scale(12) }} />
                  <TextInput
                    style={{ 
                      flex: 1, 
                      fontFamily: fonts.regular,
                      fontSize: fontScale(16), 
                      color: '#FFFFFF',
                      height: '100%',
                    }}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    secureTextEntry={!showPassword}
                    textContentType="oneTimeCode"
                    autoComplete="off"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ marginLeft: scale(12) }}>
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={scale(20)} 
                      color="rgba(255,255,255,0.6)" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={{ gap: scale(8) }}>
                <Text style={{ fontFamily: fonts.semiBold, fontSize: fontScale(12), color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>CONFIRM PASSWORD</Text>
                <View 
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(255,255,255,0.15)', 
                    borderRadius: scale(12),
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.3)',
                    paddingHorizontal: scale(16),
                    height: scale(56),
                  }}
                >
                  <Ionicons name="lock-closed-outline" size={scale(20)} color="rgba(255,255,255,0.6)" style={{ marginRight: scale(12) }} />
                  <TextInput
                    style={{ 
                      flex: 1, 
                      fontFamily: fonts.regular,
                      fontSize: fontScale(16), 
                      color: '#FFFFFF',
                      height: '100%',
                    }}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm Password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    secureTextEntry={!showPassword}
                    textContentType="oneTimeCode"
                    autoComplete="off"
                  />
                </View>
              </View>
              
              {/* Terms Checkbox */}
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', gap: scale(12), marginTop: scale(8) }}
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                <View 
                  style={{ 
                    width: scale(24), 
                    height: scale(24), 
                    borderRadius: scale(6),
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                    backgroundColor: acceptTerms ? '#FFFFFF' : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {acceptTerms && <Ionicons name="checkmark" size={scale(16)} color="#10B95F" />}
                </View>
                <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(14), color: '#FFFFFF' }}>Accept Terms and Conditions</Text>
              </TouchableOpacity>
            </View>
            
            {/* Sign Up Button - Filled */}
            <TouchableOpacity 
              style={{ 
                backgroundColor: '#FFFFFF',
                paddingVertical: scale(18),
                borderRadius: scale(16),
                alignItems: 'center',
                marginBottom: scale(24),
                opacity: isLoading ? 0.6 : 1,
              }}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#10B95F" />
              ) : (
                <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(18), color: '#10B95F' }}>Sign Up</Text>
              )}
            </TouchableOpacity>
            
            {/* Login Link */}
            <Link href="/auth/login" asChild>
              <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: scale(8), marginTop: 'auto' }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: fontScale(14), color: 'rgba(255,255,255,0.7)' }}>Already have an account? </Text>
                <Text style={{ fontFamily: fonts.bold, fontSize: fontScale(14), color: '#FFFFFF' }}>Login</Text>
              </TouchableOpacity>
            </Link>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
