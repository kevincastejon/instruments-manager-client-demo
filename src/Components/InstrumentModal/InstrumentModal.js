import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Input, Spin, Select, Icon, Alert,
} from 'antd';
import Globals from '../../Globals';
import InstrumentModel from '../../Models/Instrument';
import UserModel from '../../Models/User';
import styles from './InstrumentModal.module.css';

const { Option } = Select;
const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
export default class InstrumentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.instrument ? props.instrument.name : '',
      user: props.instrument ? props.instrument.user : null,
      com: props.instrument ? props.instrument.com : '',
      users: null,
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
    window.fetch(`${Globals.APIURL}users`, myInit).then((res) => {
      res.json().then((data) => {
        if (data.error) {
          if (data.error === 'notAuthenticated') {
            onExpiredAuth();
          }
          return;
        }
        const { users } = data;
        if (users) {
          this.setState({ users: users.map(usr => UserModel.fromJSON(usr)) });
        } else {
          onExpiredAuth();
        }
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  hasChanged() {
    const {
      name, user, com,
    } = this.state;
    const {
      instrument,
    } = this.props;
    return (name !== instrument.name
      || (user && !instrument.user)
      || (!user && instrument.user)
      || ((user && instrument.user) && (user._id !== instrument.user._id))
      || com !== instrument.com);
  }

  render() {
    const {
      name, user, com, users,
    } = this.state;
    const {
      instrument, onValid, onCancel,
    } = this.props;
    const noChangeMsg = instrument && !this.hasChanged() ? 'Pas de modification effectuée!' : null;
    const errorMsg = name.length > 0 ? null : 'Vous devez entrer un nom!';
    return (
      <Modal
        title={instrument ? "Modification d'instrument" : "Ajout d'instrument"}
        visible
        onOk={() => onValid(new InstrumentModel(
          instrument ? instrument._id : null,
          name.trimEnd(),
          user,
          com.trimEnd(),
        ))}
        onCancel={() => onCancel()}
        cancelText="Annuler"
        okButtonProps={{ disabled: errorMsg || noChangeMsg }}
      >
        {users === null ? <Spin indicator={antIcon} />
          : (
            <div>
              {errorMsg ? <Alert message={errorMsg} type="error" /> : null}
              {noChangeMsg ? <Alert message={noChangeMsg} type="warning" /> : null}
              <label htmlFor="nameInput">
                {' '}
Nom
                <Input id="nameInput" required value={name} placeholder="Nom de l'instrument" onChange={e => this.setState({ name: e.target.value.trimStart() })} />
              </label>
              <br />
              <br />
              <label htmlFor="userInput">
                {' '}
En possession de
                <Select
                  id="userInput"
                  defaultValue={user ? user._id : 'null'}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    this.setState({ user: value !== 'null' ? users.find(usr => usr._id === value) : null });
                  }}
                >
                  {[<Option key="null" value="null">Stock/Autre</Option>]
                    .concat(users
                      .map(usr => (
                        <Option
                          key={usr}
                          value={usr._id}
                        >
                          {usr.username}
                        </Option>
                      )))}
                </Select>
              </label>
              <br />
              <br />
              <label htmlFor="comInput">
                {' '}
              Commentaire

                <Input.TextArea
                  onChange={e => this.setState({ com: e.target.value.trimStart() })}
                  id="comInput"
                  style={{ resize: 'none' }}
                  value={com}
                  placeholder="Commentaire (optionel)"
                />
              </label>
            </div>
          )}
      </Modal>
    );
  }
}
InstrumentModal.propTypes = {
  instrument: PropTypes.instanceOf(InstrumentModel),
  onValid: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onExpiredAuth: PropTypes.func.isRequired,
};
InstrumentModal.defaultProps = {
  instrument: null,
};
