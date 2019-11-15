import React from 'react';
import {
  BrowserRouter as Router, Route, Link, Redirect, Switch,
} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDrum,
} from '@fortawesome/free-solid-svg-icons';
import { Menu, Icon } from 'antd';
import Globals from './Globals';
import Home from './Components/Home';
import Login from './Components/Login';
import Take from './Components/Take';
import Drop from './Components/Drop';
import Users from './Components/Users';
import Instruments from './Components/Instruments';
import Utils from './Utils';
import logo from './logo.png';
import styles from './App.module.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    Globals.TOKEN = Utils.getCookie('token');
    this.state = {
      authenticated: Globals.TOKEN.length > 0,
    };
  }

  onAuthenticated = (token) => {
    Globals.TOKEN = token;
    Utils.setCookie('token', token, 365);
    this.setState({ authenticated: true });
  }

  onExpiredAuth = () => {
    Utils.deleteCookie('token');
    this.setState({ authenticated: false });
  }

  render() {
    const { authenticated } = this.state;
    return (
      <Router basename={Globals.baseURL}>
        <div className={styles.App}>
          <img width="200px" src={logo} alt="logo" />
          <h3>Page de gestion des instruments</h3>
          {!authenticated ? (
            <Login
              onAuthenticated={this.onAuthenticated}
            />
          )
            : (
              <div>
                <Menu
                  defaultSelectedKeys={[window.location.pathname]}
                  mode="horizontal"
                >
                  <Menu.Item key="/">
                    <Link to="/">
                      <Icon type="home" />
                  Accueil
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="/instruments">
                    <Link to="/instruments">
                      <Icon type="notification" />
                  Liste des instruments
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="/users">
                    <Link to="/users">
                      <Icon type="contacts" />
                  Liste des membres
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="/drop">
                    <Link to="/drop">
                      <FontAwesomeIcon icon={faDrum} />
                      {' '}
Mes instruments
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="logout" onClick={() => this.onExpiredAuth()}>
                    <Icon type="logout" />
                  Se déconnecter
                  </Menu.Item>
                </Menu>
                <Switch>
                  <Route
                    path="/"
                    exact
                    render={() => (
                      <Home
                        onExpiredAuth={this.onExpiredAuth}
                      />
                    )}
                  />
                  <Route
                    path="/take/"
                    render={() => (
                      <Take
                        onExpiredAuth={this.onExpiredAuth}
                      />
                    )}
                  />
                  <Route
                    path="/drop/"
                    render={() => (
                      <Drop
                        onExpiredAuth={this.onExpiredAuth}
                      />
                    )}
                  />
                  <Route
                    path="/users/"
                    render={() => (
                      <Users
                        onExpiredAuth={this.onExpiredAuth}
                      />
                    )}
                  />
                  <Route
                    path="/instruments/"
                    render={() => (
                      <Instruments
                        onExpiredAuth={this.onExpiredAuth}
                      />
                    )}
                  />
                  <Route
                    path="/*"
                    render={() => (
                      <Redirect to="/" />
                    )}
                  />
                </Switch>
              </div>
            )}
        </div>
      </Router>
    );
  }
}
