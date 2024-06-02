'use strict';

var React = require('react');
var App = require('./app.jsx');
var socket = io.connect();

var UsersList = React.createClass({
	render() {
		return (
			<div className='users'>
				<h3> 참여자들 </h3>
				<ul>
					{
						this.props.users.map((user, i) => {
							return (
								<li key={i}>
									{user}
								</li>
							);
						})
					}
				</ul>				
			</div>
		);
	}
});

var Message = React.createClass({
	render() {
	  const messageClass = this.props.isOwnMessage ? 'message own-message' : 'message';
	  const timestamp = new Date(this.props.timestamp).toLocaleString();

	  return (
		<div className={messageClass}>
		  <strong>{this.props.user} :</strong> 
		  <span>{this.props.text}</span>
		  <div className="timestamp">{timestamp}</div>		
		</div>
	  );
	}
  });
  
  var MessageList = React.createClass({
	
	render() {
	  const currentUser = this.props.currentUser; // 현재 사용자 이름
	  return (
		<div>
		<h2>{ this.props.roomName }</h2>
		<div className='messages'>
		  {
			this.props.messages.map((message, i) => {
			  const isOwnMessage = message.user === currentUser;
  
			  return (
				<Message
				  key={i}
				  user={message.user}
				  text={message.text}
				  timestamp={message.timestamp}
				  isOwnMessage={isOwnMessage}
				/>
			  );
			})
		  } 
		</div>
		</div>
	  );
	}
  });
	

var MessageForm = React.createClass({
  getInitialState() {
    return { user: this.props.user, text: '' };
  },

  handleSubmit(e) {
    e.preventDefault();

    var message = {
      user: this.props.user,
      room: this.props.roomName,
      text: this.state.text
    }

    let messageData = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    };

    console.log(JSON.stringify({ message }));

    fetch('/chatRoom', messageData)
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          this.props.onMessageSubmit(result.message);
        } else {
          console.error('Message submission failed');
        }
      });
    this.setState({ text: '' });
  },

  changeHandler(e) {
    this.setState({ [e.target.name]: e.target.value });
  },

  render() {
    return (
      <div className='message_form'>
        <form onSubmit={this.handleSubmit}>
          <input
            placeholder='메시지 입력'
            className='textinput'
            name='text'
            onChange={this.changeHandler}
            value={this.state.text}
          />
          <h3></h3>
        </form>
      </div>
    );
  }
});

var ChangeNameForm = React.createClass({
	getInitialState() {
		return {newName: ''};
	},

	onKey(e) {
		this.setState({ newName : e.target.value });
	},

	handleSubmit(e) {
		e.preventDefault();
		var newName = this.state.newName;
		this.props.onChangeName(newName);	
		this.setState({ newName: '' });
	},

	render() {
		return(
			<div className='change_name_form'>
				<h3> 아이디 변경 </h3>
				<form onSubmit={this.handleSubmit}>
					<input
						placeholder='변경할 아이디 입력'
						onChange={this.onKey}
						value={this.state.newName} 
					/>
				</form>	
			</div>
		);
	}
});

var ChatApp = React.createClass({

	getInitialState() {
		return {
			users: [], 
			messages:this.props.messages, 
			text: '', 
			username: this.props.name,
			roomname: this.props.room
		};
	},

	componentDidMount() {
		socket.on('init', this._initialize);
		socket.on('send:message', this._messageRecieve);
		//socket.on('user:join', this._userJoined);
		//socket.on('user:left', this._userLeft);
		socket.on('change:name', this._userChangedName);
		if(this.state.roomname !== this.props.room ){
			this.setState({roomname: this.props.room});
		}
		socket.emit('init', { name: this.state.username });
	},

	componentDidUpdate() {
		if(this.state.roomname !== this.props.room ){
			this.setState({roomname: this.props.room});
			this.setState({messages: this.props.messages})
		}
	},

	_initialize(data) {
		if (data.error) {
		  
		} else {
		  var { users, name } = data;
		  this.setState({ users, username: name });
		}
	  },

	_messageRecieve(message) {
		var {messages} = this.state;
		messages.push(message);
		this.setState({messages});
	},

	handleMessageSubmit(message) {
		var {messages} = this.props;
		messages.push(message);
		this.setState({messages});
		socket.emit('send:message', message);
	},

	handleChangeName(newName) {
		var oldName = this.state.user;
		socket.emit('change:name', { name : newName}, (result) => {
			if(!result) {
				return alert('There was an error changing your name');
			}
			var {users} = this.state;
			var index = users.indexOf(oldName);
			users.splice(index, 1, newName);
			this.setState({users, user: newName});
		});
	},

	render() {

		return (
			<div>
			<div className='center'>
			{/* <ChangeNameForm
				onChangeName={this.handleChangeName}
			/> */}
			{/* <div> */}
				<MessageList
					messages={this.props.messages}
					currentUser={this.state.username}
					roomName={this.state.roomname}
				/>
				<MessageForm
					onMessageSubmit={this.handleMessageSubmit}
                    user={this.state.username}
					roomName={this.state.roomname}
				/>
			{/* </div> */}
			</div>
			</div>
		);
	}
});

module.exports = ChatApp;