import React from 'react';
import PropTypes from 'prop-types';
import {
  Input, Button, Icon,
} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle, faCommentAlt,
} from '@fortawesome/free-solid-svg-icons';
import styles from './InstrumentItem.module.css';

const { TextArea } = Input;

export default class InstrumentItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
    };
  }

  render() {
    const {
      take, name, user, com, onEdit, onDelete, admin, onTakeDrop,
    } = this.props;
    const { hover } = this.state;
    return (
      <div
        className={styles.InstrumentItem}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      >
        <div>
          <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{name}</span>
        </div>
        <div className={styles.instrumentItemUser}>
          <span>
            {user ? (
              <p>
                <span style={{ color: 'red' }}><FontAwesomeIcon icon={faCircle} /></span>
                {' '}
Emprunté par
                {' '}
                <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{user}</span>
              </p>
            )
              : (
                <p>
                  <span style={{ color: 'green' }}><FontAwesomeIcon icon={faCircle} /></span>
                  {' '}
                  Disponible au
                  {' '}
                  <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>stock</span>
                </p>
              )}
          </span>
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
                    onClick={onTakeDrop}
                  >
                    <Icon type={!take ? 'vertical-align-bottom' : 'vertical-align-top'} />
                    {!take ? 'Déposer au studio' : 'Emprunter'}
                  </Button>
                </span>
                {!admin ? null
                  : (
                    <span>
                      {'- '}
                      <span className={styles.editBtnSpan}>
                        <Button
                          type="primary"
                          onClick={onEdit}
                        >
                          <Icon type="edit" />
      Editer
                        </Button>
                      </span>
                      <span className={styles.editBtnSpan}>
                        <Button
                          type="danger"
                          onClick={onDelete}
                        >
                          <Icon type="delete" />
      Supprimer
                        </Button>
                      </span>
                    </span>
                  )
        }
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
InstrumentItem.propTypes = {
  take: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  user: PropTypes.string,
  com: PropTypes.string.isRequired,
  admin: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onTakeDrop: PropTypes.func.isRequired,
};
InstrumentItem.defaultProps = {
  user: null,
};
