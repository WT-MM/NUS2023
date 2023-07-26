import React, { useEffect, useRef } from 'react';
import { AppState, Dimensions } from 'react-native';
import { Video } from 'expo-av';

const isPortrait = Dimensions.get('window').height > Dimensions.get('window').width;
const VIDEO_HEIGHT = Dimensions.get('window').height*0.98;
const VIDEO_WIDTH = isPortrait ? Dimensions.get('window').width : VIDEO_HEIGHT * (9 / 16);


const VideoPlayer = ({ source, isPaused }) => {
  const videoRef = useRef(null);
  const appState = useRef(AppState.currentState);

  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      videoRef.current.playAsync();
    } else {
      videoRef.current.pauseAsync();
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    if (isPaused) {
      videoRef.current.pauseAsync();
    } else {
      videoRef.current.playAsync();
    }
  }, [isPaused]);

  return (
    <Video
      ref={videoRef}
      source={{ uri: source }}
      style={{ height: VIDEO_HEIGHT, width: VIDEO_WIDTH}}
      shouldPlay={!isPaused}
      resizeMode="cover"
    />
  );
};

export default VideoPlayer;
