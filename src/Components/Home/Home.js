import React from 'react';
import PropTypes from 'prop-types';
import {
  Spin, Icon,
} from 'antd';
import styles from './Home.module.css';
import Globals from '../../Globals';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: null,
    };
  }

  componentDidMount() {
    const { onExpiredAuth } = this.props;
    const myInit = {
      method: 'GET',
      headers: {
        'x-access-token': Globals.TOKEN,
      },
      mode: 'cors',
      cache: 'default',
    };
    window.fetch(`${Globals.APIURL}users/self`, myInit).then((res) => {
      res.json().then((data) => {
        if (data.error) {
          if (data.error === 'notAuthenticated') {
            onExpiredAuth();
          }
          return;
        }
        const { profile } = data;
        this.setState({ profile });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  render() {
    const { profile } = this.state;
    return (!profile
      ? (
        <div>
          <h1 className={styles.header}>Accueil</h1>
          <Spin indicator={antIcon} />
        </div>
      )
      : (
        <div className="Home">
          <h1 className={styles.header}>Accueil</h1>
          <p>
Bienvenue
            {' '}
            <span style={{ fontWeight: 'bold' }}>{profile.username}</span>
          </p>
          {!profile.admin ? null : (
            <p>
              {'Niveau d\'accès : '}
              <span style={{ fontWeight: 'bold' }}>
              Administrateur
                {' '}
              </span>
              <Icon type="unlock" />
            </p>
          )}
          {profile.instruments.length === 0 ? null : (
            <div>
              {'Vous avez emprunté les instruments suivants : '}
              <div style={{ fontWeight: 'bold' }}>
                {profile.instruments.map(ins => <p key={ins.name}>{` - ${ins.name}`}</p>)}
              </div>
            </div>
          )}
        </div>
      )
    );
  }
}
Home.propTypes = {
  onExpiredAuth: PropTypes.func.isRequired,
};
