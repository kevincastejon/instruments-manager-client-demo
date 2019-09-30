import UserModel from '../User';

export default class Instrument {
  constructor(_id, name, user, com) {
    this._id = _id;
    this.name = name;
    this.user = user;
    this.com = com;
  }

  clone() {
    return Instrument.fromJSON(this.toJSON());
  }

  toJSON() {
    return ({
      _id: this._id,
      name: this.name,
      user: this.user.toJSON(),
      com: this.com,
    });
  }

  static fromJSON(json) {
    return new Instrument(json._id, json.name, json.user
      ? UserModel.fromJSON(json.user)
      : null, json.com);
  }
}
