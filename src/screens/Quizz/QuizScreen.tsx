import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import {
  useNavigation,
  NavigationProp,
  useRoute,
} from '@react-navigation/native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Entypo from 'react-native-vector-icons/Entypo';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../redux/store';
import {clearState, fetchQuizzes} from '../../redux/slices/quizzesSlice';
import {QuizQuestion} from '../../types/Quiz';
import images from '../../utils/Images';
import {ScrollView} from 'react-native-gesture-handler';
import {selectUserId} from '../../redux/slices/userSlice';
import {updateUserQuizData} from '../../redux/slices/userQuizzesUpdate';
import {
  fetchUserQuizData,
  selectFetchedUserQuizData,
  selectFetchUserQuizStatus,
} from '../../redux/slices/getUserQuizesSlice';
import ProgressBar from 'react-native-progress/Bar';

// Define the type for the navigation prop
type Navigation = NavigationProp<{Win: undefined; Lose: undefined}>;

const QuizScreen: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [initialModal, setInitialModal] = useState<boolean>(true);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
    null,
  );
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timer, setTimer] = useState<number>(60);
  const {quizzes} = useSelector((state: RootState) => state.quizzes);
  const uid = useSelector(selectUserId);
  const userQuizData = useSelector(selectFetchedUserQuizData);
  const userQuizDataStatus = useSelector(selectFetchUserQuizStatus);
  const navigation = useNavigation<Navigation>();
  const inset = useSafeAreaInsets();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();

  const {category} = route.params as {category: string};

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

  // Fetch quizzes based on category
  useEffect(() => {
    dispatch(fetchQuizzes(category));
  }, [category]);

  // Fetch user quiz data to filter unattempted quizzes
  useEffect(() => {
    if (uid && category) {
      dispatch(fetchUserQuizData({uid, category}));
    }
  }, [uid, category]);
  console.log('HERE IS QUIZZ DATA', userQuizData);
  // Filter out attempted quizzes
  const availableQuizzes =
    userQuizData && userQuizDataStatus === 'succeeded'
      ? quizzes.filter(
          quiz =>
            !userQuizData?.some(
              userQuiz => userQuiz.question === quiz.question,
            ),
        )
      : quizzes;

  useEffect(() => {
    if (availableQuizzes.length > 0) {
      setCurrentQuestion(availableQuizzes[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, availableQuizzes]);

  useEffect(() => {
    if (timer > 0 && !isAnswered && !initialModal) {
      const timerId = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timer === 0) {
      // console.log(isAnswered, isCorrect);
      // if(isAnswered === false && isCorrect) {
      //   const userData = {
      //     userId: uid,
      //     category: category,
      //     question: currentQuestion?.question,
      //     selectedAnswer: 'answer',
      //     answer: currentQuestion?.correct_answer,
      //     options: currentQuestion?.options || [],
      //   };
      //
      //   dispatch(updateUserQuizData(userData));
      // }
      setIsAnswered(true);
      setIsCorrect(false);
    }
  }, [timer, isAnswered, initialModal]);

  const handleAnswer = (answer: string) => {
    setIsAnswered(true);
    if (currentQuestion && answer === currentQuestion.correct_answer) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    const userData = {
      userId: uid,
      category: category,
      question: currentQuestion?.question,
      selectedAnswer: answer,
      answer: currentQuestion?.correct_answer,
      options: currentQuestion?.options || [],
    };

    dispatch(updateUserQuizData(userData));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < availableQuizzes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsAnswered(false);
      setIsCorrect(null);
      setTimer(60);
    } else {
      navigation.navigate('Win'); // or any other appropriate action
    }
  };

  const handleExit = () => {
    dispatch(clearState());
    navigation.goBack();
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ProgressBar
          width={209}
          height={5}
          color={'#5591BD'}
          unfilledColor={'grey'}
          borderWidth={0}
          indeterminate={true}
          useNativeDriver={true}
        />
      </SafeAreaView>
    );
  }

  const sortedOptions = Object.entries(currentQuestion.options).sort(
    ([keyA], [keyB]) => keyA.localeCompare(keyB),
  );

  return (
    // <ImageBackground
    //   source={images.backImg}
    //   style={styles.imageBackground}
    //   resizeMode="cover">
    <SafeAreaProvider style={styles.safeAreaView}>
      {initialModal && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleExit}
          style={[styles.closeButton, {top: inset.top, zIndex: 999}]}>
          <Entypo name="cross" size={30} color="black" />
        </TouchableOpacity>
      )}
      <ScrollView contentContainerStyle={{marginTop: inset.top, flexGrow: 1}}>
        {initialModal ? (
          <>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Quizzes...</Text>
              <Text style={styles.modalSubtitle}>for</Text>
              <Text style={styles.modalCategory}>{category}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setInitialModal(false)}
              style={[styles.startButton, {bottom: inset.bottom + 20}]}>
              <Text style={styles.startButtonText}>Start Now</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.container}>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{timer}s</Text>
            </View>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                {currentQuestion.question}
              </Text>
            </View>
            <View style={styles.optionsContainer}>
              {sortedOptions.map(([key, option], index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isAnswered &&
                      option === currentQuestion.correct_answer &&
                      styles.correctOption,
                    isAnswered &&
                      isCorrect === false &&
                      option !== currentQuestion.correct_answer &&
                      styles.wrongOption,
                  ]}
                  onPress={() => !isAnswered && handleAnswer(option)}
                  disabled={isAnswered}>
                  <Text style={styles.optionText}>{`${key}: ${option}`}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {isAnswered && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackText}>
                  {isCorrect
                    ? 'Correct Answer!'
                    : `Oops! The correct answer is: ${currentQuestion.correct_answer}`}
                </Text>
                <View style={styles.feedbackButtons}>
                  <TouchableOpacity
                    style={styles.feedbackButton}
                    onPress={handleExit}>
                    <Text style={styles.feedbackButtonText}>Exit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.feedbackButton}
                    onPress={handleNextQuestion}>
                    <Text style={styles.feedbackButtonText}>Next</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaProvider>
    // </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
  },
  modalContainer: {
    backgroundColor: 'transparent',
    height: 200,
    width: '80%',
    marginHorizontal: 30,
    alignSelf: 'center',
    marginTop: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 5,
    color: '#000',
  },
  modalSubtitle: {
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 5,
    color: '#000',
    alignSelf: 'center',
  },
  modalCategory: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000',
  },
  startButton: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  container: {
    flex: 1,
    padding: 16,
    marginTop: -30,
    justifyContent: 'flex-start',
  },
  timerContainer: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    position: 'relative',
    left: 0,
    right: 0,
    top: 70,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  timerText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 0,
    marginTop: -50,
    color: '#000',
  },
  questionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  optionsContainer: {
    marginTop: 30,
  },
  optionButton: {
    backgroundColor: '#ddd',
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 18,
    color: '#000',
  },
  correctOption: {
    backgroundColor: '#fff',
    shadowColor: 'green',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4, // For Android
  },
  wrongOption: {
    backgroundColor: '#fff',
    shadowColor: 'red',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4, // For Android
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
  },
  feedbackContainer: {
    marginTop: 20,
    paddingBottom: 200,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000',
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  feedbackButton: {
    backgroundColor: '#5591BD',
    padding: 10,
    borderRadius: 5,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

export default QuizScreen;
