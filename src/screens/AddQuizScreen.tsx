// src/screens/AddQuizScreen.tsx
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomDropdown from '../component/CustomDropdown';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {
  fetchQuizzesCategory,
  selectAllQuizzesCategory,
} from '../redux/slices/quizzesCategorySlice';
import {addQuizData} from '../redux/slices/userOwnQuizSlice';
import {
  KeyboardAwareFlatList,
  KeyboardAwareScrollView,
} from 'react-native-keyboard-aware-scroll-view';

const AddQuizScreen = (): React.ReactElement => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [optionsMessage, setOptionsMessage] = useState<string[]>(['', '']); // Initial two options
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const quizzesCategory = useSelector(selectAllQuizzesCategory);

  useEffect(() => {
    console.log('Modal Visible:', modalVisible);
  }, [modalVisible]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchQuizzesCategory());
      setModalVisible(true); // Show modal on focus
      return () => {
        setModalVisible(false); // Hide modal on unfocus
      };
    }, []),
  );

  const LeaveTypes = quizzesCategory.map(category => ({
    label: category.name,
    value: category.name,
  }));

  const handleLeaveTypeChange = (value: string) => {
    setSelectedValue(value);
  };

  const handleCloseModal = () => {
    resetForm();
    setModalVisible(false);
    navigation.navigate('Home');
  };

  const addOption = () => {
    if (optionsMessage.length < 4) {
      setOptionsMessage(prevOptions => [...prevOptions, '']);
    }
  };

  const deleteOption = (index: number) => {
    if (optionsMessage.length > 2) {
      const newOptions = [...optionsMessage];
      newOptions.splice(index, 1);
      setOptionsMessage(newOptions);

      if (correctAnswer === optionsMessage[index]) {
        setCorrectAnswer('');
      }
    }
  };

  const handleOptionChange = (text: string, index: number) => {
    const newOptions = [...optionsMessage];
    newOptions[index] = text;
    setOptionsMessage(newOptions);
  };

  const handleAddQuiz = () => {
    if (
      question.trim() === '' ||
      optionsMessage.some(option => option.trim() === '') ||
      correctAnswer?.value === undefined ||
      correctAnswer?.value?.trim() === '' ||
      selectedValue?.value === undefined ||
      selectedValue?.value?.trim() === ''
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const uniqueOptions = new Set(optionsMessage.map(option => option.trim()));
    if (uniqueOptions.size !== optionsMessage.length) {
      Alert.alert('Error', 'Options must be unique');
      return;
    }

    const options = optionsMessage.reduce((acc, option, index) => {
      const labels = ['A', 'B', 'C', 'D'];
      acc[labels[index]] = option; // Create a labeled object for each option
      return acc;
    }, {} as Record<string, string>); // Type as Record with string keys and values

    const quizData = {
      question,
      correct_answer: correctAnswer.value,
      options, // Options will be in the format { A: "option1", B: "option2", C: "option3", D: "option4" }
    };

    dispatch(
      addQuizData({
        userId: user.uid, // Replace with actual user ID
        category: selectedValue?.value,
        quizData,
      }),
    )
      .then(() => {
        Alert.alert(
          'Success',
          'Quiz added successfully!',
          [
            {
              text: 'Add Another Quiz',
              onPress: () => {
                // Reset states for adding another quiz
                resetForm();
              },
            },
            {
              text: 'Go Back to Home',
              onPress: () => {
                handleCloseModal(); // Close the modal and navigate back
              },
            },
          ],
          {cancelable: false},
        );
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to add quiz');
        console.error(error);
      });
  };

  // Function to reset the form states
  const resetForm = () => {
    setQuestion('');
    setSelectedValue('');
    setOptionsMessage(['', '']); // Reset to initial two options
    setCorrectAnswer({}); // Reset correct answer state if needed
  };

  const renderOptions = ({item, index}: {item: string; index: number}) => (
    <View style={styles.optionContainer}>
      <TextInput
        style={styles.optionInput}
        placeholder={`Option ${index + 1}`}
        value={item}
        placeholderTextColor={'#808080'}
        onChangeText={text => handleOptionChange(text, index)}
      />
      {optionsMessage.length > 2 && (
        <TouchableOpacity onPress={() => deleteOption(index)}>
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
            <Text style={styles.title}>Add Quiz</Text>
            <TouchableOpacity onPress={handleCloseModal}>
              <Icon name="close" size={30} color="#5591BD" />
            </TouchableOpacity>
          </View>
          <KeyboardAwareFlatList
            data={[...optionsMessage, 'footer']} // Adding 'footer' to render the add option button and dropdown
            renderItem={({item, index}) => {
              if (item === 'footer') {
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
                    <View style={{marginHorizontal: 16, marginTop: 30}}>
                      <CustomDropdown
                        title={'Select Correct Answer'}
                        subTitle={'Correct Answer'}
                        data={optionsMessage.map((option, index) => ({
                          label: `Option ${index + 1}: ${option}`,
                          value: option,
                        }))}
                        setSelectedValue={setCorrectAnswer}
                        selectedValue={correctAnswer}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleAddQuiz}>
                      <Text style={styles.buttonText}>Add Quiz</Text>
                    </TouchableOpacity>
                  </>
                );
              }
              return (
                <View style={{marginHorizontal: 16}}>
                  {index === 0 && (
                    <>
                      <CustomDropdown
                        title={'Select Category'}
                        subTitle={'Selected Category'}
                        data={LeaveTypes}
                        setSelectedValue={handleLeaveTypeChange}
                        selectedValue={selectedValue}
                      />
                      <View style={styles.mainView}>
                        <TextInput
                          style={styles.questionInput}
                          placeholder="Enter your question"
                          value={question}
                          placeholderTextColor={'#808080'}
                          onChangeText={setQuestion}
                        />
                      </View>
                    </>
                  )}
                  {renderOptions({item, index})}
                </View>
              );
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
    marginVertical: 20,
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
    marginBottom: 10,
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
    marginTop: 10,
    marginLeft: 16,
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
    margin: 16,
    marginTop: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AddQuizScreen;
