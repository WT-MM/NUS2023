import React, { useRef, useState, useEffect } from 'react';
import { Animated, FlatList, Dimensions,Button, View } from 'react-native';
import { Input } from 'react-native-elements';  
import VideoPlayer from './VideoPlayer';
import { storage } from '../firebase';
import { ref, getDownloadURL, listAll } from "firebase/storage";

const isPortrait = Dimensions.get('window').height > Dimensions.get('window').width;
const VIDEO_HEIGHT = Dimensions.get('window').height*0.98;
const VIDEO_WIDTH = isPortrait ? Dimensions.get('window').width : VIDEO_HEIGHT * (9 / 16);
const extraStyle = isPortrait ? {} : { margin:'auto' };
const VideoScreen = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [videos, setVideos] = useState([]);

  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    console.log('viewableItems', viewableItems)
    setCurrentVisibleIndex(viewableItems[0]?.index);
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  const mmVideos = [
    { id: 1, url: 'https://firebasestorage.googleapis.com/v0/b/thisorthatai.appspot.com/o/videos%2F20230725051443.mp4?alt=media&token=8028f2cd-c19b-4643-b891-b954db83d81a' },
    { id: 2, url: 'https://firebasestorage.googleapis.com/v0/b/thisorthatai.appspot.com/o/videos%2F20230725083454.mp4?alt=media&token=d5f66c77-d25f-4b56-89a7-1d616a462493' },
    { id: 3, url: 'https://firebasestorage.googleapis.com/v0/b/thisorthatai.appspot.com/o/videos%2F20230726065405.mp4?alt=media&token=f9713c35-8ada-4d90-9d25-6e2839f95802' },
    { id: 4, url: 'https://player.vimeo.com/external/476838909.sd.mp4?s=33e4e8ec8dcd99aefd4eda56737c498ac69c8c1f&profile_id=165&oauth2_token_id=57447761' },
    { id: 5, url: 'https://player.vimeo.com/external/403302551.hd.mp4?s=0c226968d3f6845f176abc71ad4aad7ca27b4a8d&profile_id=174&oauth2_token_id=57447761' },
    { id: 6, url: 'https://player.vimeo.com/external/403278689.hd.mp4?s=791eaa4bfecbae421613ab0401a39b429542f18d&profile_id=174&oauth2_token_id=57447761' },
  ];

  useEffect(() => {
    listAll(ref(storage, 'videos')).then((res) => {
      let urls = [];
      res.items.forEach((itemRef) => {
        getDownloadURL(ref(storage, itemRef.fullPath)).then((url) => {
          urls.push({id: urls.length, url: url});
          if (urls.length === res.items.length) {
            setVideos(shuffleArray(urls));
          }
        }).catch((error) => {
          console.log(error);
        });
      });
    }).catch((error) => {
      console.log(error);
    });
    //setVideos(shuffleArray(mmVideos));


    const printOut = () => {
      console.log('currentVisibleIndex', currentVisibleIndex);
      setTimeout(printOut, 1000);
    };
    //printOut();
  }, []);

  
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array
  };


  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 0.5) * VIDEO_HEIGHT,
      index * VIDEO_HEIGHT,
      (index + 0.5) * VIDEO_HEIGHT,
    ];
    const translateY = scrollY.interpolate({
      inputRange,
      outputRange: [VIDEO_HEIGHT * 0.5, 0, -VIDEO_HEIGHT * 0.5],
    });

    return (
      <Animated.View style={{ transform: [{ translateY }], height: VIDEO_HEIGHT }}>
        <VideoPlayer source={item.url} isPaused={false} restart={currentVisibleIndex === index} />
      </Animated.View>
    );
  };
  
  return (
    <FlatList
      data={videos}
      keyExtractor={item => item.id.toString()}
      style={{ backgroundColor: 'light gray',height: VIDEO_HEIGHT }}
      contentContainerStyle={[{justifyContent:'center', alignItems:'center'}]}
      removeClippedSubviews={false}
      initialNumToRender={1}
      renderItem={renderItem}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      pagingEnabled={true}
      scrollEventThrottle={16}
      getItemLayout={(data, index) => (
        {length: VIDEO_HEIGHT, offset: VIDEO_HEIGHT * index, index}
      )}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    />
  );
};

export default VideoScreen;