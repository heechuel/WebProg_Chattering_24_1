'use strict';

var React = require('react');
var App = require('./app.jsx');
var socket = io.connect();

var Login = React.createClass({
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

    fetch('/login', loginData)
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          this.props.onLoginSuccess(this.state.username);
        } else {
          alert('잘못된 아이디 혹은 비밀번호를 입력하셨습니다.');
        }
      });
  },

  changeHandler(e) {
    this.setState({ [e.target.name]: e.target.value });
  },

  handleJoinPage() {
    this.props.onClickJoin();
  },

  render() {
    return (
      <div className='login'>
        <div className='login-container'>
          <div className='login-header'>
            로그인
          </div>
          <form className='login-form' onSubmit={this.handleSubmit}>
            <input
              type='text'
              placeholder='아이디 입력'
              name='username'
              onChange={this.changeHandler}
              value={this.state.username}
              className='login-input'
            />
            <input
              type='password'
              placeholder='비밀번호 입력'
              name='password'
              onChange={this.changeHandler}
              value={this.state.password}
              className='login-input'
            />
            <div className='login-buttons'>
              <button type='submit' className='login-button'>
                로그인
              </button>
              <button type='button' onClick={this.handleJoinPage} className='login-button'>
                회원가입
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
});

module.exports = Login;
