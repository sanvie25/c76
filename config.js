import * as firebase from 'firebase'
require("@firebase/firestore")
var firebaseConfig = {
    apiKey: "AIzaSyDkCnU_Kuh0L8UDsRcXqRzVfdqM4pchbqU",
    authDomain: "book-willy.firebaseapp.com",
    databaseURL: "https://book-willy.firebaseio.com",
    projectId: "book-willy",
    storageBucket: "book-willy.appspot.com",
    messagingSenderId: "101803803788",
    appId: "1:101803803788:web:7e9430331d46c4f31d67a9"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore()