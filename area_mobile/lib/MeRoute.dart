import 'dart:convert';

import 'package:area_mobile/createReaction.dart';
import 'package:flutter/material.dart';
import 'package:area_mobile/User.dart';
import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;
import 'dart:async';
import 'package:area_mobile/WidgetsView.dart';
import 'package:area_mobile/Widget.dart';
import 'package:area_mobile/WidgetSetting.dart';

import 'getData.dart';

class MeRoute extends StatefulWidget {
  final User user;
  const MeRoute(this.user);
  @override
  State<StatefulWidget> createState() {
    return MeRouteView();
  }
}

class MeRouteView extends State<MeRoute> {
  List<AWidget> data = List<AWidget>();
  List actions = List();
  List<String> sender = List();
  List<String> trigger = List();
  String result;
  final GlobalKey<ScaffoldState> _scaffoldKey = new GlobalKey<ScaffoldState>();

  var refreshKey = GlobalKey<RefreshIndicatorState>();

  callback(newData, newAction, newSender, newTrigger) {
    setState(() {
      data = newData;
      actions = newAction;
      sender = newSender;
      trigger = newTrigger;
    });
  }

  callbacksettings(newAction, index) {
    setState(() {
      actions[index] = newAction;
    });
  }

  Future<Null> refreshList() async {
    refreshKey.currentState?.show(atTop: false);
    await Future.delayed(Duration(seconds: 2));
    setState(() {
      data.clear();
      getUserData(widget.user.token, this, data, callback);
    });
    return null;
  }

  @override
  void initState() {
    super.initState();
    getUserData(widget.user.token, this, data, callback);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: Text(widget.user.email),
        centerTitle: true,
        automaticallyImplyLeading: false,
        actions: <Widget>[
          FlatButton(
            onPressed: () async {
              const _serviceUrl =
                  'https://area-oui.herokuapp.com/api/widgets/add';
              var client = new http.Client();
              await client.get(_serviceUrl, headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'authorization': widget.user.token
              }).then((response) {
                Map<String, dynamic> getted = jsonDecode(response.body);
                if (getted["success"] == true) {
                  data.clear();
                  getUserData(widget.user.token, this, data, callback);
                }
              });
            },
            child: Text("Add"),
          ),
        ],
      ),
      body: RefreshIndicator(
        key: refreshKey,
        child: ListView.builder(
          itemCount: actions.length,
          itemBuilder: (BuildContext context, int index) {
            return GestureDetector(
                child: Container(
                  padding: EdgeInsets.fromLTRB(10, 10, 10, 0),
                  height: 200,
                  width: double.maxFinite,
                  child: Card(
                    elevation: 5,
                    child: Padding(
                      padding: EdgeInsets.all(7),
                      child: Stack(
                        children: <Widget>[
                          Align(
                            alignment: Alignment.centerRight,
                            child: Stack(
                              children: <Widget>[
                                Padding(
                                  padding:
                                      const EdgeInsets.only(left: 10, top: 5),
                                  child: Column(
                                    children: <Widget>[
                                      Row(
                                        children: <Widget>[
                                          Align(
                                            alignment: Alignment.centerLeft,
                                            child: RichText(
                                              text: TextSpan(
                                                text: actions[index],
                                                style: TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    color: Colors.black,
                                                    fontSize: 20),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      Row(
                                        children: <Widget>[
                                          RichText(
                                            text: TextSpan(
                                              text: result,
                                              style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.black,
                                                  fontSize: 20),
                                            ),
                                          ),
                                        ],
                                      ),
                                      Row(
                                        children: <Widget>[
                                          Align(
                                            alignment: Alignment.centerLeft,
                                            child: Padding(
                                              padding: const EdgeInsets.only(
                                                  left: 20.0, top: 59),
                                              child: Row(
                                                children: <Widget>[
                                                  RaisedButton(
                                                      onPressed: () async {
                                                        List act = List();
                                                        act = actions[index].split(" ");
                                                        const _serviceUrl = 'https://area-oui.herokuapp.com/api/reaction';
                                                        var client = new http.Client();
                                                        await client.post(_serviceUrl, headers: {
                                                              'Content-Type': 'application/x-www-form-urlencoded',
                                                              'authorization': widget.user.token
                                                            }, body: {
                                                              "action": act[0], "reaction": act[1], "index": index.toString()
                                                            }).then((response) {
                                                          Map<String, dynamic> getted = jsonDecode(response.body);
                                                          if (getted["success"] == true) {
                                                            result = getted["message"];
                                                            _scaffoldKey.currentState.showSnackBar(new SnackBar(backgroundColor: Colors.green, content: new Text("Action sent")));
                                                            getUserData(widget.user.token, this, data, callback);
                                                          }
                                                        });
                                                      },
                                                      color: Colors.transparent,
                                                      child: Image.asset('images/start-button.png')),
                                                  RaisedButton(
                                                      onPressed: () async {
                                                        const _serviceUrl =
                                                            'https://area-oui.herokuapp.com/api/widgets/remove';
                                                        var client = new http.Client();
                                                        actions[index] = actions[index].replaceAll(' ', '0');
                                                        await client.post(_serviceUrl,
                                                            headers: {'Content-Type': 'application/x-www-form-urlencoded',
                                                              'authorization': widget.user.token
                                                            },
                                                            body: {"id": index.toString()
                                                        }).then((response) {
                                                          Map<String, dynamic> getted = jsonDecode(response.body);
                                                          if (getted["success"] == true) {
                                                            _scaffoldKey.currentState.showSnackBar(new SnackBar(
                                                                    backgroundColor: Colors.green,
                                                                    content: new Text("Deleted")));}
                                                            });
                                                        getUserData(widget.user.token, this, data, callback);
                                                      },
                                                      color: Colors.transparent,
                                                      child: Image.asset(
                                                          'images/exit.png'))
                                                ],
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                )
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                  ),
                ),
                onTap: () async {
                 Navigator.push(context, MaterialPageRoute(builder: (context) => WidgetSettingRoute(widget.user, this.actions[index], data, index, callbacksettings, sender, trigger)));
                });
          },
        ),
        onRefresh: refreshList,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) =>
                      WidgetView(widget.user, data)));
        },
        child: Icon(Icons.apps),
        backgroundColor: Colors.blueAccent,
      ),
    );
  }
}
