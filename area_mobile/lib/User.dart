class User {
  String username;
  String token;
  String email;
  bool isConnected;
  User(String token) {
    this.token = token;
  }
}

class Register {
  String username;
  String email;
  String password;
}