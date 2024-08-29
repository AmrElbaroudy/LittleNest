import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import { auth, signOut } from '../FirebaseConfig';

import { MenuItem } from './customMenuItems';

const CustomHeader = ({ title }) => {
    const navigation = useNavigation();

    const logout = async () => {
        try {
            await signOut(auth);
            navigation.navigate('login');
        } catch (error) {
            console.error("Logout error: ", error);
        }
    };

    return (
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>{title}</Text>

            <Menu>
                <MenuTrigger style={styles.menuTrigger}>
                    <FontAwesome name="list" size={24} color="black" />
                </MenuTrigger>
                <MenuOptions
                    customStyles={{
                        optionsContainer: {
                            borderRadius: 10,
                            marginTop: 40,
                            marginLeft: -10,
                            backgroundColor: 'white',
                            shadowOpacity: 0.2,
                            shadowOffset: { width: 0, height: 0 },
                            width: 190,
                        },
                    }}>

                    <MenuItem
                        text="Sign Out"
                        action={() => logout()}
                        value={null}
                        icon={<AntDesign name="logout" size={20} color="#737373" />}
                    />
                </MenuOptions>
            </Menu>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Space between title and menu
        paddingVertical: 15,
        paddingHorizontal: 20, // Add padding to the sides
        backgroundColor: '#4CAF50',
        borderBottomWidth: 1,
        height: 90,
        borderBottomColor: '#ddd',
        borderBottomRightRadius: 50,
        borderBottomLeftRadius: 50,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    menuTrigger: {
        paddingTop: 10,
        alignItems: 'flex-end',
    },
});

export default CustomHeader;
