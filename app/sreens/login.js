import {View, TextInput, ActivityIndicator, Button, StyleSheet, Alert, TouchableOpacity,Text} from 'react-native';
import React, { useState } from 'react';
import { auth, signIn, sendEmailVerification,sendPasswordResetEmail } from '../../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const signin = async () => {
        setLoading(true);
        try {
            const userCredential = await signIn(auth, email, password);
            const user = userCredential.user;

            if (user.emailVerified && user.email === "amrelbaroudy37@gmail.com") {
                navigation.navigate('Admin');
            } else if (user.emailVerified) {
                navigation.navigate('children');
            } else {
                Alert.alert(
                    'Email Verification',
                    'Please verify your email address. Would you like us to resend the verification email?',
                    [
                        {
                            text: 'Resend Email',
                            onPress: async () => {
                                try {
                                    await sendEmailVerification(user);
                                    Alert.alert('Success', 'Verification email sent. Please check your inbox.');
                                } catch (error) {
                                    // console.error('Error sending verification email', error);
                                    Alert.alert('Error', 'Failed to send verification email. Please try again.');
                                }
                            }
                        },
                        { text: 'Cancel', style: 'cancel' }
                    ]
                );
            }
        } catch (error) {
            // console.error(error);
            if (error.code === 'auth/invalid-email') {
                Alert.alert(
                    'Error',
                    'Please check your email address and try again.',
                    [{ text: 'OK' }]
                );
            } else if (error.code === 'auth/wrong-password') {
                Alert.alert(
                    'Error',
                    'Please check your password and try again.',
                    [{ text: 'OK' }]
                );
            } else if (error.code === 'auth/user-not-found') {
                Alert.alert(
                    'Error',
                    'Please check your email address and try again.',
                    [{ text: 'OK' }]
                );
            } else if (error.code === 'auth/too-many-requests') {
                Alert.alert(
                    'Error',
                    'Too many requests. Please try again later.',
                    [{ text: 'OK' }]
                );
            } else if (error.code === 'auth/network-request-failed') {
                Alert.alert(
                    'Error',
                    'Network request failed. Please check your internet connection and try again.',
                    [{ text: 'OK' }]
                );
            } else if (error.code === 'auth/user-disabled') {
                Alert.alert(
                    'Error',
                    'Your account has been disabled. Please contact support.',
                    [{ text: 'OK' }]
                );
            } else if (error.code === 'auth/invalid-credential') {
                Alert.alert(
                    'Error',
                    'Check your Email&Password then try again.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', 'An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
        } catch (error) {
            console.error('Error sending password reset email', error);
            Alert.alert('Error', 'Failed to send password reset email. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                value={email}
                style={styles.input}
                placeholder='Email'
                autoCapitalize='none'
                onChangeText={(text) => setEmail(text)}
            />
            <TextInput
                secureTextEntry={true}
                value={password}
                style={styles.input}
                placeholder='Password'
                autoCapitalize='none'
                onChangeText={(text) => setPassword(text)}
            />
            {loading ? (
                <ActivityIndicator size={"large"} color={"#0000ff"} />
            ) : (
                <>
                    <Button title='Login' onPress={signin} />
                    <TouchableOpacity onPress={handleForgotPassword}>
                        <Text style={{
                                color: 'blue',
                                paddingTop: 20,
                                alignSelf: 'flex-end'
                            }}
                            onPress={handleForgotPassword} // Add this to make it clickable
                        >
                            Forgot Password?
                        </Text>

                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    input: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
    },
});

export default Login;
