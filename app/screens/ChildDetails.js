import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Button, ActivityIndicator, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../FirebaseConfig'; // Adjust the import path according to your project structure

const ChildDetails = ({ route }) => {
    const { childId } = route.params;

    const [child, setChild] = useState(null);
    const [weeklyDetails, setWeeklyDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);

    const fetchChildDetails = useCallback(async () => {
        if (!childId) {
            console.error('childId is not defined');
            setLoading(false);
            return;
        }

        try {
            // Fetching child data
            const childDocRef = doc(db, 'children', childId);
            const childDoc = await getDoc(childDocRef);

            if (childDoc.exists()) {
                const data = childDoc.data();
                setChild(data);

                // Fetching weekly details
                const weeklyDetailsQuery = query(
                    collection(db, `children/${childId}/weeklyDetails`),
                    orderBy('date', 'desc'),
                    limit(7)
                );
                const weeklyDetailsSnapshot = await getDocs(weeklyDetailsQuery);

                if (!weeklyDetailsSnapshot.empty) {
                    const details = weeklyDetailsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setWeeklyDetails(details);
                } else {
                    console.log('No weekly details found.');
                }
            } else {
                console.error('No such child document!');
            }
        } catch (error) {
            console.error("Error fetching child details: ", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [childId]);

    useEffect(() => {
        fetchChildDetails();
    }, [fetchChildDetails]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchChildDetails().then(r => setRefreshing(false));
    }, [fetchChildDetails]);

    const handleDayPress = (detail) => {
        setSelectedDay(detail);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedDay(null);
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {child ? (
                <>
                    <Image source={{ uri: child.imageUrl }} style={styles.image} />
                    <Text style={styles.name}>{child.name}</Text>
                    <Text style={styles.age}>Age: {child.age}</Text>
                    <View style={styles.weekTimeline}>
                        <Text style={styles.weekHeader}>Week Timeline:</Text>
                        {weeklyDetails.length > 0 ? (
                            weeklyDetails.map((detail, index) => {
                                const dateObj = new Date(detail.id);
                                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.weekDateButton}
                                        onPress={() => handleDayPress(detail)}
                                    >
                                        <Text style={styles.weekDateText}>
                                            {dateObj.toDateString()} - {dayName}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <Text>No weekly details available.</Text>
                        )}
                    </View>

                    <Modal
                        visible={isModalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={handleCloseModal}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                {selectedDay ? (
                                    <>
                                        <Text style={styles.modalText}>Date: {new Date(selectedDay.id).toDateString()}</Text>
                                        <Text style={styles.statusText}>Status: {selectedDay.status}</Text>
                                        <Text style={styles.notesText}>Notes: {selectedDay.notes}</Text>
                                    </>
                                ) : (
                                    <Text>No details available</Text>
                                )}
                                <Button title="Close" onPress={handleCloseModal} />
                            </View>
                        </View>
                    </Modal>
                </>
            ) : (
                <Text style={styles.errorText}>Child not found</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        borderRadius: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    age: {
        fontSize: 18,
        marginVertical: 5,
    },
    weekTimeline: {
        marginTop: 20,
    },
    weekHeader: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    weekDateButton: {
        backgroundColor: '#ddd',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
    },
    weekDateText: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    modalText: {
        fontSize: 18,
        marginVertical: 10,
    },
    statusText: {
        fontSize: 16,
        marginVertical: 5,
    },
    notesText: {
        fontSize: 16,
        marginVertical: 5,
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default ChildDetails;
