import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    StyleSheet,
    Dimensions,
    TextInput,
    TouchableOpacity,
    Modal,
    Button,
    Alert,
    ActivityIndicator,
    RefreshControl,
    BackHandler
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { auth,signOut } from '../../FirebaseConfig'; // Ensure this is imported correctly

const ChildrenGrid = () => {
    const [children, setChildren] = useState([]);
    const [filteredChildren, setFilteredChildren] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [password, setPassword] = useState('');
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
    const screenWidth = Dimensions.get('window').width;
    const navigation = useNavigation();

    useEffect(() => {
        fetchChildren();

        const backAction = () => {
            Alert.alert(
                "Confirm",
                "Do you want to logout?",
                [
                    {
                        text: "Cancel",
                        onPress: () => null,
                        style: "cancel"
                    },
                    {
                        text: "Yes",
                        onPress: async () => {
                            await logout();
                        }
                    }
                ]
            );
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const fetchChildren = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'children'));
            const childrenData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Sort children alphabetically by name
            childrenData.sort((a, b) => a.name.localeCompare(b.name));

            setChildren(childrenData);
            setFilteredChildren(childrenData);
        } catch (error) {
            console.error("Error fetching children: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery) {
            const filteredData = children.filter(child =>
                child.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredChildren(filteredData);
        } else {
            setFilteredChildren(children);
        }
    }, [searchQuery, children]);

    const handleChildPress = (child) => {
        setSelectedChild(child);
        setModalVisible(true);
    };

    const handlePasswordSubmit = () => {
        if (selectedChild) {
            const correctPassword = selectedChild.password;
            if (password === correctPassword) {
                navigation.navigate('Child Details', { childId: selectedChild.id });
                setModalVisible(false);
            } else {
                Alert.alert('Error', 'Incorrect password. Please try again.');
            }
        } else {
            Alert.alert('Error', 'No child selected.');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchChildren();
        setRefreshing(false);
    };

    const logout = async () => {
        try {
            await signOut(auth);
            navigation.navigate('login');
        } catch (error) {
            console.error("Logout error: ", error);
        }
    };

    const renderChild = ({ item }) => (
        <TouchableOpacity
            style={[styles.childContainer, { width: screenWidth / 2 - 20 }]}
            onPress={() => handleChildPress(item)}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1 }}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search by name"
                value={searchQuery}
                onChangeText={text => setSearchQuery(text)}
            />
            {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
            ) : (
                <FlatList
                    data={filteredChildren}
                    renderItem={renderChild}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.grid}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                />
            )}

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Enter password"
                            secureTextEntry={true}
                            value={password}
                            onChangeText={text => setPassword(text)}
                        />
                        <Button title="Submit" onPress={handlePasswordSubmit} />
                        <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    searchInput: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        margin: 10,
        backgroundColor: '#f9f9f9',
    },
    grid: {
        padding: 10,
    },
    childContainer: {
        margin: 5,
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    name: {
        marginTop: 5,
        padding: 10,
        fontSize: 16,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    passwordInput: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        width: '100%',
        marginBottom: 20,
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChildrenGrid;
