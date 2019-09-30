import React from 'react';
import PropTypes from 'prop-types';
import {
  Spin, Icon, notification,
} from 'antd';
import TakeDropItem from '../TakeDropItem';
import TakeDropModal from '../TakeDropModal';
import InstrumentModel from '../../Models/Instrument';
import styles from './Take.module.css';
import Globals from '../../Globals';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

const openNotificationWithIcon = (type, message) => {
  notification[type]({
    message,
    description:
      '',
  });
};

export default class Take extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      instruments: null,
      profile: null,
      modalID: null,
    };
  }

  componentDidMount() {
    this.refresh();
  }

  onTake=(com) => {
    const { onExpiredAuth } = this.props;
    const { instruments, profile, modalID } = this.state;
    const oldInstrument = instruments.find(ins => ins._id === modalID);
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
    const { instruments, profile, modalID } = this.state;
    return (!profile
      ? <Spin indicator={antIcon} />
      : (
        <div className="Take">
          {!modalID ? null : (
            <TakeDropModal
              take
              instrument={instruments.find(ins => ins._id === modalID).name}
              onValid={com => this.onTake(com)}
              onCancel={() => this.setState({ modalID: null })}
            />
          )}
          <h1 className="header">{`Emprunter un instrument au nom de ${profile.username}`}</h1>
          {instruments.length === 0 ? <span style={{ fontWeight: 'bold' }}>{'Aucun instrument n\'est disponible!'}</span> : (
            <div>
              <div className="intrumentList">
                {instruments.sort((a, b) => a.name > b.name).map(ins => (
                  <TakeDropItem
                    key={ins.name}
                    take
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
Take.propTypes = {
  onExpiredAuth: PropTypes.func.isRequired,
};
