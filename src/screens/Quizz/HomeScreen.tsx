import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  Keyboard,
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
import {QuizCategory} from '../../types/Quiz';

const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const inset = useSafeAreaInsets();
  const {quizzesCategory, status} = useSelector(
    (state: RootState) => state.quizzesCategory,
  );
  const [searchMode, setSearchMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredQuizIds, setFilteredQuizIds] = useState<QuizCategory[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    dispatch(fetchQuizzesCategory());
  }, []);

  const handleSearch = useCallback(
    (text: string) => {
      if (text) {
        setFilteredQuizIds(
          quizzesCategory.filter(data =>
            data.name.toLowerCase().includes(text.toLowerCase()),
          ),
        );
      } else {
        setFilteredQuizIds([]);
      }
    },
    [quizzesCategory],
  );

  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, handleSearch]);

  if (status === 'loading' && quizzesCategory?.length === 0) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaProvider style={[styles.container, {paddingTop: inset.top}]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.icons}>
          <Icon
            name="search"
            size={24}
            color="black"
            style={styles.icon}
            onPress={() => setSearchMode(true)}
          />
          <Icon
            name="person"
            size={24}
            color="black"
            style={styles.icon}
            onPress={() => navigation.navigate('Profile')}
          />
        </View>
      </View>

      <FlatList
        data={quizzesCategory.slice(0, 10)}
        numColumns={2}
        keyExtractor={item => item.name}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('QuizScreen', {category:item.name});
            }}
            style={[styles.card]}>
            <FastImage
              style={styles.image}
              source={{
                uri: item.image,
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.stretch}
            />
            <Text numberOfLines={2} style={styles.text}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={searchMode}>
        <SafeAreaProvider
          style={[styles.safeAreaProvider, {paddingTop: inset.top}]}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity
              onPress={() => {
                setSearchMode(false);
                setSearchText('');
              }}>
              <Entypo name="cross" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {filteredQuizIds.length === 0 ? (
            <View style={styles.noCategoriesFound}>
              <Text style={styles.noCategoriesText}>No Categories Found</Text>
            </View>
          ) : (
            <View
              style={[
                isKeyboardVisible
                  ? styles.flatListKeyboardOpen
                  : styles.flatListKeyboardClosed,
                {flex: Platform.OS === 'android' ? 1 : !isKeyboardVisible && 1},
              ]}>
              <FlatList
                data={filteredQuizIds}
                numColumns={1}
                keyExtractor={item => item.name}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchMode(false);
                      setSearchText('');
                      navigation.navigate('QuizScreen', {category:item.name});
                    }}
                    style={styles.card}>
                    <FastImage
                      style={styles.image}
                      source={{
                        uri: item.image,
                        priority: FastImage.priority.normal,
                      }}
                      resizeMode={FastImage.resizeMode.stretch}
                    />
                    <Text numberOfLines={2} style={styles.text}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </SafeAreaProvider>
      </Modal>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    height: 200,
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardKeyboardOpen: {
    height: '45%',
  },
  cardKeyboardClosed: {
    height: '100%',
  },
  image: {
    width: '100%',
    height: '80%',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
    marginTop: 10,
    alignSelf: 'center',
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
});

export default HomeScreen;
