'use strict';

var React = require('react');
var Login = require('./login.jsx');
var Join = require('./join.jsx');
var ChatLobby = require('./chatLobby.jsx');
var ChatRoom = require('./chatRoom.jsx');

var socket = io.connect();

var App = React.createClass({

	getInitialState() {
		return {landingPage: 'Login', username: '', password: ''};
	},

	handleJoinPage(){
		this.setState({landingPage : 'Join'});
	},

	handleJoinSuccess(){
		this.setState({landingPage : 'Login'});
	},

	handleLoginSuccess(user){
		this.setState({landingPage: 'Lobby', username : user });
	},

	
	changeHandler(e) {
		this.setState({[e.target.name] : e.target.value});
	},



	render() {
		var LandingPage;
		switch (this.state.landingPage) {
			case 'Join':
				LandingPage = <Join onJoinSuccess={this.handleJoinSuccess} />
				break;
			case 'Login':
				LandingPage = <Login onLoginSuccess={this.handleLoginSuccess} onClickJoin={this.handleJoinPage} />
				break;
			case 'Lobby':
				LandingPage = <ChatLobby name={this.state.username} />
				break;
			case 'ChatRoom':
				LandingPage = <ChatRoom name={this.state.username} />
			default:
				break;
		}
		return(
			<div className='main'>
					{
						LandingPage
					}
			</div>
		);
	}
});


React.render(<App/>, document.getElementById('app'));