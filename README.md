# React Native Project with TypeScript and Firebase Realtime Database

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [iOS Setup](#ios-setup)
5. [Android Setup](#android-setup)
7. [Import Demo Dataset](#import-demo-dataset)
8. [Running the Project](#running-the-project)


## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed: [Download and install Node.js](https://nodejs.org/)
- React Native CLI installed globally: `npm install -g react-native-cli`
- Xcode (for iOS development) installed from the App Store
- Android Studio (for Android development) installed

## Project Setup

1. **Clone the repository:**

   ```sh
   git clone https://github.com/smartsuhani/quiz-test-task.git
   cd quiz-test-task
2. **Install dependencies:**

   ```sh
   yarn install
   
## Firebase Configuration

1. **Create a Firebase project:**

   ```sh
   Go to Firebase Console and create a new project.
   
2. **Add an iOS app to your Firebase project:**

   ```sh
   Follow the setup instructions and download the GoogleService-Info.plist file.
   Open the downloaded GoogleService-Info.plist file and copy its contents.
   Replace the contents of ios/quizDemo/GoogleService-Info.plist with the copied contents.
   
3. **Add an Android app to your Firebase project:**

   ```sh
   Follow the setup instructions and download the google-services.json file.
   Open the downloaded google-services.json file and copy its contents.
   Replace the contents of android/app/google-services.json with the copied contents.

## iOS Setup

1. **Install CocoaPods:**

   ```sh
   sudo gem install cocoapods

2. **Navigate to the ios directory and install pods:**

   ```sh
   cd ios
   pod install
   cd ..
   
3. **Update App Identifier:**

   ```sh
   open ios/quizDemo.xcworkspace in Xcode.
   Go to the project settings and update the Bundle Identifier to match the identifier you used when setting up the Firebase project.
   Ensure the Team is set under the Signing & Capabilities tab.

## Android Setup

1. **Update App Identifier:**

   ```sh
   Open android/app/build.gradle and update the applicationId to match the identifier you used when setting up the Firebase project.

## Import Demo Dataset

1. **Download the demo dataset:**   
   
   ```sh
   The demo dataset is provided in the quizzes.json and quizzesCategories.json file located in the root of this repository.
2. **Import the dataset:**

   ```sh
   Go to the Firebase Console.
   Navigate to your project and select the Realtime Database from the left-hand menu.
   Click on the three vertical dots in the upper-right corner of the database and select Import JSON.
   Choose the quizzes.json and quizzesCategories.json files and import it into the root level of your database.

## Running the Project

1. **Run on iOS:**

   ```sh
   npx react-native run-ios

2. **Run on Android:**

   ```sh
   npx react-native run-android


### Explanation

- **Import Demo Dataset**: This new section provides instructions on downloading and importing the demo dataset into the Firebase Realtime Database.
- **Firebase Configuration**: Guides the user through creating a Firebase project and configuring it for iOS and Android.
- **iOS and Android Setup**: Detailed steps to configure each platform.
- **Running the Project**: Commands to run the project on both platforms.
- **Conclusion**: Encourages contributions and issues reporting.

This updated `README.md` provides comprehensive instructions for new developers to set up, configure, and run your project, including importing a demo dataset to get started quickly.

