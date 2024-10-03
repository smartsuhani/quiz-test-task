// src/screens/UpdateQuizScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {
  updateUserQuizData,
  fetchAllQuizzes,
} from '../../redux/slices/userOwnQuizSlice';
import Modal from 'react-native-modal';
import CustomDropdown from '../../component/CustomDropdown';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';

interface UpdateQuizScreenProps {
  route: {
    params: {
      quiz: any; // Replace with your quiz type
    };
  };
}

const UpdateQuizScreen = ({
  route,
}: UpdateQuizScreenProps): React.ReactElement => {
  const {quiz} = route.params;
  const [modalVisible, setModalVisible] = useState<boolean>(true);
  const [question, setQuestion] = useState<string>(quiz.question);
  const [optionsMessage, setOptionsMessage] = useState<string[]>(
    Object.values(quiz.options),
  );
  const [correctAnswer, setCorrectAnswer] = useState<any>(quiz.correct_answer);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  const handleUpdateQuiz = () => {
    if (
      question.trim() === '' ||
      optionsMessage.some(option => option.trim() === '') ||
      correctAnswer.value === undefined ||
      correctAnswer.value?.trim() === ''
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (typeof correctAnswer !== 'string') {
      if (correctAnswer.value?.trim() === '') {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
    }

    const uniqueOptions = new Set(optionsMessage.map(option => option.trim()));
    if (uniqueOptions.size !== optionsMessage.length) {
      Alert.alert('Error', 'Options must be unique');
      return;
    }

    const options = optionsMessage.reduce((acc, option, index) => {
      const labels = ['A', 'B', 'C', 'D'];
      acc[labels[index]] = option;
      return acc;
    }, {} as Record<string, string>);

    const updatedQuizData = {
      question,
      correct_answer: correctAnswer.value,
      options,
    };
    console.log(quiz, updatedQuizData);
    dispatch(
      updateUserQuizData({
        userId: user.uid,
        category: quiz.category,
        quizId: quiz.id,
        quizData: updatedQuizData,
      }),
    )
      .then(() => {
        Alert.alert('Success', 'Quiz updated successfully!');
        setModalVisible(false);
        navigation.goBack();
        dispatch(fetchAllQuizzes());
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to update quiz');
        console.error(error);
      });
  };

  const addOption = () => {
    if (optionsMessage.length < 4) {
      setOptionsMessage(prevOptions => [...prevOptions, '']);
    }
  };

  const deleteOption = (index: number) => {
    console.log(index);
    if (optionsMessage.length > 2) {
      const newOptions = [...optionsMessage];
      newOptions.splice(index, 1);
      setOptionsMessage(newOptions);
    }
  };

  const handleOptionChange = (text: string, index: number) => {
    console.log('Test message---', optionsMessage);
    const newOptions = [...optionsMessage];
    newOptions[index] = text;
    setOptionsMessage(newOptions);
  };

  const renderOptions = ({item, index}: {item: string; index: number}) => (
    <View style={styles.optionContainer}>
      {console.log(item, index)}
      <TextInput
        style={styles.optionInput}
        placeholder={`Option ${index}`}
        value={item}
        onChangeText={text => handleOptionChange(text, index - 1)}
      />
      {optionsMessage.length > 2 && (
        <TouchableOpacity onPress={() => deleteOption(index - 1)}>
          <FontAwesome name={'trash'} size={24} color={'#F38686'} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View>
      <Modal
        animationInTiming={200}
        style={styles.modal}
        isVisible={modalVisible}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Update Quiz</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
                setModalVisible(false);
              }}>
              <Icon name="close" size={30} color="#5591BD" />
            </TouchableOpacity>
          </View>
          <KeyboardAwareFlatList
            style={{marginHorizontal: 16}}
            data={[{type: 'question'}, ...optionsMessage, {type: 'footer'}]}
            renderItem={({item, index}) => {
              if (item.type === 'question') {
                return (
                  <View style={styles.mainView}>
                    <TextInput
                      style={styles.questionInput}
                      placeholder="Enter your question"
                      value={question}
                      onChangeText={setQuestion}
                    />
                  </View>
                );
              } else if (item.type === 'footer') {
                return (
                  <>
                    {optionsMessage.length < 4 && (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={addOption}>
                        <AntDesign
                          name={'plus'}
                          resizeMode="contain"
                          color={'#5591BD'}
                        />
                        <Text style={styles.addButtonText}>
                          Add another option
                        </Text>
                      </TouchableOpacity>
                    )}
                    <View style={{marginTop: 5}}>
                      <CustomDropdown
                        title={'Select Correct Answer'}
                        subTitle={'Correct Answer'}
                        data={optionsMessage.map((option, index) => ({
                          label: `Option ${index + 1}: ${option}`,
                          value: option,
                        }))}
                        setSelectedValue={setCorrectAnswer}
                        selectedValue={{
                          label: correctAnswer,
                          value: correctAnswer,
                        }} // Match the expected format
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleUpdateQuiz}>
                      <Text style={styles.buttonText}>Update Quiz</Text>
                    </TouchableOpacity>
                  </>
                );
              }
              return renderOptions({item, index});
            }}
            keyExtractor={(item, index) => index.toString()}
            ListHeaderComponent={<View style={{height: 20}} />}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    flex: 1,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    marginTop: 80,
  },
  mainView: {
    // marginHorizontal: 16,
    height: 50,
    backgroundColor: '#f5f5f5',
    flexDirection: 'column',
    borderRadius: 5,
    justifyContent: 'center',
    marginVertical: 16,
  },
  questionInput: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 18,
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 13,
    color: '#000',
  },
  modalContent2: {
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionsList: {
    // flexGrow: 0,
    marginTop: 0,
    height: 'auto',
  },
  addButtonText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5591BD',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#C9DFEF',
    borderColor: 'gray',
    padding: 10,
    borderRadius: 5,
    // marginHorizontal: 16,
  },
  optionInput: {
    flex: 1,
    color: 'black',
    fontSize: 16,
    lineHeight: 21,
    marginRight: 10,
    padding: 0,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5591BD',
  },
  button: {
    backgroundColor: '#5591BD',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 16,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UpdateQuizScreen;
