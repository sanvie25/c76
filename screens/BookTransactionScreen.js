import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView, ToastAndroid, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from  'firebase'
import db from '../config.js'


export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal'
      }
    }
    handleTransaction = async()=>{

      var transactiontype =await this.checkBookEligibility();
      if(!transactiontype){
        Alert.alert("the book does not exsist in the library database")
        this.setState({
          scannedStudentId:"",
          scannedBookId:""
        })
      }
      else if(transactiontype==="issue"){
        var isstudenteligible = await this.checkStudentEligibilityForBookIssue();
        if(isstudenteligible){
          this.initiateBookIssue();
          Alert.alert("book issued to the student")
        }
      }
      else{
        var isstudenteligible = await this.checkStudentEligibilityForBookReturn();
        if(isstudenteligible){
          this.initiateBookReturn();
          Alert.alert("book has been returned to the library")
      }
    }
     return transactiontype
    }
    checkStudentEligibilityForBookIssue = async()=>{
      const studentref = await db.collection("students").where("studentId","==",this.state.scannedStudentId).get()
      var isstudenteligible =""
      if(studentref.docs.length==0){
        this.setState({
          scannedStudentId:'',
          scannedBookId:''
        })
        isstudenteligible=false
        Alert.alert("student Id does not exist in database")
      }
      else{
        studentref.docs.map((doc)=>{
          var student = doc.data()
          if (student.numberOfBooksIssued<2){
            isstudenteligible=true
          }
          else{
            isstudenteligible=false
            Alert.alert("student has already issued 2 books")
            this.setState({
              scannedStudentId:'',
              scannedBookId:''
            })
          }
        })
      }
      return isstudenteligible
    }
    checkStudentEligibilityForBookReturn = async()=>{
      const transactionref = await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
      var isstudenteligible =""
     /* if(studentref.docs.length==0){
        this.setState({0
          scannedStudentId:'',
          scannedBookId:''
        })
        isstudenteligible=false
        Alert.alert("student Id does not exist in database")
      }*/
      
        transactionref.docs.map((doc)=>{
          var lastbooktransaction = doc.data()
          if (lastbooktransaction.studentId===this.state.scannedStudentId){
            isstudenteligible=true
          }
          else{
            isstudenteligible=false
            Alert.alert("the book was not issued by this student")
            this.setState({
              scannedStudentId:'',
              scannedBookId:''
            })
          }
        })
      return isstudenteligible
    }
    CheckBookEligibility = async()=>{
      const bookref = await db.collection("books").where("bookId","==",this.state.scannedBookId).get()
      var transactiontype =""
      if(bookref.docs.length==0){
        transactiontype = "false";
      }
      else{
        bookref.docs.map((doc)=>{
          var book = doc.data()
          if (book.bookAvalability){
         transactiontype="issue"
          
          }
          else{
            transactiontype="return"
            
          }
        })
      }
      return transactiontype
    }    
    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }
     initiateBookIssue=async()=>{
       db.collection("transaction").add({
         "studentId":this.state.scannedStudentId,
         "bookId": this.state.scannedBookId,
         "date":firebase.firestore.Timestamp.now().toDate(),
         "transactionType":"Issue" 
       })
      db.collection("books").doc(this.state.scannedBookId).update({
        "bookAvalability":false
      }) 
      db.collection("students").doc(this.state.scannedStudentId).update({
        "numberOfBooksIssued":firebase.firestore.FieldValue.increment(1)
      })
      Alert.alert("bookIssued")
      this.setState({
        scannedBookId:"",
        scannedStudentId:"",

      })
     }
     initiateBookReturn=async()=>{
      db.collection("transaction").add({
        "studentId":this.state.scannedStudentId,
        "bookId": this.state.scannedBookId,
        "date":firebase.firestore.Timestamp.now().toDate(),
        "transactionType":"Return" 
      })
     db.collection("books").doc(this.state.scannedBookId).update({
       "bookAvalability":true
     }) 
     db.collection("students").doc(this.state.scannedStudentId).update({
       "numberOfBooksIssued":firebase.firestore.FieldValue.increment(-1)
     })
     Alert.alert("bookReturned")
     this.setState({
      scannedBookId:"",
      scannedStudentId:"",
      
    })
    }
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView>
          <View style={styles.container}>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text=>this.setState({scannedBookId:text})}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput  
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={text=>this.setState({scannedStudentId:text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={async()=>{
            
            var transactionmessage= this.handleTransaction()
               this.setState({
                scannedBookId:"",
                scannedStudentId:"",
                
              })
              }}>
              <Text style={styles.buttonText}>submit</Text>
            </TouchableOpacity>
            </View>
          </View>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    }
  });