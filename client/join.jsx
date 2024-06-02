'use strict';

var React = require('react');
var App = require('./app.jsx');

var socket = io.connect();

var Join = React.createClass({

  getInitialState() {
    return { username: '', password: '' };
  },

  handleSubmit(e) {
    e.preventDefault();
    
    const { username, password } = this.state;

    let loginData = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    };

    fetch('/join', loginData)
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          this.setState({showModal:true});
        } else {
          this.setState({ errorMessage: '이미 존재하는 아이디입니다.' });
        }
      });
  },

  changeHandler(e) {
    this.setState({ [e.target.name]: e.target.value });
  },

  handleOk(){
    this.props.onJoinSuccess();
  },

  render() {
    return (
      <div className='join'>
        <div className='join-container'>
          <div className='join-header'>
            회원가입
          </div>
          <form className='join-form' onSubmit={this.handleSubmit}>
            <input
              type='text'
              placeholder='아이디 입력'
              name='username'
              onChange={this.changeHandler}
              value={this.state.username}
              className='join-input'
            />
            <input
              type='password'
              placeholder='비밀번호 입력'
              name='password'
              onChange={this.changeHandler}
              value={this.state.password}
              className='join-input'
            />
            <button type='submit' className='join-button'>
              회원가입
            </button>
          </form>
          {this.state.errorMessage && (
            <div className='error-message'>
              {this.state.errorMessage}
            </div>
          )}
        </div>
        {this.state.showModal && (
          <div className='modal'>
            <div className='modal-content'>
              🎉회원가입 성공🎉
              <br />
              <button onClick={this.handleOk}>OK</button>
            </div>
          </div>
        )}
      </div>
    );
  }
});

module.exports = Join;
