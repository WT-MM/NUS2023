import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet, Alert } from 'react-native';

const GameScreen = () => {
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);

    useEffect(() => {
        generateRandomNumbers();
    }, []);

    const generateRandomNumbers = () => {
        setNum1(Math.floor(Math.random() * 100));
        setNum2(Math.floor(Math.random() * 100));
    }

    const handlePress = (num) => {
        if (num === Math.max(num1, num2)) {
            Alert.alert("Correct!");
        } else {
            Alert.alert("Wrong!");
        }

        generateRandomNumbers();
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Which number is bigger?</Text>
            <View style={styles.buttonContainer}>
                <Button title={num1.toString()} onPress={() => handlePress(num1)} />
                <Button title={num2.toString()} onPress={() => handlePress(num2)} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 30,
    },
});

export default GameScreen;
