import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Input,
} from 'antd';
import styles from './TakeDropModal.module.css';

export default class TakeDropModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      com: '',
    };
  }

  render() {
    const { com } = this.state;
    const {
      take, instrument, onValid, onCancel,
    } = this.props;
    return (
      <Modal
        title={take ? "Emprunter l'instrument" : "Déposer l'instrument"}
        visible
        onOk={() => onValid(com)}
        onCancel={() => onCancel()}
        okText="Confirmer"
        cancelText="Annuler"
      >
        <h3>{instrument}</h3>
        <div>
          <label htmlFor="comInput">
            {' '}
              Commentaire

            <Input.TextArea
              onChange={e => this.setState({ com: e.target.value })}
              id="comInput"
              style={{ resize: 'none' }}
              value={com}
              placeholder="Commentaire (optionel)"
            />
          </label>
        </div>
      </Modal>
    );
  }
}
TakeDropModal.propTypes = {
  take: PropTypes.bool.isRequired,
  instrument: PropTypes.string.isRequired,
  onValid: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
