import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button } from 'react-native';
import { Dialog } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { auth } from './firebase';

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";


import { onAuthStateChanged } from 'firebase/auth';

import { storage } from './firebase';

import HomeScreen from './screens/HomeScreen';
import ImageGameScreen from './screens/ImageGameScreen';
import LoginScreen from './screens/LoginScreen';
import TextGameScreen from './screens/TextGameScreen';
import VideoScreen from './screens/VideoScreen';

const AppNavigator = createStackNavigator();



// A new component for the header right button
function HeaderRight({ user }) {
  const [dialogVisible, setDialogVisible] = useState(false);

  const navigation = useNavigation();

  const signOut = () => {
    auth
      .signOut()
      .then(() => console.log('User signed out!'))
      .catch((error) => console.log(error));
  };

  const showDialog = () => {
    setDialogVisible(true);
  };

  const handleCancel = () => {
    setDialogVisible(false);
  };

  const handleLogout = () => {
    signOut();
    setDialogVisible(false);
  };

  if (user) {
    if(user.photoURL == null){
      user.photoURL = "https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png"
    }
    return (
      <View style={{ paddingRight: 10 }}>
        <TouchableOpacity onPress={showDialog}>
          <img
            style={{width:"10vw",height:"10vw", minHeight:"20px", minWidth:"20px", maxHeight:"40px", maxWidth:"40px",borderRadius:"50%",marginRight:"1vw"}}
            src={user.photoURL}
            referrerPolicy="no-referrer" 
          />
        </TouchableOpacity>
        <Dialog style={{width:"10vw"}} isVisible={dialogVisible}>
          <View style={{}}>
            <Text style={{textAlign:"center",fontSize:30,fontWeight:300,marginBottom:20}}>Are you sure you want to log out?</Text>
              <Button title="Log out" onPress={handleLogout} />
              <br style={{marginTop:"10"}}></br>
              <Button title="Cancel" onPress={handleCancel} />
          </View>

        </Dialog>
      </View>
    );
  }

  return (
    <View style={{ paddingRight: 10}}>
    <Button
      onPress={() => navigation.navigate('Login')}
      title="Login"
      color="#52c0de"
    />
    </View>
  );
}

const VideoScreenHeaderRight = ({ user }) => {
  const navigation = useNavigation();
  const fileInputRef = useRef();

  const uploadVideo = async (event) => {
    const file = event.target.files[0];
    
    const storageRef = ref(storage, 'uploads/'+auth.currentUser.uid+"/"+file.name);
  
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      }, 
      (error) => {
        // Handle unsuccessful uploads
        console.log(error);
      }, 
      () => {
        // Handle successful uploads on complete
          console.log('File uploaded');
        });
  };

  const handleClick = () => {
    if (!user) {
      navigation.navigate('Login');
    } else {
      fileInputRef.current.click();
    }
  };

  /*
        <View style={{width:"2vw"}}></View>
      <HeaderRight user={user} />
  */
  
  return (
    <View style={{ flexDirection: 'row', paddingRight: 10 }}>
      <Button title="Upload Video" onPress={handleClick} />
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={uploadVideo}
        style={{ display: 'none' }}
      />

    </View>
  );
};

export default function App() {
  const [user, setUser] = useState(null);

  // listen for user auth state changes
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    })
  }, []);

  return (
    <>
      <NavigationContainer>
        <AppNavigator.Navigator initialRouteName="Home">
          <AppNavigator.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              headerRight: () => <HeaderRight user={user} />,
            }}
          />
          <AppNavigator.Screen 
            name="Pick a Pic" 
            component={ImageGameScreen} 
            options={{
              headerRight: () => <HeaderRight user={user} />,
            }}
          />
          <AppNavigator.Screen 
            name="Pick a Paragraph" 
            component={TextGameScreen} 
            options={{
              headerRight: () => <HeaderRight user={user} />,
            }}
          />
          <AppNavigator.Screen
            name="AI Animations"
            component={VideoScreen}
            options={{
              headerRight: () => <VideoScreenHeaderRight user={user}/>,
              headerShown: true,
              headerTitleStyle:{
                backgroundColor:"rgba(255,255,255,0.4)",
                paddingTop:8,
                paddingBottom:8,
                paddingLeft:10,
                paddingRight:10,
                borderRadius:3,
                color:'black'
              },
              headerLeftContainerStyle:{
                backgroundColor:"rgba(255,255,255,0.4)",
                borderRadius:3,
                height:'10vw',
                marginTop:12,
                minHeight:20,
                maxHeight:40,
              },
              headerTransparent:true,
            }}
          />
          <AppNavigator.Screen name="Login" component={LoginScreen} />
        </AppNavigator.Navigator>
        
      </NavigationContainer>
    </>
  );
}
