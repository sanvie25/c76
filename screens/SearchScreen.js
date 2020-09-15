import React from 'react';
import { Text, View } from 'react-native';
import db from '../config';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
export default class Searchscreen extends React.Component {
  constructor(prop){
    super(prop)
this.state={
  allTransaction:[],
  lastVisibleTransaction: null,
  search:""
}
  }
  searchTransaction=async(text)=>{
    var enteredText= text.split("")
    var text = text.toUpperCase()
    if(enteredText[0].toUpperCase()=== "B"){
    const transaction= await db.collection("transactions").where("bookId","==",text).get()
    transaction.docs.map((doc)=>{
      this.setState({
        allTransaction:[...this.state.allTransaction,doc.data()],
        lastVisibleTransaction: doc
      })
    })
    }
    if(enteredText[0].toUpperCase()=== "S"){
      const transaction= await db.collection("transactions").where("studentId","==",text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransaction:[...this.state.allTransaction,doc.data()],
          lastVisibleTransaction: doc
        })
      })
      }

  }
  componentDidMount= async ()=>{
    const query = await db.collection("transactions").get()
    query.docs.map((doc)=>{
      this.setState({
        allTransaction:[...this.state.allTransaction,doc.data()],
        lastVisibleTransaction: doc
      })
    })
  }
  fetchmoretransaction= async()=>{
    var enteredText= text.split("")
    var text = text.toUpperCase()
    if(enteredText[0].toUpperCase()=== "B"){
    const transaction= await db.collection("transactions").where("bookId","==",text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
    transaction.docs.map((doc)=>{
      this.setState({
        allTransaction:[...this.state.allTransaction,doc.data()],
        lastVisibleTransaction: doc
      })
    })
    }
    if(enteredText[0].toUpperCase()=== "S"){
      const transaction= await db.collection("transactions").where("studentId","==",text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransaction:[...this.state.allTransaction,doc.data()],
          lastVisibleTransaction: doc
        })
      })
      }
  
  }
    render() {
      return (
        <View>
          <View>
          <TextInput
          placeholder="enter book id/student id"
          onChangeText={(text)=>{
            this.setState({search:text})
          }}
          ></TextInput>
          <TouchableOpacity
          onPress={()=>{this.searchTransaction(this.state.search)}}
          >
            <Text>
              search
            </Text>
          </TouchableOpacity>
          </View>
          
        <FlatList
        data={this.state.allTransaction}
        renderItem = {({item})=>{
          <View style = {{borderBottomWidth:2}}>
<Text> {"Book Id"+item.bookId} </Text>
<Text> {"Student Id"+item.studentId} </Text>
<Text> {"transaction Type"+item.transactiontype} </Text>
<Text> {"Date"+item.date.toDate()} </Text>
          </View>
        }}
        keyExtractor = {(item,index)=>index.toString()}
        onEndReached = {this.fetchmoretransaction}
        onEndReachedThreshold = {0.7}
        >

        </FlatList>
        </View>
      );
    }
  }