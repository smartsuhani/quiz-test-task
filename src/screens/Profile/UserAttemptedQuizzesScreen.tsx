// src/screens/UserQuizzesScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import ProgressBar from 'react-native-progress/Bar';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchAllCategoriesUserQuizData,
  selectFetchedUserQuizData,
  selectFetchUserQuizStatus,
  selectFetchUserQuizError,
} from '../../redux/slices/getUserQuizesSlice';
import {RootState} from '../../redux/store';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const UserAttemptedQuizzesScreen: React.FC = () => {
  const dispatch = useDispatch();
  const inset = useSafeAreaInsets();
  const navigation = useNavigation();
  const userQuizData = useSelector(selectFetchedUserQuizData);
  const status = useSelector(selectFetchUserQuizStatus);
  const error = useSelector(selectFetchUserQuizError);
  const user = useSelector((state: RootState) => state.user);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    // Replace with actual user ID
    dispatch(fetchAllCategoriesUserQuizData({uid: user.uid}));
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const renderQuizItem = ({item}: {item: any}) => (
    <View key={item.title} style={styles.quizItem}>
      <Text style={styles.question}>{item.question}</Text>
      <View style={styles.optionsContainer}>
        {Object.entries(item.options).map(([key, value]) => (
          <Text
            key={key}
            style={[
              styles.option,
              item.selectedAnswer === value && styles.selectedAnswer,
              item.answer === value && styles.correctAnswer,
            ]}>
            {`${key}: ${value}`}
          </Text>
        ))}
      </View>
      <Text style={styles.answer}>Your Answer: {item.selectedAnswer}</Text>
      <Text style={styles.correctAnswerText}>
        Correct Answer: {item.answer}
      </Text>
    </View>
  );

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: 'none',
      },
    });
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          display: 'flex',
        },
      });
    };
  }, [navigation]);
  useEffect(() => {
    filteredQuizzes();
  }, [userQuizData]);
  const filteredQuizzes = () => {
    if (!userQuizData) {
      return [];
    }
    if (selectedCategory === 'All') {
      return Object.values(userQuizData).flat();
    }
    return userQuizData[selectedCategory] || [];
  };

  if (status === 'loading') {
    return (
      <View style={styles.progressBar}>
        <ProgressBar
          width={209}
          height={5}
          color={'#5591BD'}
          unfilledColor={'grey'}
          borderWidth={0}
          indeterminate={true}
          useNativeDriver={true}
        />
      </View>
    );
  }

  if (status === 'failed') {
    return <Text style={styles.error}>Error: {error}</Text>;
  }
  const handleBackPress = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };
  return (
    <SafeAreaProvider
      style={[styles.container, {paddingTop: inset.top, paddingBottom: 0}]}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Feather name="arrow-left" size={30} color="black" />
        <Text style={styles.title}>Attempted Quizzes</Text>
      </TouchableOpacity>
      {filteredQuizzes().length === 0 ? (
        <View style={styles.blankView}>
          <MaterialCommunityIcons name="delete-empty" size={40} color="#000" />
          <Text style={styles.blankMessage}>
            {'Unable to fetched content\n for this category'}
          </Text>
        </View>
      ) : (
        <>
          <View>
            <ScrollView
              horizontal
              automaticallyAdjustContentInsets={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}>
              <TouchableOpacity
                onPress={() => handleCategoryChange('All')}
                style={[
                  styles.categoryItem,
                  selectedCategory === 'All' && styles.selectedCategory,
                ]}>
                <Text style={styles.categoryText}>All</Text>
              </TouchableOpacity>
              {userQuizData &&
                Object.keys(userQuizData).map(category => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => handleCategoryChange(category)}
                    style={[
                      styles.categoryItem,
                      selectedCategory === category && styles.selectedCategory,
                    ]}>
                    <Text style={styles.categoryText}>{category}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
          <FlatList
            data={filteredQuizzes()}
            renderItem={renderQuizItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.quizList}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  blankView: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50,
  },
  blankMessage: {
    fontSize: 18,
    fontWeight: '400',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 5,
    color: '#000',
  },
  categoryScroll: {
    marginBottom: 20,
    height: 40,
  },
  progressBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItem: {
    padding: 10,
    backgroundColor: '#C9DFEF',
    borderRadius: 8,
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: '#5591BD',
  },
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  quizList: {
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignContent: 'center',
    gap: 10,
  },
  quizItem: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionsContainer: {
    marginBottom: 10,
  },
  option: {
    fontSize: 16,
    marginVertical: 2,
  },
  selectedAnswer: {
    color: '#F38686',
  },
  correctAnswer: {
    color: '#5591BD',
  },
  answer: {
    fontSize: 16,
    color: 'blue',
    marginTop: 10,
  },
  correctAnswerText: {
    fontSize: 16,
    color: 'green',
    marginTop: 10,
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default UserAttemptedQuizzesScreen;
