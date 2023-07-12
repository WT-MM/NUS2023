import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import {Dimensions} from 'react-native';
import { serverTimestamp, addDoc, collection } from 'firebase/firestore';

import { db, auth } from '../firebase';



const ImageGameScreen = () => {
    const [images, setImages] = useState([{'url':""}, {'url':""}]);
    const [imageStyle, setImageStyle] = useState({width:"80vw",resizeMode: 'cover',aspectRatio: 1/1,borderRadius:10}); // [width, height
    const [isLandscape, setIsLandscape] = useState(false);
    useEffect(() => {
        randomImages();
        const subscription = Dimensions.addEventListener(
            'change',
            ({window, screen}) => {
                if(window.width > window.height){
                    setIsLandscape(true);
                    setImageStyle({width:"40vw",resizeMode: 'cover',aspectRatio: 1/1,borderRadius:10})
                }else{
                    setIsLandscape(false);
                    setImageStyle({width:"80vw",resizeMode: 'cover',aspectRatio: 1/1,borderRadius:10,maxHeight:"40vh"})
                }
            },
          );
    }, []);

    const randomImages = () => {
        setImages([{'model':"test", "prompt":2, "cat":2, 'url' : "https://domf5oio6qrcr.cloudfront.net/medialibrary/6372/202ebeef-6657-44ec-8fff-28352e1f5999.jpg"}
        , {'model':"test", "prompt":2, "cat":2, 'url' : "https://i5.walmartimages.ca/images/Enlarge/094/514/6000200094514.jpg"}])
        /*
        db.collection('images').get().then((querySnapshot) => {
            let images = [];
            querySnapshot.forEach((doc) => {
                images.push(doc.data());
            });
            setImages(images.sort(() => Math.random() - 0.5));
        });*/
    }

    const handlePress = async (winner, loser) => {

        let timestamp = serverTimestamp()
        
        await addDoc(collection(db, "users/", auth.currentUser.uid, "history"),
         {"winner": winner.model, 
         "loser": loser.model, 
         "timestamp": timestamp, 
         "gameType" : "image",
         "category": winner.cat, 
         "prompt": winner.prompt})

         await addDoc(collection(db, "matches"),{
                "winner": winner.model,
                "loser": loser.model,
                "timestamp": timestamp,
                "gameType" : "image",
                "category": winner.cat,
                "prompt": winner.prompt,
                "user": auth.currentUser ? auth.currentUser.uid : "anon"
         })

        //randomImages()
    }

    return (
        <View style={isLandscape ? styles.containerLandscape : styles.container}>
            <TouchableOpacity onPress={() => handlePress(images[0], images[1])}>
                <Animatable.Image 
                    animation="pulse" 
                    duration={500} 
                    source={images[0].url} 
                    style={imageStyle} 
                />
            </TouchableOpacity>
            <Text style={styles.text}>Which fits the prompt better?</Text>
            <TouchableOpacity onPress={() => handlePress(images[1], images[0])}>
                <Animatable.Image 
                    animation="pulse" 
                    duration={500} 
                    source={images[1].url} 
                    style={imageStyle} 
                />
            </TouchableOpacity>
        </View>
    );
}

let styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    containerLandscape: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        fontSize: 20,
        textAlign: 'center',
    },
});

export default ImageGameScreen;