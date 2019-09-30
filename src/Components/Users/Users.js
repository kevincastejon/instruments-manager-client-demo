import React from 'react';
import PropTypes from 'prop-types';
import {
  Spin, Icon, Button, notification, Modal, Input,
} from 'antd';
import Globals from '../../Globals';
import UserItem from '../UserItem';
import UserModal from '../UserModal';
import UserModel from '../../Models/User';
import styles from './Users.module.css';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

const openNotificationWithIcon = (type, message) => {
  notification[type]({
    message,
    description:
      '',
  });
};

export default class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null,
      profile: null,
      editingUserID: null,
      deletingUserID: null,
      filter: '',
    };
  }

  componentDidMount() {
    this.refresh();
  }

  onEdit = (pNewUser) => {
    const { profile } = this.state;
    const newUser = pNewUser;
    if (newUser._id === profile._id && newUser.admin === false) {
      openNotificationWithIcon('warning', 'Vous ne pouvez pas modifier votre propre niveau d\'accès!');
      newUser.admin = true;
    }
    const { onExpiredAuth } = this.props;
    const body = JSON.stringify({
      id: newUser._id,
      username: newUser.username,
      admin: newUser.admin,
    });
    const myInit = {
      method: 'POST',
      headers: {
        'x-access-token': Globals.TOKEN,
        'Content-type': 'application/json',
      },
      body,
      mode: 'cors',
      cache: 'default',
    };
    window.fetch(`${Globals.APIURL}users/update`, myInit).then((res) => {
      res.json().then((data) => {
        if (data.error) {
          if (data.error === 'notAuthenticated') {
            onExpiredAuth();
          } else if (data.error === 'notAdmin') {
            this.setState(prevState => ({
              profile: Object.assign(prevState.profile,
                { admin: false }),
            }));
          } else if (data.error === 'duplicate') {
            openNotificationWithIcon('error', 'Nom déjà utilisé!');
          }
          return;
        }
        const { users } = data;
        openNotificationWithIcon('success', 'Membre mis à jour!');
        this.setState({
          users: users.map(ins => UserModel.fromJSON(ins))
            .sort((a, b) => a.username > b.username),
          editingUserID: null,
        });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  onAdd = (newUser) => {
    const { onExpiredAuth } = this.props;
    const myInit = {
      method: 'POST',
      headers: {
        'x-access-token': Globals.TOKEN,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        username: newUser.username,
        admin: newUser.admin,
      }),
      mode: 'cors',
      cache: 'default',
    };
    window.fetch(`${Globals.APIURL}users/add`, myInit).then((res) => {
      res.json().then((data) => {
        if (data.error) {
          if (data.error === 'notAuthenticated') {
            onExpiredAuth();
          } else if (data.error === 'notAdmin') {
            this.setState(prevState => ({
              profile: Object.assign(prevState.profile,
                { admin: false }),
            }));
          } else if (data.error === 'duplicate') {
            openNotificationWithIcon('error', 'Nom déjà utilisé!');
          }
          return;
        }
        const { users } = data;
        openNotificationWithIcon('success', 'Membre ajouté!');
        this.setState({
          users: users.map(ins => UserModel.fromJSON(ins))
            .sort((a, b) => a.username > b.username),
          editingUserID: null,
        });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  onDelete = () => {
    const { onExpiredAuth } = this.props;
    const { deletingUserID } = this.state;
    const myInit = {
      method: 'POST',
      headers: {
        'x-access-token': Globals.TOKEN,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        id: deletingUserID,
      }),
      mode: 'cors',
      cache: 'default',
    };
    window.fetch(`${Globals.APIURL}users/delete`, myInit).then((res) => {
      res.json().then((data) => {
        if (data.error) {
          if (data.error === 'notAuthenticated') {
            onExpiredAuth();
          } else if (data.error === 'notAdmin') {
            this.setState(prevState => ({
              profile: Object.assign(prevState.profile,
                { admin: false }),
            }));
          }
          return;
        }
        const { users } = data;
        openNotificationWithIcon('success', 'Membre supprimé!');
        this.setState({
          users: users.map(ins => UserModel.fromJSON(ins))
            .sort((a, b) => a.username > b.username),
          deletingUserID: null,
        });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  refresh() {
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
        const { users, profile } = data;
        this.setState({
          users: users.map(usr => UserModel.fromJSON(usr))
            .sort((a, b) => a.username > b.username),
          profile,
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
      users,
      profile,
      editingUserID,
      deletingUserID,
      filter,
    } = this.state;
    const { onExpiredAuth } = this.props;
    const filteredUsers = users ? users.filter(user => user.username.match(new RegExp(filter, 'gi'))) : null;
    return (
      <div className={styles.Users}>
        <h1 className={styles.header}>Membres</h1>
        {filteredUsers === null ? <Spin indicator={antIcon} />
          : (
            <div>
              {editingUserID ? (
                <UserModal
                  user={editingUserID && editingUserID.length > -1
                    ? filteredUsers.find(ins => ins._id === editingUserID)
                    : null}
                  onValid={newUser => (editingUserID.length > -1
                    ? this.onEdit(newUser)
                    : this.onAdd(newUser))}
                  onCancel={() => this.setState({ editingUserID: null })}
                />
              ) : null}
              {deletingUserID ? (
                <Modal
                  title="Confirmer la suppression de ce membre?"
                  visible
                  onOk={() => this.onDelete()}
                  okType="danger"
                  cancelText="Annuler"
                  onCancel={() => this.setState({ deletingUserID: null })}
                />
              ) : null}
              <div className={styles.upList}>
                {!profile.admin ? null
                  : (
                    <Button
                      type="primary"
                      style={{ backgroundColor: 'green', borderColor: 'green' }}
                      onClick={() => {
                        this.setState({ editingUserID: -1 });
                      }}
                    >
                      <Icon type="plus-circle" />
  Ajouter un membre
                    </Button>
                  )}
                <div className={styles.filters}>
                  <h5>Recherche</h5>
                  <p><Input title="Rechercher un membre" placeholder="Rechercher un membre" value={filter} onChange={e => this.setState({ filter: e.target.value.trimStart() })} /></p>
                </div>
              </div>
              <div className={styles.userList}>
                {filteredUsers.map(usr => (
                  <UserItem
                    key={usr.username}
                    userId={usr._id}
                    username={usr.username}
                    admin={usr.admin}
                    adminMode={profile.admin}
                    onExpiredAuth={onExpiredAuth}
                    onEdit={() => {
                      this.setState({ editingUserID: usr._id });
                    }}
                    onDelete={() => {
                      if (usr._id === profile._id) {
                        openNotificationWithIcon('error', 'Vous ne pouvez pas vous supprimer vous même!');
                      } else {
                        this.setState({ deletingUserID: usr._id });
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
      </div>
    );
  }
}
Users.propTypes = {
  onExpiredAuth: PropTypes.func.isRequired,
};
