import { View, TextInput, ActivityIndicator, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { auth, createUser } from '../../FirebaseConfig';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation(); // Access navigation

    const signup = async () => {
        setLoading(true);
        try {
            const userCredential = await createUser(auth, email, password);
            console.log(userCredential);
            Alert.alert('Success', 'User created successfully', [
                { text: 'OK', onPress: () => navigation.navigate('login') } // Navigate to Login screen
            ]);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert(
                    'Error',
                    'This email is already in use. Please go to the login page.',
                    [{ text: 'Go to Login', onPress: () => navigation.navigate('login') }]
                );
            } else if (error.code === 'auth/weak-password') {
                Alert.alert('Error', 'Password should be at least 6 characters.', [{ text: 'OK' }]);
            } else {
                Alert.alert('Error', 'An error occurred. Please try again later.');
            }
        } finally {
            setLoading(false);
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
                <Button title='Sign Up' onPress={signup} />
            )}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('login')}>
                    <Text style={styles.link}>Go to Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 16,
    },
    input: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: '#000',
    },
    link: {
        fontSize: 16,
        color: '#0066cc',
        marginTop: 8,
    },
});

export default Signup;
