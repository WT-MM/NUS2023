import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { serverTimestamp, addDoc, collection, getDoc, doc, setDoc, increment } from 'firebase/firestore';
import { db, auth } from '../firebase';

const totalNumPrompts = 241;

const TextGameScreen = () => {
    const [texts, setTexts] = useState([{ 'text': "" }, { 'text': "" }]);
    const [adjustedStyles, setAdjustedStyles] = useState(styles);
    const [isLandscape, setIsLandscape] = useState(false);
    const [textStyles, setTextStyles] = useState({fontSize: 20}, {fontSize:20}); // Initial font size
    const [caption, setCaption] = useState(" ");

    useEffect(() => {
        randomTexts();
        if (Dimensions.get('window').width > Dimensions.get('window').height) {
            setAdjustedStyles(landscapeStyles);
            setIsLandscape(true);
        }
        const subscription = Dimensions.addEventListener(
            'change',
            ({ window, screen }) => {
                if (window.width > window.height) {
                    setIsLandscape(true);
                    setAdjustedStyles(landscapeStyles);
                } else {
                    setIsLandscape(false);
                    setAdjustedStyles(styles);
                }
            },
        );
    }, []);

    var randomEntry = function (obj) {
        var keys = Object.keys(obj);
        return obj[keys[ keys.length * Math.random() << 0]];
    };

    const randomTexts = async () => {
        let randomPrompt =  String(((Math.floor(Math.random() *(totalNumPrompts-1))) + 1)).padStart(6, '0')
        const docSnap = await getDoc(doc(db, 'text', randomPrompt));

        const randData = docSnap.data()
        let randOne = Math.floor(Math.random() * randData['response'].length);
        let randTwo = Math.floor(Math.random() * randData['response'].length);

        while (randData['model'][randOne] == randData['model'][randTwo]) {
            randTwo = Math.floor(Math.random() * randData['response'].length);
        }

        setCaption(randData['prompt']);
        setTexts([{ 'text': randData['response'][randOne], 'model' : randData['model'][randOne] }, { 'text': randData['response'][randTwo], 'model' : randData['model'][randTwo] }]);
        
        setTextStyles([{fontSize: calculateFontSize(randData['response'][randOne])}, {fontSize: calculateFontSize(randData['response'][randTwo])}])
    }

    //Need to figure out a more workable solution
    //Kind of just banging my head at this point
    
    const calculateFontSize = (text) => {
        console.log(text.length)
        console.log(text)
        console.log(text.split(/\r\n|\r|\n/).length)
        const lines = text.split(/\r\n|\r|\n/).length
        if (lines < 5) {
            if (text.length <= 25) {
                var fontsize = 40; // Base font size for short text
            }
            else if (text.length <= 50) {
                var fontsize = 35; // Base font size for short text
            }else if (text.length <= 75) {
                var fontsize = 25; // Smaller size for medium text
            }
            else if (text.length <= 100) {
                var fontsize = 18; // Smaller size for longer text
            }
            else {
                var fontsize = 10; // Even smaller size for very long text
            }
        }else if (lines < 10) {
            if (text.length <= 400){
            var fontsize = 18-lines
            }else{
                var fontsize = 10
            }
        }else if (lines < 15) {
            if (text.length <= 500){
            var fontsize = 10
            }else{
                var fontsize = 8
            }
            
        }else if (lines < 20) {
            var fontsize = 12
        }else if (lines < 30) {
            var fontsize = 10
        }else{
            var fontsize = 8
        }
        return fontsize + (isLandscape ? 12 : 0) - (lines > 10 ? 5 : 0) - (lines > 15 ? 5 : 0) - (lines > 20 ? 5 : 0) - (lines > 30 ? 5 : 0)

    }

    const handlePress = async (winner, loser) => {
        let timestamp = serverTimestamp()

        await addDoc(collection(db, "users/", auth.currentUser ? auth.currentUser.uid : "anon", "history"),
            {
                "winner": winner.model,
                "loser": loser.model,
                "timestamp": timestamp,
                "gameType": "text"
        })

        if(auth.currentUser){
            await setDoc(doc(db, "users/", auth.currentUser.uid), {
                "matches": increment(1)
            }, {merge: true})
        }

        await addDoc(collection(db, "matches"), {
            "winner": winner.model,
            "loser": loser.model,
            "timestamp": timestamp,
            "gameType": "text",
            "user": auth.currentUser ? auth.currentUser.uid : "anon"
        })

        randomTexts()
    }

    return (
        <View style={adjustedStyles.container}>
            <TouchableOpacity onPress={() => handlePress(texts[0], texts[1])}>
                <Animatable.View 
                        animation='pulse'
                        duration={500}
                        style={adjustedStyles.textBox}>
                <Animatable.Text 
                    animation="pulse" 
                    duration={500} 
                    style={[styles.text, textStyles[0]]} 
                >
                    {texts[0].text}
                </Animatable.Text>
            </Animatable.View>
            </TouchableOpacity>
            <View style={adjustedStyles.promptBox}>
                <Text style={{textAlign:"center"}}>{caption}</Text>
            </View>
            <TouchableOpacity onPress={() => handlePress(texts[1], texts[0])}>
                <Animatable.View 
                    animation='pulse'
                    duration={500}
                    style={adjustedStyles.textBox}>
                    <Animatable.Text 
                        animation="pulse" 
                        duration={500} 
                        style={[styles.text, textStyles[1]]} 
                    >
                        {texts[1].text}
                    </Animatable.Text>
                </Animatable.View>
            </TouchableOpacity>
        </View>
    );
}

let landscapeStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    textBox:{
        backgroundColor: '#fff',
        width:"35vw",
        height:"80vh",
        borderRadius: 10,
    },
    promptBox:{
        textAlign: 'center',
        padding:"0 10 0 10",
        width:"20vw",
    }
});

let styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    textBox:{
        backgroundColor: '#fff',
        width:"80vw",
        height:"35vh",
        borderRadius: 10,
    },
    containerLandscape: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        textAlign: 'center',
        margin:"auto",
        width:"95%"

    },
    promptBox:{
        textAlign: 'center',
        margin:"10 0 10 0",
        width:"80vw",
    }
});

export default TextGameScreen;
