// src/screens/UserQuizzesScreen.tsx
import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {
  fetchAllQuizzes,
  deleteUserQuizData,
  selectAllOwnQuizzes,
} from '../../redux/slices/userOwnQuizSlice';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {array} from 'yup';
import CustomHeader from "../../component/CustomHeader";

const UserQuizzesScreen = (): React.ReactElement => {
  const dispatch = useDispatch();
  const inset = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);
  const quizzes = useSelector(selectAllOwnQuizzes);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<array>([]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchAllQuizzes());
    }, [dispatch]),
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

  const handleDeleteQuiz = (category: string, quizId: string) => {
    Alert.alert(
      'Delete Quiz',
      'Are you sure you want to delete this quiz?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          onPress: () => {
            dispatch(deleteUserQuizData({userId: user.uid, category, quizId}));
            dispatch(fetchAllQuizzes()); // Fetch quizzes again after deletion
          },
        },
      ],
      {cancelable: false},
    );
  };

  const renderQuizItem = ({item}: {item: any}) => (
    <View style={[styles.quizItem]}>
      <View style={styles.quizCategory}>
        <Text style={styles.quizCategoryText}>{item.category}</Text>
      </View>
      <Text style={styles.quizQuestion}>Question: {item.question}</Text>
      <View style={styles.quizOptionsContainer}>
        {Object.entries(item.options).map(([key, value]) => (
          <Text key={key} style={styles.quizOption}>
            {key}: {value}
          </Text>
        ))}
      </View>
      <Text style={styles.quizAnswer}>
        Correct Answer: {item.correct_answer}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEditQuiz(item)}>
          <FontAwesome name="edit" size={24} color="#5591BD" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteQuiz(item.category, item.id)}>
          <FontAwesome name="trash" size={24} color="#F38686" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const userQuizzes = quizzes[user.uid] || {};

  const filteredQuizzes =
    selectedCategory === 'All'
      ? Object.keys(userQuizzes).flatMap(
          category =>
            Object.values(userQuizzes[category]).map(quiz => ({
              ...quiz,
              category,
            })), // Add category to each quiz
        )
      : Object.values(userQuizzes[selectedCategory] || {}).map(quiz => ({
          ...quiz,
          category: selectedCategory,
        }));

  console.log(filteredQuizzes, categories);
  useEffect(() => {
    console.log(userQuizzes);
    setCategories(['All', ...Object.keys(userQuizzes)]);
  }, [selectedCategory, quizzes]);

  const handleBackPress = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };
  const handleEditQuiz = (quiz: any) => {
    navigation.navigate('UpdateQuizScreen', {quiz});
  };

  return (
    <SafeAreaProvider
      style={[styles.container, {paddingTop: inset.top, paddingBottom: 0}]}>
      <CustomHeader title="My Quizzes" />
      {selectedCategory === 'All' && filteredQuizzes.length === 0 ? (
        <View style={styles.blankView}>
          <MaterialCommunityIcons name="delete-empty" size={40} color="#000" />
          <Text style={styles.blankMessage}>
            {'Unable to fetched content\n for this category'}
          </Text>
        </View>
      ) : (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categorySelector}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  backgroundColor:
                    selectedCategory !== category ? '#f0f0f0' : '#5591BD',
                  borderRadius: 20,
                  marginLeft: index === 0 ? 16 : 0,
                  marginRight: categories.length - 1 === index ? 16 : 10,
                }}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category &&
                      styles.selectedCategoryButtonText,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {filteredQuizzes.length === 0 && selectedCategory !== 'All' ? (
        <View style={styles.blankView}>
          <MaterialCommunityIcons name="delete-empty" size={40} color="#000" />
          <Text style={styles.blankMessage}>
            {'Unable to fetched content\n for this category'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredQuizzes}
          renderItem={renderQuizItem}
          keyExtractor={item => item.id}
        />
      )}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  blankView: {
    flex: 1,
    alignItems: 'center',
    marginTop: 80,
  },
  blankMessage: {
    fontSize: 18,
    fontWeight: '400',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 5,
    color: '#000',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignContent: 'center',
    gap: 10,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  categorySelector: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  selectedCategoryButton: {
    backgroundColor: '#5591BD',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCategoryButtonText: {
    color: '#fff',
  },
  quizItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  quizCategory: {
    alignSelf: 'flex-end',
    backgroundColor: '#C9DFEF',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 10,
    marginBottom: 10,
  },
  quizCategoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  quizQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quizOptionsContainer: {
    marginTop: 8,
  },
  quizOptions: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  quizOption: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  quizAnswer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5591BD',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 16,
    marginTop: 16,
  },
  modal: {
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: '100%',
  },
  button: {
    backgroundColor: '#5591BD',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default UserQuizzesScreen;
