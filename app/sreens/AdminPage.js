import React, { useEffect, useState } from 'react';
import {
    View,
    Image,
    Text,
    TextInput,
    Button,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    RefreshControl,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Pressable,
    BackHandler,

} from 'react-native';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, getDocs, doc, updateDoc, setDoc, addDoc } from 'firebase/firestore';
import { db, auth,signOut } from '../../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from "expo-image-picker";

const AdminPage = () => {
    const [children, setChildren] = useState([]);
    const [filteredChildren, setFilteredChildren] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedChild, setSelectedChild] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newNotes, setNewNotes] = useState('');
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newAge, setNewAge] = useState('');
    const [newImageURL, setNewImageURL] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [isAddChildMode, setIsAddChildMode] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [image, setImage] = useState(null);  // Ensure this is defined

    const navigation = useNavigation();

    useEffect(() => {
        fetchChildren();
        checkIfAdmin();
        const backAction = () => {
            handleBackPress();
            return true; // Prevent default back action
        };

        BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
    }, []);

    const fetchChildren = async () => {
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
            Alert.alert('Error', 'Failed to fetch children.');
        }
    };

    const checkIfAdmin = () => {
        const user = auth.currentUser;
        if (user) {
            const email = user.email;
            if (email === 'amrelbaroudy37@gmail.com') { // Replace with your admin's email
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
                Alert.alert('Access Denied', 'You are not authorized to access this page.');
                navigation.navigate('children'); // Redirect non-admin users to the home page
            }
        } else {
            setIsAdmin(false);
            Alert.alert('Not Logged In', 'Please log in to access this page.');
            navigation.navigate('login'); // Redirect to login if not authenticated
        }
    };
    

    const handleBackPress = () => {
        Alert.alert(
            'Confirm Logout',
            'Do you want to logout?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Logout cancelled'),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            Alert.alert('Logged Out', 'You have been logged out.');
                            navigation.navigate('login'); // Redirect to login page
                        } catch (error) {
                            console.error('Error logging out:', error);
                            Alert.alert('Error', 'Failed to logout.');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleAddWeeklyDetail = async () => {
        if (!selectedChild) {
            Alert.alert('Error', 'Please select a child.');
            return;
        }

        try {
            const weeklyDetailsRef = collection(db, 'children', selectedChild.id, 'weeklyDetails');
            const currentDate = new Date().toISOString().split('T')[0];
            const docRef = doc(weeklyDetailsRef, currentDate);

            await setDoc(docRef, {
                status: newStatus,
                notes: newNotes,
                date: new Date(), // Store the full date as a field
            });

            Alert.alert('Success', 'This Day Detail added successfully.');
            setNewStatus('');
            setNewNotes('');
            setIsAddMode(false);
        } catch (error) {
            console.error("Error adding weekly detail: ", error);
            Alert.alert('Error', 'Failed to add weekly detail.');
        }
    };

    const handleUpdateChild = async () => {
        if (!selectedChild) {
            Alert.alert('Error', 'Please select a child.');
            return;
        }

        try {
            const childRef = doc(db, 'children', selectedChild.id);
            const updates = {};

            if (newName.trim()) updates.name = newName;
            if (newAge.trim()) updates.age = newAge;
            if (newPassword.trim()) updates.password = newPassword;
            if (newImageURL.trim()) updates.imageUrl = newImageURL;

            if (Object.keys(updates).length === 0) {
                Alert.alert('No Changes', 'No updates were made because no fields were changed.');
                return;
            }

            await updateDoc(childRef, updates);
            Alert.alert('Success', 'Child details updated successfully.');
            setNewName('');
            setNewAge('');
            setNewPassword('');
            setNewImageURL('');
            setIsUpdateMode(false);
        } catch (error) {
            console.error("Error updating child: ", error);
            Alert.alert('Error', 'Failed to update child details.');
        }
    };

    const handleAddChild = async () => {
        // Validate inputs
        if (!newName || !newAge || !newPassword) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        const childData = {
            name: newName,
            age: newAge,
            password: newPassword,
            imageURL: image ? image.uri : newImageURL,
        };

        try {
            await addDoc(collection(db, 'children'), childData);
            Alert.alert('Success', 'Child added successfully!');
            setIsAddChildMode(false);
            // Reset form fields
            setNewName('');
            setNewAge('');
            setNewPassword('');
            setNewImageURL('');
            setImage(null); // Reset image state
        } catch (error) {
            Alert.alert('Error', 'Failed to add child.');
            console.error(error);
        }
    };


    const handleSearch = (text) => {
        setSearchText(text);
        const filtered = children.filter(child =>
            child.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredChildren(filtered);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchChildren();
        setRefreshing(false);
    };
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0]); // Ensure this line is correctly setting image state
        }
    };
    const renderChild = ({ item }) => (
        <View style={styles.childContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Child Details', { childId: item.id })}>
                <View style={styles.childInfo}>
                    <Image
                        source={{ uri: item.imageUrl }} // Assumes 'imageUrl' contains the URL of the child's photo
                        style={styles.childPhoto}
                    />
                    <Text style={styles.childName}>{item.name}</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.buttonsContainer}>
                <Button title="Add" onPress={() => {
                    setSelectedChild(item);
                    setIsAddMode(true);
                    setIsUpdateMode(false);
                }} />
                <Button title="Update" onPress={() => {
                    setSelectedChild(item);
                    setIsUpdateMode(true);
                    setIsAddMode(false);
                }} />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Admin Page</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Search children by name"
                value={searchText}
                onChangeText={handleSearch}
            />
            <FlatList
                data={filteredChildren}
                renderItem={renderChild}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            />

            {isAddMode && selectedChild && (
                <View style={styles.formContainer}>
                    <Text style={styles.selectedChild}>Selected Child: {selectedChild.name}</Text>
                    <Text style={styles.label}>Status:</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter new status"
                        value={newStatus}
                        onChangeText={text => setNewStatus(text)}
                    />
                    <Text style={styles.label}>Notes:</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter new notes"
                        value={newNotes}
                        onChangeText={text => setNewNotes(text)}
                    />
                    <Button title="Add This Day Details" onPress={handleAddWeeklyDetail} />
                    <Pressable
                        style={({ pressed }) => [
                            pressed && { opacity: 0.5 },
                        ]}
                        onPress={() => setIsAddMode(false)}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                </View>
            )}

            {isUpdateMode && selectedChild && (
                // <KeyboardAvoidingView
                //     style={styles.container}
                //     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                // >
                    <ScrollView
                        contentContainerStyle={styles.formContainer}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.selectedChild}>Selected Child: {selectedChild.name}</Text>

                        <Text style={styles.label}>Name:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new name"
                            value={newName}
                            onChangeText={text => setNewName(text)}
                        />

                        <Text style={styles.label}>Age:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new age"
                            value={newAge}
                            onChangeText={text => setNewAge(text)}
                            keyboardType="numeric"  // Ensures only numeric input
                        />

                        <Text style={styles.label}>Password:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChangeText={text => setNewPassword(text)}
                            secureTextEntry={true}  // Ensures password is hidden
                        />

                        <Text style={styles.label}>Image URL:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new image URL"
                            value={newImageURL}
                            onChangeText={text => setNewImageURL(text)}
                        />

                        <Button title="Update Child Details" onPress={handleUpdateChild} />

                        <Pressable
                            style={({ pressed }) => [

                                pressed && { opacity: 0.5 },
                            ]}
                            onPress={() => setIsUpdateMode(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                    </ScrollView>)}
                {/*</KeyboardAvoidingView>*/}

            {isAddChildMode && (
                <ScrollView
                    contentContainerStyle={styles.formContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.selectedChild}>Add New Child</Text>

                    <Text style={styles.label}>Name:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter name"
                        value={newName}
                        onChangeText={text => setNewName(text)}
                    />

                    <Text style={styles.label}>Age:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter age"
                        value={newAge}
                        onChangeText={text => setNewAge(text)}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Password:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter password"
                        value={newPassword}
                        onChangeText={text => setNewPassword(text)}
                        secureTextEntry={true}
                    />

                    <Text style={styles.label}>Image URL:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter image URL"
                        value={newImageURL}
                        onChangeText={text => setNewImageURL(text)}
                    />

                    <Text style={styles.label}>Or Upload an Image:</Text>
                    <Button style={styles.button} title="Pick an image from gallery" onPress={pickImage} />

                    {image && (
                        <Image
                            source={{ uri: image.uri }}
                            style={styles.image}
                        />
                    )}

                    <Button title="Add Child" onPress={handleAddChild} />

                    <Pressable
                        style={({ pressed }) => [
                            pressed && { opacity: 0.5 },
                        ]}
                        onPress={() => setIsAddChildMode(false)}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                </ScrollView>
            )}
            {!isAddChildMode && (
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={() => setIsAddChildMode(true)}
                >
                    <Text style={styles.floatingButtonText}>+</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    searchBar: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    list: {
        marginBottom: 20,
    },
    childContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 10,
    },
    childInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    childName: {
        fontSize: 18,
        marginLeft: 10,
        color: '#333',
    },
    childPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    image: {
        width: 100,
        height: 100,
        marginVertical: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 160,
        marginBottom: 15,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007bff',
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    formContainer: {
        marginTop: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
        color: '#333',
    },
    selectedChild: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#007bff',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007bff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    floatingButtonText: {
        fontSize: 30,
        color: '#fff',
        fontWeight: 'bold',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#fff',
        backgroundColor: '#dc3545',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
});


export default AdminPage;
