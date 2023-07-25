import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, Dimensions, StyleSheet } from 'react-native';
import VideoPlayer from './VideoPlayer';

const isPortrait = Dimensions.get('window').height > Dimensions.get('window').width;

const VIDEO_HEIGHT = isPortrait ? Dimensions.get("window").width * (16 / 9) : Dimensions.get('window').height * 0.9;
const VIDEO_WIDTH = isPortrait ? Dimensions.get('window').width : VIDEO_HEIGHT * (9/16);
const VIDEO_PADDING = isPortrait ? 0 : Dimensions.get('window').width - VIDEO_WIDTH;

const videos = [
    {url: 'https://assets.mixkit.co/videos/preview/mixkit-winter-fashion-cold-looking-woman-concept-video-39874-large.mp4'},
    {url: 'https://assets.mixkit.co/videos/preview/mixkit-little-girl-finds-an-easter-egg-in-the-garden-48600-large.mp4'},
    {url:'https://player.vimeo.com/external/398518760.hd.mp4?s=d27e3d698f8dc07ece5fc0e1eb7b8c2404353dac&profile_id=174&oauth2_token_id=57447761'},
    {url:'https://player.vimeo.com/external/476838909.sd.mp4?s=33e4e8ec8dcd99aefd4eda56737c498ac69c8c1f&profile_id=165&oauth2_token_id=57447761'},
    {url:'https://player.vimeo.com/external/403302551.hd.mp4?s=0c226968d3f6845f176abc71ad4aad7ca27b4a8d&profile_id=174&oauth2_token_id=57447761'},
    {url:'https://player.vimeo.com/external/403278689.hd.mp4?s=791eaa4bfecbae421613ab0401a39b429542f18d&profile_id=174&oauth2_token_id=57447761'},
];
// Fisher-Yates shuffle algorithm to shuffle the array in-place
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };
  
  const VideoScreen = () => {
    const scrollViewRef = useRef();
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
  
    let scrollTimeout;
  
    useEffect(() => {
      shuffleArray(videos); // Shuffle the videos array
    }, []); // Empty dependency array ensures it runs only once, on component mount
  
    const handleScroll = (event) => {
      clearTimeout(scrollTimeout);
      setIsScrolling(true);
  
      const offsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / VIDEO_WIDTH);
      if (newIndex !== activeVideoIndex) {
        setActiveVideoIndex(newIndex);
      }
  
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 100); // Adjust the delay as needed to pause the video during scrolling
    };
  
    return (
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={VIDEO_WIDTH}
          snapToAlignment="start"
          decelerationRate="fast"
        >
          {videos.map((video, index) => (
            <View key={index} style={styles.videoContainer}>
              <VideoPlayer source={video.url} isPaused={isScrolling || index !== activeVideoIndex} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    videoContainer: {
        width:"100vw",
        height:"95vh",
    alignItems: 'center',
    },
    videoPlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: '#f0f0f0', // Placeholder color
    },
  });
  
  export default VideoScreen;