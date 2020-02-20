import 'package:area_mobile/User.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'package:area_mobile/MeRoute.dart';

class WebView extends StatefulWidget {
  final String website;

  WebView({@required this.website});

  @override
  State<StatefulWidget> createState() {
    if (website == "facebook")
      return StateWebViewf();
    else
      return StateWebViewg();
  }
}

class StateWebViewf extends State<WebView> {
  final String url = 'https://area-oui.herokuapp.com/auth/facebook';
  final String urlToken = 'https://area-oui.herokuapp.com/api/getToken';
  final flutterWebviewPlugin = new FlutterWebviewPlugin();

  String token;

  @override
  void initState() {
    super.initState();

    // flutterWebviewPlugin.close();
    flutterWebviewPlugin.onUrlChanged.listen((String url) {
      if (url.contains("/me")) {
        flutterWebviewPlugin.close();
        flutterWebviewPlugin.launch(urlToken);
      } else if (url.contains("/api/token")) {
        token = url;
        flutterWebviewPlugin.close();
        Navigator.pop(context);
        token = token.substring(token.lastIndexOf("/") + 1, token.length);
        print(token);
        User user = new User(token);
        user.email = "";
        Navigator.of(context).push(MaterialPageRoute(
          builder: (context) => MeRoute(user),
        ));
      }
    });
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fWV = new FlutterWebviewPlugin();
    return new MaterialApp(
      routes: {
        "/": (_) => new WebviewScaffold(
              url: url,
              appBar: new AppBar(
                title: new Text("Facebook Autentication"),
                actions: <Widget>[
                  IconButton(
                    icon: Icon(Icons.close),
                    onPressed: () {
                      fWV.close();
                      Navigator.pop(context);
                    },
                  )
                ],
              ),
            ),
      },
    );
  }
}

class StateWebViewg extends State<WebView> {
  final String url = "https://area-oui.herokuapp.com/api/auth/google";
  String token;

  @override
  void initState() {
    super.initState();

    // _googleSignIn.onCurrentUserChanged.listen((GoogleSignInAccount account) async {
    //   if (account != null) {
    //     Navigator.pop(context);
    //     User user = new User(token);
    //     Navigator.of(context).push(MaterialPageRoute(
    //       builder: (context) => MeRoute(user),
    //     ));
    //   } else {
    //     Navigator.pop(context);
    //   }
    //   _googleSignIn.signInSilently().whenComplete(() => dismissLoading());
    // });
  }

  @override
  Widget build(BuildContext context) {
    return new MaterialApp(
      routes: {
        "/": (_) => new WebviewScaffold(
              url: url,
              appBar: new AppBar(
                title: Text("Google Authentication"),
                actions: <Widget>[
                  IconButton(
                    icon: Icon(Icons.close),
                    onPressed: () {
                      Navigator.pop(context);
                    },
                  )
                ],
              ),

            )
      },
    );
  }

  GoogleSignIn _googleSignIn = new GoogleSignIn(
   scopes: [
      'email',
      'https://www.googleapis.com/auth/contacts.readonly',
   ],
);
}
