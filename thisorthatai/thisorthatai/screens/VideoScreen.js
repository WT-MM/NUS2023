import React, { useRef, useState, useEffect } from 'react';
import { Animated, FlatList, Dimensions, StyleSheet } from 'react-native';
import VideoPlayer from './VideoPlayer';

const isPortrait = Dimensions.get('window').height > Dimensions.get('window').width;
const VIDEO_HEIGHT = Dimensions.get('window').height*0.98;
const VIDEO_WIDTH = isPortrait ? Dimensions.get('window').width : VIDEO_HEIGHT * (9 / 16);
const extraStyle = isPortrait ? {} : { margin:'auto' };
const VideoScreen = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const videos = [
    { id: 1, url: 'https://assets.mixkit.co/videos/preview/mixkit-winter-fashion-cold-looking-woman-concept-video-39874-large.mp4' },
    { id: 2, url: 'https://assets.mixkit.co/videos/preview/mixkit-little-girl-finds-an-easter-egg-in-the-garden-48600-large.mp4' },
    { id: 3, url: 'https://player.vimeo.com/external/398518760.hd.mp4?s=d27e3d698f8dc07ece5fc0e1eb7b8c2404353dac&profile_id=174&oauth2_token_id=57447761' },
    { id: 4, url: 'https://player.vimeo.com/external/476838909.sd.mp4?s=33e4e8ec8dcd99aefd4eda56737c498ac69c8c1f&profile_id=165&oauth2_token_id=57447761' },
    { id: 5, url: 'https://player.vimeo.com/external/403302551.hd.mp4?s=0c226968d3f6845f176abc71ad4aad7ca27b4a8d&profile_id=174&oauth2_token_id=57447761' },
    { id: 6, url: 'https://player.vimeo.com/external/403278689.hd.mp4?s=791eaa4bfecbae421613ab0401a39b429542f18d&profile_id=174&oauth2_token_id=57447761' },
  ];
  
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array
  };

  const renderItem = ({ item, index }) => {
    console.log(item)
    const inputRange = [(index - 1) * VIDEO_HEIGHT, index * VIDEO_HEIGHT, (index + 1) * VIDEO_HEIGHT];
    const translateY = scrollY.interpolate({
      inputRange,
      outputRange: [VIDEO_HEIGHT, 0, -VIDEO_HEIGHT]
    });

    return (
      <Animated.View style={[{ transform: [{ translateY }], height:VIDEO_HEIGHT}, extraStyle]}>
        <VideoPlayer source={item.url} isPaused={false} />
      </Animated.View>
    );
  };

  return (
    <Animated.FlatList
      data={shuffleArray(videos)}
      keyExtractor={item => item.id.toString()}
      style={{backgroundColor: 'black'}}
      renderItem={renderItem}
      pagingEnabled={true}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      maxToRenderPerBatch={2} // Limit the number of items rendered in each batch
    />
  );
};

export default VideoScreen;