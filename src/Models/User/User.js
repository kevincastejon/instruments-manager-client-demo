export default class User {
  constructor(_id, username, admin) {
    this._id = _id;
    this.username = username;
    this.admin = admin;
  }


  clone() {
    return User.fromJSON(this.toJSON());
  }

  toJSON() {
    return ({
      _id: this._id,
      username: this.username,
      admin: this.admin,
    });
  }

  static fromJSON(json) {
    return new User(json._id, json.username, json.admin);
  }
}
