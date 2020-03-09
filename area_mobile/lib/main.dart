import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'dart:async';
import 'dart:convert';
import 'package:area_mobile/User.dart';
import 'package:area_mobile/MeRoute.dart';
import 'package:area_mobile/register.dart' as reg;
import 'package:area_mobile/webView.dart' as webView;


void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AREA Login',
      home: new HomePage(),
      theme: ThemeData(
        primarySwatch: Colors.lime
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}

class HomePage extends StatefulWidget {
  final String title = "AREA login";

  @override
  _HomePageState createState() => new _HomePageState();
}

class _HomePageState extends State<HomePage> with SingleTickerProviderStateMixin {
  final GlobalKey<FormState> _formKey = new GlobalKey<FormState>();
  final GlobalKey<ScaffoldState> _scaffoldKey = new GlobalKey<ScaffoldState>();
  final email = TextEditingController();
  final password = TextEditingController();
  bool _obscure = true;
  var _context;

  @override
  Widget build(BuildContext context) {
    _context = context;
    return new Scaffold(
      key: _scaffoldKey,
      appBar: new AppBar(
        title: new Text(widget.title),
      ),
      body: new SafeArea(
          top: false,
          bottom: false,
          child: new Form(
              key: _formKey,
              autovalidate: true,
              child: new ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                children: <Widget>[
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
                    decoration: InputDecoration(
                      icon: const Icon(Icons.lock),
                      labelText: 'Password',
                      suffixIcon: IconButton(onPressed: () {setState(() {
                        _obscure = !_obscure;
                      });},
                        icon: Icon(Icons.remove_red_eye),
                        padding: EdgeInsets.only(top: 15.0),)
                    ),
                    obscureText: _obscure,
                  ),
                  new Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5.0, vertical: 15.0),
                      child: new ButtonBar(
                        alignment: MainAxisAlignment.center,
                        children: <Widget>[
                          new RaisedButton(
                            child: const Text('Login'),
                            color: Colors.blue,
                            onPressed: _submitForm,
                          ),
                          new RaisedButton(
                            child: const Text('Register'),
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (context) => reg.Register())
                              );
                            },
                          ),
                          new RaisedButton(
                            child: Image.asset('assets/icon_facebook.png',
                            height: 35,),
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (context) => webView.WebView(website: "facebook",))
                              );
                            },                          
                            color: Colors.cyan,
                          ),
                          new RaisedButton(
                            child: Image.asset('assets/icon_google.png',
                            height: 35,),
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (context) => webView.WebView(website: "google",))
                              );
                            },
                            color: Colors.cyan,
                          ),
                        ],
                      )),
                ],
              ))),
    );
  }

  void _submitForm() {
    final FormState form = _formKey.currentState;

    if (!form.validate()) {
      showMessage('Form not valid!');
    } else {
      form.save();
      LoginService serv = new LoginService();
      serv.createContact(email.text, password.text).then((err) {
        if (serv.done == false) {
          showMessage(serv.getErrorMessage());
        } else if (serv.done == true) {
          User user = new User(serv.token);
          user.email = email.text;
          Navigator.push(_context, MaterialPageRoute(builder: (context) => MeRoute(user)));
        }
      });
    }
  }

  void showMessage(String msg, [MaterialColor color = Colors.red]) {
    _scaffoldKey.currentState
      .showSnackBar(new SnackBar(backgroundColor: color, content: new Text(msg)));
  }
}

class LoginService {
  static const _serviceUrl = 'http://area-oui.herokuapp.com/api/login';
  var client = new http.Client();
  var done = false;
  var errorMessage;
  var token;

  Future<String> createContact(String email, String password) async {
    try {
      final response =
          await client.post(_serviceUrl, headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: {"email" :  email.toString().trim(), "password" : password.toString()}).then((response) {
            Map<String, dynamic> user = jsonDecode(response.body);
            var success = user['success'];
            if (success == false) {
              errorMessage = user['message'];
              done = false;
            } else if (success == true) {
              done = true;
              token = user['token'];
              token = token.substring(4);
            }
          });
      return response;
    } catch (e) {
      print('Server Exception!!!');
      print(e);
      return null;
    }
  }

  String getErrorMessage() {
    return errorMessage;
  }

}
