import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import {Dimensions} from 'react-native';
import { serverTimestamp, addDoc, collection, setDoc, doc, increment } from 'firebase/firestore';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

import { db, auth, storage } from '../firebase';

import promptsJson from '../imageReference.json';
import imagesJson from '../imagePrompts.json';

const imagesRef = ref(storage, 'images');

const ImageGameScreen = () => {
    const [images, setImages] = useState([{'url':""}, {'url':""}]);
    const [imageStyle, setImageStyle] = useState({width:"80vw",resizeMode: 'cover',aspectRatio: 1/1,borderRadius:10}); // [width, height
    const [isLandscape, setIsLandscape] = useState(false);
    const [imgStyle, setImgStyle] = useState(null);
    const [caption, setCaption] = useState("Which one is more likely to be said by a human?");
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

    const randomImages = async () => {        
        if(imgStyle == null){
            var styleName = Object.keys(promptsJson)[Math.floor(Math.random() * Object.keys(promptsJson).length)];
        }else{
            var styleName = imgStyle;
        }
        let randStyle = promptsJson[styleName];
        let randCat = Object.keys(randStyle)[Math.floor(Math.random() * Object.keys(randStyle).length)];
        randCat = "Animals"

        let randPrompt = Object.keys(randStyle[randCat])[Math.floor(Math.random() * Object.keys(randStyle[randCat]).length)]; 

        /*
        while(Object.keys(randStyle[randCat][randPrompt]).length < 2){
            randCat = Object.keys(randStyle)[Math.floor(Math.random() * Object.keys(randStyle).length)];
            randPrompt = Object.keys(randStyle[randCat])[Math.floor(Math.random() * Object.keys(randStyle[randCat]).length)];
        }*/

        
        const model1 = Object.keys(randStyle[randCat][randPrompt])[Math.floor(Math.random() * Object.keys(randStyle[randCat][randPrompt]).length)];
        let model2 = Object.keys(randStyle[randCat][randPrompt])[Math.floor(Math.random() * Object.keys(randStyle[randCat][randPrompt]).length)];
        let infiniteLoop = 0;
        while(model1 == model2){
            model2 = Object.keys(randStyle[randCat][randPrompt])[Math.floor(Math.random() * Object.keys(randStyle[randCat][randPrompt]).length)];
            infiniteLoop++;
            if(infiniteLoop > 100){
                console.log("infinite loop")
                console.log("Multiple models for " + styleName +" " + randCat + " " + randPrompt + " do not exist")
                randomImages();
            }
        }

        const randNum1 = Math.floor(Math.random()*Object.keys(randStyle[randCat][randPrompt][model1]).length);
        const randNum2 = Math.floor(Math.random()*Object.keys(randStyle[randCat][randPrompt][model2]).length);
        

        /*
       let model1="sd1.5";
         let model2="sd2.1";
            let randCat="Animals";
            let randPrompt="1";
            let styleName="Unstyled";
            let randNum1=1;
            let randNum2=2;*/
        const img1 = ref(storage, 'images/' + model1 + '_' +randCat +"_"+randPrompt+"_"+styleName+"_"+randNum1 +'.png');
        const img2 = ref(storage, 'images/' + model2 + '_' +randCat +"_"+randPrompt+"_"+styleName+"_"+randNum2 +'.png');

        const caption = imagesJson[randCat][randPrompt]

        const img1Url = await getDownloadURL(img1);
        const img2Url = await getDownloadURL(img2);

        setCaption(caption)
        setImages([{'model':model1, "prompt" : randPrompt, "category" : randCat, "style" : styleName, 'url': img1Url},
        {'model':model2, "prompt" : randPrompt, "category" : randCat, "style" : styleName, 'url': img2Url}])
    }

    const handlePress = async (winner, loser) => {

        let timestamp = serverTimestamp()
        await addDoc(collection(db, "users/", (auth.currentUser ? auth.currentUser.uid : 'anon'), "history"),
         {"winner": winner.model, 
         "loser": loser.model, 
         "timestamp": timestamp, 
         "gameType" : "image",
         "category": winner.category, 
         "prompt": winner.prompt,
        "style": winner.style})

        if(auth.currentUser){
            await setDoc(doc(db, "users/", auth.currentUser.uid), {
                "matches": increment(1)
            }, {merge: true})
        }

         await addDoc(collection(db, "matches"),{
                "winner": winner.model,
                "loser": loser.model,
                "timestamp": timestamp,
                "gameType" : "image",
                "category": winner.category,
                "prompt": winner.prompt,
                "style": winner.style,
                "user": (auth.currentUser ? auth.currentUser.uid : "anon")
         })

        randomImages()
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
            <Text style={styles.text}>{caption}</Text>
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