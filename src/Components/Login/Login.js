import React from 'react';
import {
  Button, notification, Select, Icon, Spin,
} from 'antd';
import PropTypes from 'prop-types';
import Globals from '../../Globals';
import styles from './Login.module.css';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

const openNotificationWithIcon = (type) => {
  notification[type]({
    message: 'Wrong username or password !',
    description:
      '',
  });
};

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: 'omaracuja',
      users: null,
    };
  }

  componentDidMount() {
    this.refresh();
  }

  authenticate = (username, password) => {
    const { onAuthenticated } = this.props;
    const myHeaders = { 'Content-type': 'application/json' };
    const myInit = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        username,
        password,
      }),
      mode: 'cors',
      cache: 'default',
    };
    window.fetch(`${Globals.APIURL}signin`, myInit)
      .then((res) => {
        res.json().then((data) => {
          if (data.token) {
            onAuthenticated(data.token);
          } else {
            openNotificationWithIcon('error');
          }
        });
      }).catch((err) => {
        console.log(err);
      });
  }

  refresh() {
    const myInit = {
      method: 'GET',
      headers: {
        'x-access-token': Globals.TOKEN,
      },
      mode: 'cors',
      cache: 'default',
    };
    window.fetch(`${Globals.APIURL}users`, myInit).then((res) => {
      res.json().then((data) => {
        const { users } = data;
        const mappedUsers = users.map(usr => usr.username);
        this.setState({
          users: mappedUsers
            .sort((a, b) => a > b),
          username: mappedUsers[0],
        });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  render() {
    const { username, password, users } = this.state;
    return (!users
      ? <Spin indicator={antIcon} />
      : (
        <div className={styles.Login}>
          <h1 className={styles.header}>Connexion</h1>
          <form
            className={styles.loginForm}
            onSubmit={(e) => {
              e.preventDefault();
              this.authenticate(username, password);
            }}
          >
            <Select
              className={styles.loginInput}
              defaultValue={username}
              style={{ width: '100%' }}
              onChange={(value) => {
                this.setState({ username: value });
              }}
            >
              {users
                .map(usr => (
                  <Select.Option
                    key={usr}
                    value={usr}
                  >
                    {usr}
                  </Select.Option>
                ))}
            </Select>
            <br />
            <Button type="primary" htmlType="submit">Se connecter</Button>
          </form>
        </div>
      )
    );
  }
}
Login.propTypes = {
  onAuthenticated: PropTypes.func.isRequired,
};
