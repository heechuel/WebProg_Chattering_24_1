'use strict';

var React = require('react');
var App = require('./app.jsx');
var ChatRoom = require('./chatRoom.jsx');

var socket = io.connect();

var ChatLobby = React.createClass({

  getInitialState() {
    return { 
      roomName: '', 
      currentRoom: '',
      showChatWindow: false,
      showErrorMessage: false, 
      messages: []
    };
  },

  handleSubmit(e) {
    e.preventDefault();
    
    const {roomName} = this.state;

    let roomData = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( {roomName} )
    };

    fetch('/chatLobby', roomData)
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          this.fetchPastChat(this.props.name, roomName);
          this.setState({ 
            currentRoom: roomName, 
            showChatWindow: true,
            showErrorMessage: false,
            roomName: ''
          });
          console.log("방 찾기 성공");
        } else {
          this.setState({ 
            showErrorMessage: true,
            showChatWindow: false
          });
          console.error('방을 찾을 수 없습니다.');
        }
      });
  },

  changeHandler(e) {
    this.setState({ [e.target.name]: e.target.value });
  },

  handleCreateRoom(confirm) {
    if (confirm) {
      console.log('방을 개설합니다.');
      const {roomName} = this.state;

      let roomData = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify( {roomName} )
      };

      fetch('/LobbyCreate', roomData)
      .then(response => response.json());
      
      this.fetchPastChat(this.props.name, roomName);
      this.setState({ 
        currentRoom: this.state.roomName,
        showErrorMessage: false,
        showChatWindow: true,
        roomName: ''
      });
    } else {
      this.setState({ 
        showErrorMessage: false,
        showChatWindow: false,
        roomName: ''
      });
    }
  },

  fetchPastChat(currentUser, roomName) {
    let chatData = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({currentUser ,roomName })
    };

    fetch('/pastChat', chatData)
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          this.setState({ messages: result.data });
        }
      });
  },

  render() {
    console.log(this.state);
    return (
      <div className="Lobby">
        <div className="sidebar">
          <form onSubmit={this.handleSubmit} className="search-form">
            <input
              type="text"
              name="roomName"
              value={this.state.roomName}
              onChange={this.changeHandler}
              placeholder="찾을 방"
            />
            <button type="submit">Search</button>
          </form>
          {this.state.showErrorMessage && (
            <div className="error-message">
              <p>해당 방이 존재하지 않습니다.<br />방을 개설하시겠습니까?</p>
              <div className="confirmation-buttons">
              <button onClick={() => this.handleCreateRoom(false)}>X</button>
                <button onClick={() => this.handleCreateRoom(true)}>O</button>
              </div>
            </div>
          )}
        </div>
        <div className={`chat-window ${this.state.showChatWindow ? '' : 'hidden'}`}>
          <div>
            <div className="chat-messages">
              <ChatRoom name={this.props.name} room={this.state.currentRoom} messages = {this.state.messages}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = ChatLobby;

