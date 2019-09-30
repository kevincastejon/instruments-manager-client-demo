import React from 'react';
import PropTypes from 'prop-types';
import {
  Spin, Icon, notification, Input,
} from 'antd';
import TakeDropItem from '../TakeDropItem';
import TakeDropModal from '../TakeDropModal';
import InstrumentModel from '../../Models/Instrument';
import styles from './Drop.module.css';
import Globals from '../../Globals';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

const openNotificationWithIcon = (type, message) => {
  notification[type]({
    message,
    description:
      '',
  });
};

export default class Drop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      instruments: null,
      profile: null,
      modalID: null,
      filter: '',
    };
  }

  componentDidMount() {
    this.refresh();
  }

  onDrop=(com) => {
    const { onExpiredAuth } = this.props;
    const { instruments, modalID } = this.state;
    const newInstrument = instruments.find(ins => ins._id === modalID);
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
            { instruments: prevState.profile.instruments.filter(ins => ins._id !== modalID) }),
          modalID: null,
        }));
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
    window.fetch(`${Globals.APIURL}instruments/`, myInit).then((res) => {
      res.json().then((data) => {
        if (data.error) {
          if (data.error === 'notAuthenticated') {
            onExpiredAuth();
          }
          return;
        }
        const { instruments, profile } = data;
        this.setState({ instruments, profile });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  render() {
    const {
      instruments, profile, filter, modalID,
    } = this.state;
    const filteredInstruments = !instruments ? null : instruments
      .filter(ins => profile.instruments.findIndex(owIns => owIns._id === ins._id) > -1 && ins.name.match(new RegExp(filter, 'gi')));
    return (!profile
      ? (
        <div>
          <h1 className={styles.header}>Chargement</h1>
          <Spin indicator={antIcon} />
        </div>
      )
      : (
        <div className={styles.Drop}>
          {!modalID ? null : (
            <TakeDropModal
              take={false}
              instrument={instruments.find(ins => ins._id === modalID).name}
              onValid={com => this.onDrop(com)}
              onCancel={() => this.setState({ modalID: null })}
            />
          )}
          <h1 className={styles.header}>{`Instruments empruntés par ${profile.username}`}</h1>
          {filteredInstruments.length === 0 ? <span style={{ fontWeight: 'bold' }}>{'Vous n\'êtes en possession d\'aucun instrument!'}</span> : (
            <div>
              <div className={styles.upList}>
                <div className={styles.filters}>
                  <h5>Recherche</h5>
                  <p><Input title="Rechercher un instrument" placeholder="Rechercher un instrument" value={filter} onChange={e => this.setState({ filter: e.target.value.trimStart() })} /></p>
                </div>
              </div>
              <div className={styles.intrumentList}>
                {filteredInstruments.sort((a, b) => a.name > b.name).map(ins => (
                  <TakeDropItem
                    key={ins.name}
                    take={false}
                    name={ins.name}
                    com={ins.com}
                    onSelect={() => this.setState({ modalID: ins._id })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )
    );
  }
}
Drop.propTypes = {
  onExpiredAuth: PropTypes.func.isRequired,
};
