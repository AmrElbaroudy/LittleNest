import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomHeader from './Components/customHeader'; // Adjust the path if needed
import CustomHeader2 from './Components/customHeader2'; // Adjust the path if needed
import CustomHeaderMain from './Components/customHeaderMain'; // Adjust the path if needed
import Signup from "./app/sreens/signUp";
import { MenuProvider } from 'react-native-popup-menu';

import Login from "./app/sreens/login";
import ChildrenGrid from "./app/sreens/ChildrenGrid";
import ChildDetails from "./app/sreens/ChildDetails";
import AdminPage from "./app/sreens/AdminPage";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <MenuProvider>
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="login"
                screenOptions={({ route }) => ({
                    header: () => {
                        const routeName = route.name;

                        // Conditionally render headers based on route name

                        switch (routeName) {
                            case 'Child Details':
                                return <CustomHeader2 title={routeName} />;
                            case 'children':
                                return <CustomHeaderMain title={routeName} />;

                            default:
                                return <CustomHeader title={routeName} />;

                        }
                    },
                })}
            >
                <Stack.Screen name="signup" component={Signup} options={{ title: 'Sign Up' }} />
                <Stack.Screen name="login" component={Login} options={{ title: 'Login' }} />
                <Stack.Screen name="children" component={ChildrenGrid} options={{ title: 'Children Grid' }} />
                <Stack.Screen name="Admin" component={AdminPage} options={{ title: 'Admin Page' }} />
                <Stack.Screen name="Child Details" component={ChildDetails} options={{ title: 'Child Details' }} />
            </Stack.Navigator>
        </NavigationContainer>
        </MenuProvider>
    );
}
