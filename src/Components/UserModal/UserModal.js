import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Input, Alert, Checkbox,
} from 'antd';
import UserModel from '../../Models/User';
import styles from './UserModal.module.css';

export default class UserModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.user ? props.user.username : '',
      admin: props.user ? props.user.admin : false,
    };
  }

  hasChanged() {
    const {
      username, admin,
    } = this.state;
    const {
      user,
    } = this.props;
    return (username !== user.username
      || admin !== user.admin);
  }

  render() {
    const {
      username, admin,
    } = this.state;
    const {
      user, onValid, onCancel,
    } = this.props;
    const noChangeMsg = user && !this.hasChanged() ? 'Pas de modification effectuée!' : null;
    const errorMsg = username.length > 0 ? null : 'Vous devez entrer un nom!';
    return (
      <Modal
        title={user ? 'Modification de membre' : 'Ajout de membre'}
        visible
        onOk={() => onValid(new UserModel(
          user ? user._id : null,
          username.trimEnd(),
          admin,
        ))}
        onCancel={() => onCancel()}
        cancelText="Annuler"
        okButtonProps={{ disabled: errorMsg || noChangeMsg }}
      >
        <div>
          {errorMsg ? <Alert message={errorMsg} type="error" /> : null}
          {noChangeMsg ? <Alert message={noChangeMsg} type="warning" /> : null}
          <label htmlFor="nameInput">
Nom
            {' '}
            <Input id="nameInput" required value={username} placeholder="Nom du membre" onChange={e => this.setState({ username: e.target.value.trimStart() })} />
          </label>
          <br />
          <br />
          <label htmlFor="adminInput">
Admin
            {' '}
            <Checkbox
              id="adminInput"
              checked={admin}
              onChange={() => {
                this.setState({ admin: !admin });
              }}
            />
          </label>
        </div>

      </Modal>
    );
  }
}
UserModal.propTypes = {
  user: PropTypes.instanceOf(UserModel),
  onValid: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
UserModal.defaultProps = {
  user: null,
};
