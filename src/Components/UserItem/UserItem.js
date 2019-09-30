import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Icon, Tag, Spin,
} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDrum, faUnlock, faLock } from '@fortawesome/free-solid-svg-icons';
import Globals from '../../Globals';
import styles from './UserItem.module.css';
import InstrumentModel from '../../Models/Instrument';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

export default class UserItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
      instruments: null,
    };
  }

  componentDidMount() {
    const { onExpiredAuth, userId } = this.props;
    const myInit = {
      method: 'GET',
      headers: {
        'x-access-token': Globals.TOKEN,
      },
      mode: 'cors',
      cache: 'default',
    };
    window.fetch(`${Globals.APIURL}instruments/${userId}`, myInit).then((res) => {
      res.json().then((data) => {
        if (data.error) {
          if (data.error === 'notAuthenticated') {
            onExpiredAuth();
          }
          return;
        }
        const { instruments } = data;
        this.setState({
          instruments: instruments.map(usr => InstrumentModel.fromJSON(usr))
            .sort((a, b) => a.username > b.username),
        });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  render() {
    const {
      username, admin, adminMode, onEdit, onDelete,
    } = this.props;
    const { hover, instruments } = this.state;
    return (
      <div
        className={styles.UserItem}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      >
        <div>
          <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{username}</span>
        </div>
        <div className={styles.userItemInfo}>
          <div className={styles.userInstru}>
            <span style={{ color: 'brown' }}><FontAwesomeIcon icon={faDrum} /></span>
            {' '}
            <span style={{ textDecoration: 'underline' }}>
              {'Instruments:'}
            </span>
            {' '}
            {instruments
              ? instruments.map(ins => <Tag key={ins.name}>{ins.name}</Tag>)
              : <Spin indicator={antIcon} />}
          </div>
          {!adminMode ? null : (
            <div>
              {admin ? <span style={{ color: 'green' }}><FontAwesomeIcon icon={faUnlock} /></span> : <span style={{ color: 'red' }}><FontAwesomeIcon icon={faLock} /></span>}
              {' '}
              <span style={{ textDecoration: 'underline' }}>
                {'Niveau d\'accès:'}
              </span>
              {' '}
              <span style={{ fontWeight: 'bold' }}>{admin ? 'Administrateur' : 'Membre'}</span>
            </div>
          )}
        </div>
        {!hover || !adminMode ? null : (
          <div className={styles.userItemEditBtn}>
            <div>
              <Button
                type="primary"
                onClick={onEdit}
              >
                <Icon type="edit" />
Editer
              </Button>
              {' '}
              <Button
                type="danger"
                onClick={onDelete}
              >
                <Icon type="delete" />
Supprimer
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
UserItem.propTypes = {
  userId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  admin: PropTypes.bool.isRequired,
  adminMode: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onExpiredAuth: PropTypes.func.isRequired,
};
