import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { serverTimestamp, addDoc, collection, getDoc, setDoc, doc, increment } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

import { db, auth, storage } from '../firebase';

import promptsJson from '../imageReference.json';
import imagesJson from '../imagePrompts.json';

const statsCSS = {
  fontSize: '1.4rem',
  textAlign: 'center',
  paddingTop: '20%',
  fontWeight:350,
  verticalAlign: 'middle',
  fontFamily: 'Roboto',

};


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
        resizeMode: 'contain',
        aspectRatio: 1/1,
        borderRadius:10,
        maxHeight:"37vh"
    },
    imgLandscape: {
        width:"38vw",
        resizeMode: 'contain',
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
    modelStats:null,
    imageCSS: Dimensions.get('window').width > Dimensions.get('window').height ? styles.imgLandscape : styles.img,
  });

  let modelStats = null;

  const pullStats = async () => {
    const docRef = doc(db, 'stats', 'image');
    const docSnap = await getDoc(docRef);
    console.log(docSnap.data())
    if (docSnap.exists()) {
      modelStats = docSnap.data();
      console.log('Document data:', docSnap.data());
    } else {
      // doc.data() will be undefined in this case
      console.log('No such document!');
    }
  };


  useEffect(() => {
    pullStats();
  }, []);
  
  // Create refs
  const animationRef1 = useRef(null);
  const backRef1 = useRef(null);
  const animationRef2 = useRef(null);
  const backRef2 = useRef(null);

  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const pullImages = useCallback(async () => {
    if(imgStyle == null){
        var styleName = Object.keys(promptsJson)[Math.floor(Math.random() * Object.keys(promptsJson).length)];
    }else{
        var styleName = imgStyle;
    }
    let randStyle = promptsJson[styleName];
    let randCat = Object.keys(randStyle)[Math.floor(Math.random() * Object.keys(randStyle).length)];
    
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
                displayStats(winner.model, loser.model, index).then(() => {
                  //randomImages();
                  //Just running it after the 2nd timeout insteads
                });
            }, 500);
  }, [randomImages]);


  const displayStats = async (winnerModel, loserModel, index) =>{
    if(!modelStats){
      pullStats();
    }
    console.log(modelStats)
    const winnerLikelihood = modelStats[winnerModel][loserModel];
    const loserLikelihood = modelStats[loserModel][winnerModel];

    let left = leftRef.current;
    let right = rightRef.current;

    right.style.opacity = 0.8;
    left.style.opacity = 0.8;
    
    right.style.transition= "opacity 0.5s";
    left.style.transition= "opacity 0.5s";



    if(index == 1){
        left.innerHTML = "This image had a " + Math.round(winnerLikelihood*100) + "% chance of winning you over!<br><br> Its model has a " + Math.round(modelStats[winnerModel]['elo']) + " elo rating!";
        right.innerHTML = "This image had a " + Math.round(loserLikelihood*100) + "% chance of winning you over!<br><br> Its model has a " + Math.round(modelStats[loserModel]['elo']) + " elo rating!";

    }else{
        left.innerHTML = "This image had a " + Math.round(loserLikelihood*100) + "% chance of winning you over!<br><br> Its model has a " + Math.round(modelStats[loserModel]['elo']) + " elo rating!";
        right.innerHTML = "This image had a " + Math.round(winnerLikelihood*100) + "% chance of winning you over!<br><br> Its model has a " + Math.round(modelStats[winnerModel]['elo']) + " elo rating!";
    }

    setTimeout(() => {
      right.style.opacity = 0;
      left.style.opacity = 0;

      setTimeout(() => {
        left.innerHTML = "";
        right.innerHTML = "";
        left.style.transition= "";
        right.style.transition= "";
        randomImages(); 
      }, 500);
    }, 2000);


    //Create an element to display the stats

/*
    const winnerStats = document.createElement("div");
    winnerStats.style.display = "inline-block";
    winnerStats.style.marginRight = "10px";
    winnerStats.style.textAlign = "center";
    winnerStats.style.position = "absolute";
    winnerStats.style.padding = "3vw";
    winnerStats.style.borderRadius = "10px";
    winnerStats.style.transition = "all 0.5s ease";
    winnerStats.style.backgroundColor = "#ffffff";
    if(index == 1){
        winnerStats.style.left = "10px";
    }else{
        winnerStats.style.right = "10px";
    }
    winnerStats.style.top = "30%";


    const winnerText = document.createElement("div");
    winnerText.style.fontSize = "1.5rem";
    winnerText.style.margin = "0px";
    winnerText.style.fontWeight = "300";
    winnerText.innerHTML = "You are more likely to prefer this image by " + winnerLikelihood + "%";

    const loserStats = document.createElement("div");
    loserStats.style.display = "inline-block";
    loserStats.style.textAlign = "center";
    loserStats.style.borderRadius = "10px";
    loserStats.style.position = "absolute";
    loserStats.style.transition = "all 0.5s ease";
    loserStats.style.padding = "3vw";
    loserStats.style.backgroundColor = "#ffffff";
    if(index == 1){
        loserStats.style.right = "10px";
    }else{
        loserStats.style.left = "10px";
    }
    loserStats.style.bottom = "30%";


    const loserText = document.createElement("div");
    loserText.style.fontSize = "1.5rem";
    loserText.style.margin = "0px";
    loserText.style.fontWeight = "300";
    loserText.innerHTML = "You are more likely to prefer this image by " + loserLikelihood + "%";

    winnerStats.appendChild(winnerText);
    loserStats.appendChild(loserText);

    document.getElementById("root").appendChild(winnerStats);
    document.getElementById("root").appendChild(loserStats);

    setTimeout(() => {
      winnerStats.style.opacity = "0";
      loserStats.style.opacity = "0";
      setTimeout(() => {
        document.getElementById("root").removeChild(winnerStats);
        document.getElementById("root").removeChild(loserStats);
      }, 500);
    }
    , 1000);
*/


  }

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
          <View ref={leftRef} style={[imageCSS, statsCSS, {position:'absolute', backgroundColor:"white",zIndex:4, opacity:0}]}/>
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
            <View ref={rightRef} id="left" style={[imageCSS, statsCSS, {position:'absolute', backgroundColor:"white", opacity:0 ,zIndex:4}]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ImageGameScreen;