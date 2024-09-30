import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import {RootState, AppDispatch} from '../../redux/store';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {fetchQuizzesCategory} from '../../redux/slices/quizzesCategorySlice';
import {clearUserQuizData} from '../../redux/slices/getUserQuizesSlice';
import {
  fetchFullName,
  fetchUserNames,
  selectFullName,
  selectUserNames,
  selectUserProfileLoading,
} from '../../redux/slices/userProfileSlice';
import {initializeUserPointsListener} from '../../redux/slices/userPointsSlice';
import Modal from 'react-native-modal';

const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const inset = useSafeAreaInsets();
  const {quizzesCategory, status} = useSelector(
    (state: RootState) => state.quizzesCategory,
  );
  const {points: userPoints} = useSelector(
    (state: RootState) => state.userPoints,
  );
  const user = useSelector((state: RootState) => state.user);
  const [fullName, setFullNameState] = useState('');
  const storedFullName = useSelector(selectFullName);
  const loading = useSelector(selectUserProfileLoading);
  const userNames = useSelector(selectUserNames);
  const [isModalVisible, setModalVisible] = useState(false); // New state for modal visibility

  useEffect(() => {
    if (storedFullName === undefined || storedFullName?.length === 0) {
      setFullNameState('John');
    } else {
      setFullNameState(storedFullName);
    }
  }, [storedFullName]);

  useEffect(() => {
    dispatch(fetchFullName());
    dispatch(fetchQuizzesCategory());
    dispatch(clearUserQuizData());
    dispatch(fetchUserNames());
    dispatch(initializeUserPointsListener());
  }, []);

  const calculateRanking = (
    userPoints: number,
    allPoints: Record<string, number>,
  ) => {
    if (userPoints === 0) {
      return 0;
    } else {
      const pointsArray = Object.entries(allPoints).map(([id, points]) => ({
        id,
        points,
      }));

      pointsArray.sort((a, b) => b.points.points - a.points.points); // Sort descending
      console.log('pointSArray', pointsArray);
      let rank = -1;
      for (let i = 0; i < pointsArray.length; i++) {
        if (pointsArray[i].id === user.uid) {
          rank = i + 1; // Rank is 1-based
          break;
        }
      }
      return rank;
    }
  };

  const ranking = calculateRanking(
    userPoints[user.uid]?.points || 0,
    userPoints,
  );

  if (status === 'loading' && quizzesCategory?.length === 0) {
    return <Text>Loading...</Text>;
  }

  const renderLeaderboardItem = ({item, index}) => (
    <View
      style={[
        styles.leaderboardItem,
        {
          backgroundColor: index === 0 ? '#C9DFEF' : '#fff',
          shadowColor: item.id === user.uid ? '#000' : '#ccc', // Change shadow color for current user
          elevation: item.id === user.uid ? 10 : 2, // Change elevation for current user
        },
      ]}>
      <Text style={styles.leaderboardRank}>{index + 1}</Text>
      <Text style={styles.leaderboardName}>
        {item.name} {item.id === user.uid ? '(you)' : ''}
      </Text>
      <Text style={styles.leaderboardPoints}>{item.points}</Text>
    </View>
  );

  const openModal = () => {
    dispatch(fetchUserNames());
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  const leaderboardData = Object.keys(userPoints).map(uid => ({
    id: uid,
    name: userNames[uid] || 'Unknown User', // Use username or default to 'Unknown User'
    points: userPoints[uid]?.points || 0, // Get points or assign 0 if not available
  }));

  // Add all users from userNames that might not be in userPoints
  Object.keys(userNames).forEach(uid => {
    if (!leaderboardData.find(user => user.id === uid)) {
      leaderboardData.push({
        id: uid,
        name: userNames[uid] || 'Unknown User', // Use username or default
        points: 0, // Assign 0 points
      });
    }
  });

  // Sort leaderboard data by points in descending order
  const sortedLeaderboardData = leaderboardData.sort(
    (a, b) => b.points - a.points,
  );

  return (
    <SafeAreaProvider style={[styles.container, {paddingTop: inset.top}]}>
      <View style={styles.container1}>
        <View style={styles.textContainer1}>
          {!loading && <Text style={styles.greeting}>Hi, {fullName}</Text>}
          <Text style={styles.subText}>Let's make this day productive</Text>
        </View>
        <FastImage
          source={{
            uri: 'https://www.shutterstock.com/image-vector/young-smiling-man-adam-avatar-600nw-2107967969.jpg',
          }} // Replace with your avatar image URL or local image
          style={styles.avatar}
          fallback={Platform.OS === 'android'}
        />
      </View>
      <TouchableOpacity
        activeOpacity={1}
        onPress={openModal}
        style={styles.card1}>
        <View style={styles.section}>
          <Icon name="trophy" size={24} color="#F5C518" />
          <View style={styles.textContainer}>
            <Text style={styles.label}>Ranking</Text>
            <Text style={styles.value}>{ranking}</Text>
          </View>
        </View>
        <View style={styles.separator} />
        <View style={[styles.section, {marginLeft: 20}]}>
          <Icon name="cash" size={24} color="#F5C518" />
          <View style={styles.textContainer}>
            <Text style={styles.label}>Points</Text>
            <Text style={styles.value}>
              {userPoints[user.uid]?.points || 0}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <FlatList
        data={quizzesCategory}
        numColumns={2}
        contentContainerStyle={{marginTop: 15, marginBottom: 100}}
        keyExtractor={item => item.name}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={{marginBottom: 40, marginLeft: 16}}>
            <Text style={{fontSize: 20, fontWeight: '700', color: '#000'}}>
              Let's Play
            </Text>
          </View>
        )}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('QuizScreen', {category: item.name});
            }}
            style={styles.card}>
            <View style={styles.imageContainer}>
              <FastImage
                style={[
                  styles.image,
                  {bottom: item.name === 'Science & Technology' ? 5 : -20},
                ]}
                source={{
                  uri: item.image,
                  priority: FastImage.priority.high,
                }}
                resizeMode={FastImage.resizeMode.contain}
                fallback={Platform.OS === 'android'}
              />
            </View>
            <View
              style={{
                alignSelf: 'center',
                width: '100%',
                justifyContent: 'center',
              }}>
              <Text numberOfLines={2} style={styles.text}>
                {item.name}
              </Text>
              <Text
                numberOfLines={2}
                style={[styles.text, {fontSize: 12, marginTop: 0}]}>
                {item.count} questions
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Leaderboard Modal */}
      <Modal
        isVisible={isModalVisible}
        style={{margin: 0}}
        backdropOpacity={0.5}>
        <SafeAreaProvider
          style={{
            marginTop: 150,
          }}>
          <View style={styles.modalMainView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Leaderboard</Text>
              <TouchableOpacity onPress={closeModal}>
                <Entypo name="cross" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={sortedLeaderboardData}
              renderItem={renderLeaderboardItem}
              keyExtractor={item => item.id}
            />
          </View>
        </SafeAreaProvider>
      </Modal>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    marginBottom: 0,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalMainView: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  icons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 16,
  },
  card: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    margin: 10,
    marginVertical: 20,
    height: 190, // Fixed height for the card to control the image overflow
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6.27,
    // Elevation for Android
    elevation: 10,
  },
  imageContainer: {
    position: 'absolute',
    top: -40, // Position the image above the card
    alignItems: 'center',
  },
  cardKeyboardClosed: {
    height: '100%',
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 10, // Circular image
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 0, // This is specifically for Android
    position: 'relative',
    bottom: -20,
    ...Platform.select({
      android: {
        // elevation: 5, // Ensure this is high enough to see the shadow
        // shadowColor: '#000', // Optional for Android
      },
    }),
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
    textAlign: 'flex-start',
    marginBottom: 5,
    marginLeft: 5,
    marginTop: 50, // Space for the image
  },
  safeAreaProvider: {
    paddingTop: 0,
    paddingBottom: 0,
    flexDirection: 'column',
  },
  searchBar: {
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginBottom: 10,
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  searchInput: {
    fontSize: 18,
  },
  noCategoriesFound: {
    marginTop: 20,
  },
  noCategoriesText: {
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'center',
  },
  flatListContainer: {
    flex: 1,
  },
  flatListKeyboardOpen: {
    height: '50%',
  },
  flatListKeyboardClosed: {
    height: '100%',
  },
  flatListContent: {
    paddingHorizontal: 16,
  },
  card1: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    margin: 16,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    flex: 1,
  },
  textContainer: {
    marginLeft: 8,
  },
  label: {
    fontSize: 14,
    color: '#000',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  container1: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    paddingTop: 16,
    paddingHorizontal: 5,
    alignSelf: 'center',
  },
  textContainer1: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  subText: {
    fontSize: 14,
    color: '#7D7D7D',
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: 'red',
    borderRadius: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 10, // Rounded corners for the card effect
    borderWidth: 1, // Add a border to the card
    borderColor: '#ddd', // Light border color
    marginVertical: 5, // Space between items
    backgroundColor: '#fff', // Default background color
    // Shadows for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
  },

  leaderboardRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  leaderboardName: {
    fontSize: 16,
    color: '#000',
  },
  leaderboardPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default HomeScreen;
