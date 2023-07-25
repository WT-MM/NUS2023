import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const isPortrait = Dimensions.get('window').height > Dimensions.get('window').width;

const VIDEO_HEIGHT = isPortrait ? Dimensions.get("window").width * (16 / 9) : Dimensions.get('window').height;
const VIDEO_WIDTH = isPortrait ? Dimensions.get('window').width : VIDEO_HEIGHT * (9/16);

const VideoPlayer = ({ source, isPaused }) => {
  const videoRef = useRef();
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    console.log("Width: " + VIDEO_WIDTH + " Height: " + VIDEO_HEIGHT)
    const onFocusChange = () => {
      setIsFocused(document.hasFocus());
    };

    window.addEventListener('focus', onFocusChange);
    return () => {
      window.removeEventListener('focus', onFocusChange);
    };
  }, []);

  useEffect(() => {
    if (isPaused) {
      videoRef.current.pauseAsync();
    } else {
      videoRef.current.playAsync();
    }
  }, [isFocused, isPaused]);

  const handleVideoRef = (component) => {
    videoRef.current = component;
  };

  return (
    <View style={isPortrait ? styles.container : styles.landscapeContainer}>
      <Video
        ref={handleVideoRef}
        source={{ uri: source }}
        style={isPortrait ? styles.video : styles.landscapeVideo}
        resizeMode={ResizeMode.STRETCH}
        shouldPlay={!isPaused}
        isLooping
        onPlaybackStatusUpdate={(status) => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
  },
  landscapeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
  },
  video: {
    flex: 1,
  },
  landscapeVideo: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    flex:1
  },
});

export default VideoPlayer;
