import React from 'react';
import PropTypes from 'prop-types';
import {
  Spin, Icon, Button, notification, Modal, Input, Checkbox,
} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import Globals from '../../Globals';
import InstrumentItem from '../InstrumentItem';
import InstrumentModal from '../InstrumentModal';
import TakeDropModal from '../TakeDropModal';
import InstrumentModel from '../../Models/Instrument';
import styles from './Instruments.module.css';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

const openNotificationWithIcon = (type, message) => {
  notification[type]({
    message,
    description:
      '',
  });
};

export default class Instruments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      instruments: null,
      profile: null,
      editingInstrumentID: null,
      deletingInstrumentID: null,
      takeDropInstrumentID: null,
      filter: '',
      filterAvailable: false,
      filterRent: false,
    };
  }

  componentDidMount() {
    this.refresh();
  }

  onEdit = (newInstrument) => {
    const { onExpiredAuth } = this.props;
    const body = JSON.stringify({
      id: newInstrument._id,
      name: newInstrument.name,
      user: newInstrument.user ? newInstrument.user._id : null,
      com: newInstrument.com,
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
    window.fetch(`${Globals.APIURL}instruments/update`, myInit).then((res) => {
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
        const { instruments } = data;
        openNotificationWithIcon('success', 'Instrument mis à jour!');
        this.setState({
          instruments: instruments.map(ins => InstrumentModel.fromJSON(ins))
            .sort((a, b) => a.name > b.name),
          editingInstrumentID: null,
        });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  onAdd = (newInstrument) => {
    const { onExpiredAuth } = this.props;
    const myInit = {
      method: 'POST',
      headers: {
        'x-access-token': Globals.TOKEN,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        name: newInstrument.name,
        user: newInstrument.user ? newInstrument.user._id : null,
        com: newInstrument.com,
      }),
      mode: 'cors',
      cache: 'default',
    };
    window.fetch(`${Globals.APIURL}instruments/add`, myInit).then((res) => {
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
        const { instruments } = data;
        openNotificationWithIcon('success', 'Instrument ajouté!');
        this.setState({
          instruments: instruments.map(ins => InstrumentModel.fromJSON(ins))
            .sort((a, b) => a.name > b.name),
          editingInstrumentID: null,
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
    const { deletingInstrumentID } = this.state;
    const myInit = {
      method: 'POST',
      headers: {
        'x-access-token': Globals.TOKEN,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        id: deletingInstrumentID,
      }),
      mode: 'cors',
      cache: 'default',
    };
    window.fetch(`${Globals.APIURL}instruments/delete`, myInit).then((res) => {
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
        const { instruments } = data;
        openNotificationWithIcon('success', 'Instrument supprimé!');
        this.setState({
          instruments: instruments.map(ins => InstrumentModel.fromJSON(ins))
            .sort((a, b) => a.name > b.name),
          deletingInstrumentID: null,
        });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  onTake=(com) => {
    const { onExpiredAuth } = this.props;
    const { instruments, profile, takeDropInstrumentID } = this.state;
    const oldInstrument = instruments.find(ins => ins._id === takeDropInstrumentID);
    const body = JSON.stringify({
      id: oldInstrument._id,
      name: oldInstrument.name,
      user: profile._id,
      com,
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
    window.fetch(`${Globals.APIURL}instruments/update`, myInit).then((res) => {
      res.json().then((data) => {
        if (data.error) {
          if (data.error === 'notAuthenticated') {
            onExpiredAuth();
          }
          return;
        }
        const { instruments: freshInstruments } = data;
        openNotificationWithIcon('success', 'Instrument emprunté!');
        this.setState(prevState => ({
          instruments: freshInstruments.map(ins => InstrumentModel.fromJSON(ins))
            .sort((a, b) => a.name > b.name),
          profile: Object.assign(prevState.profile,
            {
              instruments: prevState.profile.instruments.concat([{
                _id: oldInstrument._id,
                name: oldInstrument.name,
                com,
              }]),
            }),
          takeDropInstrumentID: null,
        }));
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  onDrop=(com) => {
    const { onExpiredAuth } = this.props;
    const { instruments, takeDropInstrumentID } = this.state;
    const newInstrument = instruments.find(ins => ins._id === takeDropInstrumentID);
    const body = JSON.stringify({
      id: newInstrument._id,
      name: newInstrument.name,
      user: null,
      com,
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
    window.fetch(`${Globals.APIURL}instruments/update`, myInit).then((res) => {
      res.json().then((data) => {
        if (data.error) {
          if (data.error === 'notAuthenticated') {
            onExpiredAuth();
          }
          return;
        }
        const { instruments: freshInstruments } = data;
        openNotificationWithIcon('success', 'Instrument deposé!');
        this.setState(prevState => ({
          instruments: freshInstruments.map(ins => InstrumentModel.fromJSON(ins))
            .sort((a, b) => a.name > b.name),
          profile: Object.assign(prevState.profile,
            {
              instruments: prevState.profile.instruments
                .filter(ins => ins._id !== takeDropInstrumentID),
            }),
          takeDropInstrumentID: null,
        }));
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

    filterAvailables=(bool) => {
      this.setState({
        filterAvailable: bool, filterRent: false,
      });
    }

    filterRents=(bool) => {
      this.setState({
        filterAvailable: false, filterRent: bool,
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
      window.fetch(`${Globals.APIURL}instruments`, myInit).then((res) => {
        res.json().then((data) => {
          if (data.error) {
            if (data.error === 'notAuthenticated') {
              onExpiredAuth();
            }
            return;
          }
          const { instruments, profile } = data;
          this.setState({
            instruments: instruments.map(ins => InstrumentModel.fromJSON(ins))
              .sort((a, b) => a.name > b.name),
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
        instruments,
        profile,
        editingInstrumentID,
        deletingInstrumentID,
        takeDropInstrumentID,
        filter,
        filterAvailable,
        filterRent,
      } = this.state;
      const {
        onExpiredAuth,
      } = this.props;
      let filteredInstuments = null;
      if (instruments) {
        filteredInstuments = instruments
          .filter(ins => ins.name.match(new RegExp(filter, 'gi')));
      }
      if (instruments && filterAvailable) {
        filteredInstuments = filteredInstuments.filter(ins => ins.user === null);
      } else if (instruments && filterRent) {
        filteredInstuments = filteredInstuments.filter(ins => ins.user !== null);
      }
      const take = takeDropInstrumentID && (instruments
        .find(ins => ins._id === takeDropInstrumentID)
        .user === null
        || instruments.find(ins => ins._id === takeDropInstrumentID)
          .user._id !== profile._id);
      return (
        <div className={styles.Instruments}>
          <h1 className={styles.header}>
Instruments
          </h1>
          {instruments === null ? <Spin indicator={antIcon} />
            : (
              <div>
                {editingInstrumentID ? (
                  <InstrumentModal
                    instrument={editingInstrumentID && editingInstrumentID.length > -1
                      ? instruments.find(ins => ins._id === editingInstrumentID)
                      : null}
                    onValid={newInstrument => (editingInstrumentID.length > -1
                      ? this.onEdit(newInstrument)
                      : this.onAdd(newInstrument))}
                    onCancel={() => this.setState({ editingInstrumentID: null })}
                    onExpiredAuth={() => onExpiredAuth()}
                  />
                ) : null}
                {deletingInstrumentID ? (
                  <Modal
                    title="Confirmer la suppression de cet instrument?"
                    visible
                    onOk={() => this.onDelete()}
                    okType="danger"
                    cancelText="Annuler"
                    onCancel={() => this.setState({ deletingInstrumentID: null })}
                  />
                ) : null}
                {!takeDropInstrumentID ? null : (
                  <TakeDropModal
                    take={take}
                    instrument={instruments.find(ins => ins._id === takeDropInstrumentID).name}
                    onValid={com => (take ? this.onTake(com) : this.onDrop(com))}
                    onCancel={() => this.setState({ takeDropInstrumentID: null })}
                  />
                )}
                <div className={styles.upList}>
                  {!profile.admin ? null
                    : (
                      <div>
                        <Button
                          type="primary"
                          style={{ backgroundColor: 'green', borderColor: 'green' }}
                          onClick={() => {
                            this.setState({ editingInstrumentID: -1 });
                          }}
                        >
                          <Icon type="plus-circle" />
  Ajouter un instrument
                        </Button>
                        <br />
                        <br />
                      </div>
                    )}
                  <div className={styles.filters}>
                    <h5>Recherche</h5>
                    <p><Input title="Rechercher un instrument" placeholder="Rechercher un instrument" value={filter} onChange={e => this.setState({ filter: e.target.value.trimStart() })} /></p>
                    <p>
                      <Checkbox
                        onChange={e => this.filterAvailables(e.target.checked)}
                        checked={filterAvailable}
                      >
                        <span style={{ color: 'green' }}><FontAwesomeIcon icon={faCircle} /></span>
                        {' Disponibles'}
                      </Checkbox>
                    </p>
                    <p>
                      <Checkbox
                        onChange={e => this.filterRents(e.target.checked)}
                        checked={filterRent}
                      >
                        <span style={{ color: 'red' }}><FontAwesomeIcon icon={faCircle} /></span>
                        {' Empruntés'}
                      </Checkbox>
                    </p>
                  </div>
                </div>
                <div className={styles.intrumentList}>
                  {filteredInstuments.map(instru => (
                    <InstrumentItem
                      key={instru.name}
                      take={instru.user === null || instru.user._id !== profile._id}
                      name={instru.name}
                      user={instru.user ? instru.user.username : null}
                      com={instru.com}
                      admin={profile.admin}
                      onEdit={() => this.setState({ editingInstrumentID: instru._id })}
                      onDelete={() => this.setState({ deletingInstrumentID: instru._id })}
                      onTakeDrop={() => this.setState({ takeDropInstrumentID: instru._id })}
                    />
                  ))}
                </div>
              </div>
            )}
        </div>
      );
    }
}
Instruments.propTypes = {
  onExpiredAuth: PropTypes.func.isRequired,
};
