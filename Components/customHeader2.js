// components/CustomHeader.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {FontAwesome} from "@expo/vector-icons";

const CustomHeader = ({ title }) => {
    const navigation = useNavigation();

    const handleBackPress = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <FontAwesome name="chevron-left" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        backgroundColor: '#4CAF50',
        borderBottomWidth: 1,
        height: 90,
        borderBottomColor: '#ddd',
        borderBottomRightRadius: 50,
        borderBottomLeftRadius: 50,
    },
    backButton: {
        position: 'absolute',
        left: 15,
    },
    backIcon: {
        width: 25,
        height: 25,
        tintColor: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default CustomHeader;
