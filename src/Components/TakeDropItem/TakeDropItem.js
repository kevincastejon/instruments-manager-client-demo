import React from 'react';
import PropTypes from 'prop-types';
import {
  Input, Button, Icon,
} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './TakeDropItem.module.css';

const { TextArea } = Input;

export default class TakeDropItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
    };
  }

  render() {
    const {
      take, name, com, onSelect,
    } = this.props;
    const { hover } = this.state;
    return (
      <div
        className={styles.TakeDropItem}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      >
        <div>
          <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{name}</span>
        </div>
        {com.length
          ? (
            <div className={styles.instrumentItemCom}>
              <div className={styles.itemIcon}>
                <FontAwesomeIcon icon={faCommentAlt} />
              </div>
              <div className={styles.itemCom}>
                <TextArea
                  className={styles.instrumentItemComTextArea}
                  readOnly
                  autosize
                  value={com}
                />
              </div>
            </div>
          ) : null}
        {!hover ? null : (
          <div className={styles.instrumentItemEditBtn}>
            <div className={styles.instrumentItemEditBtn}>
              <div>
                <span className={styles.editBtnSpan}>
                  <Button
                    type="primary"
                    onClick={onSelect}
                  >
                    <Icon type={!take ? 'vertical-align-bottom' : 'vertical-align-top'} />
                    {!take ? 'Déposer' : 'Emprunter'}
                  </Button>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
TakeDropItem.propTypes = {
  take: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  com: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};
