// src/screens/AddQuizScreen.tsx
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useDispatch, useSelector} from 'react-redux';

import {
  fetchQuizzesCategory,
  selectAllQuizzesCategory,
} from '../redux/slices/quizzesCategorySlice';
import {addQuizData} from '../redux/slices/userOwnQuizSlice';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';
import useQuizForm from '../hooks/useQuizForm';
import CustomDropdown from './CustomDropdown';
import {RootState} from '../redux/store'; // Import the custom hook

interface AddQuizModalProps {
  show: boolean;
  onClose: () => void;
}

const AddQuizModal: React.FC<AddQuizModalProps> = ({show, onClose}) => {
  const user = useSelector((state: RootState) => state.user);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const quizzesCategory = useSelector(selectAllQuizzesCategory);
  const {
    question,
    setQuestion,
    selectedValue,
    setSelectedValue,
    correctAnswer,
    setCorrectAnswer,
    optionsMessage,
    addOption,
    deleteOption,
    handleOptionChange,
    resetForm,
  } = useQuizForm();

  const [showModal, setShowModal] = useState(show);
  const LeaveTypes = quizzesCategory.map(category => ({
    label: category.name,
    value: category.name,
  }));

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchQuizzesCategory());
    }, []),
  );

  useEffect(() => {
    setShowModal(show);
  }, [show]);

  const handleCloseModal = () => {
    resetForm();
    onClose();
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
              text: 'Check Quiz Lists',
              onPress: () => {
                resetForm();
                onClose();
                setShowModal(false);
                navigation.navigate('UserQuizzesScreen');
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
      <Modal animationInTiming={200} style={styles.modal} isVisible={showModal}>
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
                    <View style={{marginHorizontal: 16}}>
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
                        setSelectedValue={setSelectedValue}
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
    height: 50,
    backgroundColor: '#f5f5f5',
    flexDirection: 'column',
    borderRadius: 5,
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 4,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addButtonText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5591BD',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#C9DFEF',
    borderColor: 'gray',
    padding: 10,
    borderRadius: 5,
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

export default AddQuizModal;
