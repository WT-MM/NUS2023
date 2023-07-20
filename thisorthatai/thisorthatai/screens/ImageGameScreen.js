import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { serverTimestamp, addDoc, collection, setDoc, doc, increment } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

import { db, auth, storage } from '../firebase';

import promptsJson from '../imageReference.json';
import imagesJson from '../imagePrompts.json';

const styles = StyleSheet.create({
  containerLandscape: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    paddingRight: 20,
    paddingLeft: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    paddingRight: 20,
    paddingLeft: 20,
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin:8,
    fontWeight:350,  },
    img: {
        width:"78vw",
        resizeMode: 'cover',
        aspectRatio: 1/1,
        borderRadius:10,
        maxHeight:"37vh"
    },
    imgLandscape: {
        width:"38vw",
        resizeMode: 'cover',
        aspectRatio: 1/1,
        borderRadius:10,
        maxHeight:"78vh"
    },

});

const ImageGameScreen = () => {
  const [gameState, setGameState] = useState({
    images: [{'url':""}, {'url':""}],
    futureImages: null,
    isLandscape: false,
    imgStyle: null,
    caption: "",
    imageCSS: Dimensions.get('window').width > Dimensions.get('window').height ? styles.imgLandscape : styles.img,
  });
  
  // Create refs
  const animationRef1 = useRef(null);
  const backRef1 = useRef(null);
  const animationRef2 = useRef(null);
const backRef2 = useRef(null);

  const pullImages = useCallback(async () => {
    if(imgStyle == null){
        var styleName = Object.keys(promptsJson)[Math.floor(Math.random() * Object.keys(promptsJson).length)];
    }else{
        var styleName = imgStyle;
    }
    let randStyle = promptsJson[styleName];
    let randCat = Object.keys(randStyle)[Math.floor(Math.random() * Object.keys(randStyle).length)];
    
    const available= ["Animals", "Landscapes", "Objects", "People"]
    
    randCat = available[Math.floor(Math.random() * available.length)];

    let randPrompt = Object.keys(randStyle[randCat])[Math.floor(Math.random() * Object.keys(randStyle[randCat]).length)]; 

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
            break;
        }
    }

    const randNum1 = Math.floor(Math.random()*Object.keys(randStyle[randCat][randPrompt][model1]).length);
    const randNum2 = Math.floor(Math.random()*Object.keys(randStyle[randCat][randPrompt][model2]).length);
    
    const img1 = ref(storage, 'images/' + model1 + '_' +randCat +"_"+randPrompt+"_"+styleName+"_"+randNum1 +'.png');
    const img2 = ref(storage, 'images/' + model2 + '_' +randCat +"_"+randPrompt+"_"+styleName+"_"+randNum2 +'.png');

    const cap = imagesJson[randCat][randPrompt]

    const img1Url = await getDownloadURL(img1);
    const img2Url = await getDownloadURL(img2);

    return [[{'model':model1, "prompt" : randPrompt, "category" : randCat, "style" : styleName, 'url': img1Url},
             {'model':model2, "prompt" : randPrompt, "category" : randCat, "style" : styleName, 'url': img2Url}], cap]
}, []);


  const randomImages = useCallback(async () => {

    if(gameState.futureImages == null){
        const present = await pullImages();
        setGameState(prevState => ({...prevState, images: present[0], caption: present[1]}));
    }else{
        setGameState(prevState => ({...prevState, images: gameState.futureImages[0], caption: gameState.futureImages[1]}));
    }

    const future = await pullImages();

    setGameState(prevState => ({...prevState, futureImages: future}));


  }, []);

  useEffect(() => {
    randomImages();
    const subscription = Dimensions.addEventListener(
        'change',
        ({window, screen}) => {
            const landscape = window.width > window.height;
            setGameState(prevState => ({...prevState, isLandscape: landscape, imageCSS: landscape ? styles.imgLandscape : styles.img}));
        },
      );
  }, [randomImages]);

  const handlePress = useCallback(async (winner, loser, index) => {
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

             // Start the animation based on which image was selected.
             if (index === 1) {
                animationRef1.current.animate({
                    0: { opacity: 1, rotate: '0deg' },
                    0.5: { opacity: 0.5, rotate: '-5deg' },
                    1: { opacity: 0, rotate: '0deg' },
                }, 300).then(() => {
                    setTimeout(() => {
                        animationRef1.current.transitionTo({ opacity: 1 });
                    }, 500);
                });
                backRef1.current.animate({
                    0: { rotate: '0deg' },
                    0.5: { rotate: '-5deg' },
                    1: { rotate: '0deg' },
                }, 300);
            } else if (index === 2) {
                animationRef2.current.animate({
                    0: { opacity: 1, rotate: '0deg' },
                    0.5: { opacity: 0.5, rotate: '5deg' },
                    1: { opacity: 0, rotate: '0deg' },
                }, 300).then(() => {
                    setTimeout(() => {
                        animationRef2.current.transitionTo({ opacity: 1 });
                    }, 300);
                });
                backRef2.current.animate({
                    0: { rotate: '0deg' },
                    0.5: { rotate: '5deg' },
                    1: { rotate: '0deg' },
                }, 300);
            }
    
            // Add a delay to allow animation to complete.
            setTimeout(() => {
                // Rest of the existing logic here.
    
                // Reload the images.
                randomImages();
            }, 500);
  }, [randomImages]);

  const {images, isLandscape, imgStyle, caption, imageCSS} = gameState;

  return (
    <View style={{width:'100vw'}}>
      <Text style={{textAlign:"center",fontSize:"1.4rem",margin:7,fontWeight:400}}>Which image looks better?</Text>
      <View style={isLandscape ? styles.containerLandscape : styles.container}>
        <TouchableOpacity onPress={() => handlePress(images[0], images[1], 1)}>
          <Animatable.Image 
              ref={animationRef1}
              source={images[0].url} 
              style={imageCSS} 
          />
          <Animatable.View
          ref={backRef1}
          style={[imageCSS, {position:'absolute', backgroundColor:"#D3D3D3",zIndex:-2}]}/>
        </TouchableOpacity>
        <Text style={styles.text}>{caption}</Text>
        <TouchableOpacity onPress={() => handlePress(images[1], images[0], 2)}>
          <Animatable.Image 
              ref={animationRef2}
              source={images[1].url} 
              style={imageCSS} 
          />
        <Animatable.View
            ref={backRef2}
            style={[imageCSS, {position:'absolute', backgroundColor:"#D3D3D3", zIndex:-2}]}/>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ImageGameScreen;