import 'dart:convert';
import 'package:http/http.dart' as http;

import 'package:flutter/material.dart';
// import 'package:area_mobile/User.dart';

class Register extends StatelessWidget {
  final GlobalKey<FormState> _formKey = new GlobalKey<FormState>();
  final GlobalKey<ScaffoldState> _scaffoldKey = new GlobalKey<ScaffoldState>();
  final username = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  final confirmpsd = TextEditingController();
  BuildContext _context;

  Register();
  @override
  Widget build(BuildContext context) {
    _context = context;
    return Scaffold(
      key: _scaffoldKey,
        appBar: AppBar(title: const Text('Register')),
        body: Center(
            child: new Form(
                key: _formKey,
                autovalidate: true,
                child: new ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  children: <Widget>[
                    new TextFormField(
                      controller: username,
                      decoration: const InputDecoration(
                        icon: const Icon(Icons.person),
                        labelText: 'Username',
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    new TextFormField(
                      controller: email,
                      decoration: const InputDecoration(
                        icon: const Icon(Icons.email),
                        labelText: 'Email',
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    new TextFormField(
                      controller: password,
                      decoration: const InputDecoration(
                        icon: const Icon(Icons.lock),
                        labelText: 'Password',
                      ),
                      obscureText: true,
                    ),
                    new TextFormField(
                      controller: confirmpsd,
                      decoration: const InputDecoration(
                        icon: const Icon(Icons.lock),
                        labelText: 'Confirm Password',
                      ),
                      obscureText: true,
                    ),
                    new Container(
                        padding: const EdgeInsets.only(
                            left: 40.0, top: 20.0, right: 40.0),
                        child: new RaisedButton(
                          child: const Text('Register'),
                          onPressed: _submitRegister,
                        ))
                  ],
                ))));
  }

  void _submitRegister() {
    final FormState form = _formKey.currentState;
    var json = {
      'username': username.text,
      'email': email.text,
      'password': password.text
    };

    if (password.text.length < 6 || password.text != confirmpsd.text) {
      showMessage("check your password");
      return;
    }

    if (!form.validate()) {
        showMessage('Register form not valid');
        return;
    } else {
      form.save();
      RegisterService reg = new RegisterService();
      reg.sendForm(json).then((err) {
        if (!reg.done) {
          showMessage(reg.getError());
          return ;
        }
      });
    }
    Navigator.pop(_context);
  }

  void showMessage(String msg, [MaterialColor color = Colors.red]) {
    _scaffoldKey.currentState
      .showSnackBar(new SnackBar(backgroundColor: color, content: new Text(msg == null ? " " : msg)));
  }
}

class RegisterService {
  static const _URL = 'http://area-oui.herokuapp.com/api/register';
  var client = new http.Client();
  var done = false;
  var errorMsg = "";

  Future<Register> sendForm(Map<String, dynamic> json) async {
    try {
      print(json);
      final response = await client
          .post(_URL,
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              body: json)
          .then((response) {
        Map<String, dynamic> user = jsonDecode(response.body);
        if (user['success'] == false) {
          errorMsg = user['message'];
        }
      });
      return response;
    } catch (e) {
      print('Server Register Error');
      print(e);
      return null;
    }
  }

  String getError() {
    return errorMsg;
  }
}
