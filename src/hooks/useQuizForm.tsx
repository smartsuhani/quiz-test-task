// src/hooks/useQuizForm.tsx
import {useState} from 'react';

const useQuizForm = () => {
  const [question, setQuestion] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [optionsMessage, setOptionsMessage] = useState<string[]>(['', '']); // Initial two options

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

      if (correctAnswer === newOptions[index]) {
        setCorrectAnswer('');
      }
    }
  };

  const handleOptionChange = (text: string, index: number) => {
    const newOptions = [...optionsMessage];
    newOptions[index] = text;
    setOptionsMessage(newOptions);
  };

  const resetForm = () => {
    setQuestion('');
    setSelectedValue('');
    setOptionsMessage(['', '']); // Reset to initial two options
    setCorrectAnswer(''); // Reset correct answer state if needed
  };

  return {
    question,
    setQuestion,
    selectedValue,
    setSelectedValue,
    correctAnswer,
    setCorrectAnswer,
    optionsMessage,
    setOptionsMessage,
    addOption,
    deleteOption,
    handleOptionChange,
    resetForm,
  };
};

export default useQuizForm;
