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
import 'package:dropdownfield/dropdownfield.dart';

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
  final GlobalKey<ScaffoldState> _scaffoldKey = new GlobalKey<ScaffoldState>();

  Future<void> getUserData() async {
    const _serviceUrl = 'https://area-oui.herokuapp.com/api/me';
    var client = new http.Client();
    await client.get(_serviceUrl, headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'authorization': widget.user.token
    }).then((response) {
      Map<String, dynamic> getted = jsonDecode(response.body);
      if (getted["success"] == true) {
        this.setState(() {
          List widgets = getted["infos"]["widgets"];
          for (var i = 0; i < widgets.length; i++) {
            AWidget widget = new AWidget(widgets[i], "1.0", "description", "url", "image");
            data.add(widget);
          }
          actions = getted["infos"]["actions"];
          for (var i = 0; i < actions.length; i++) {
            actions[i] = actions[i].replaceAll('0', ' ');
          }
        });
      }
    });
  }

  var refreshKey = GlobalKey<RefreshIndicatorState>();

  Future<Null> refreshList() async {
    refreshKey.currentState?.show(atTop: false);
    await Future.delayed(Duration(seconds: 2));
    setState(() {
      data.clear();
      getUserData();
    });
    return null;
  }

  @override
  void initState() {
    super.initState();
    this.getUserData();
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
              const _serviceUrl = 'https://area-oui.herokuapp.com/api/widgets/add';
              var client = new http.Client();
              await client.get( _serviceUrl,headers: {
                'Content-Type':'application/x-www-form-urlencoded', 'authorization': widget.user.token
              }).then((response) {
                Map<String, dynamic> getted = jsonDecode(response.body);
                if (getted["success"] == true) {
                  refreshList();
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
                    height: 220,
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
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color: Colors.black,
                                                      fontSize: 20),
                                                ),
                                              ),
                                            )
                                          ],
                                        ),
                                        Row(
                                          children: <Widget>[
                                            Align(
                                              alignment: Alignment.centerLeft,
                                              child: Padding(
                                                padding: const EdgeInsets.only(
                                                    left: 20.0, top: 85),
                                                child: Row(
                                                  children: <Widget>[
                                                    RaisedButton(
                                                        onPressed: () async {
                                                          List act = List();
                                                          act = actions[index].split(" ");
                                                          const _serviceUrl = 'https://area-oui.herokuapp.com/api/reaction';
                                                          var client = new http.Client();
                                                          await client.post(_serviceUrl, headers: {'Content-Type': 'application/x-www-form-urlencoded',     'authorization': widget.user.token
                                                              }, body: {"action": act[0], "reaction": act[1], "index" : index.toString()}).then((response) {
                                                                Map<String, dynamic>
                                                                getted = jsonDecode(response.body);
                                                                if (getted["success"] == true) {
                                                                  _scaffoldKey.currentState
                                                                      .showSnackBar(new SnackBar(backgroundColor: Colors.green, content: new Text("Action send")));
                                                                }
                                                              });
                                                        },
                                                        color: Colors.transparent,
                                                        child: Image.asset('images/start-button.png')),
                                                    RaisedButton(
                                                        onPressed: () async {
                                                          const _serviceUrl = 'https://area-oui.herokuapp.com/api/widgets/remove';
                                                          var client = new http.Client();
                                                          actions[index] = actions[index].replaceAll(' ', '0');
                                                          await client.post( _serviceUrl,headers: {
                                                            'Content-Type':'application/x-www-form-urlencoded', 'authorization': widget.user.token
                                                          }, body: {"widget": actions[index] }).then((response) {
                                                            Map<String, dynamic> getted = jsonDecode(response.body);
                                                            if (getted["success"] == true) {
                                                              _scaffoldKey.currentState
                                                                  .showSnackBar(new SnackBar(backgroundColor: Colors.green, content: new Text("Deleted")));
                                                            }
                                                          });
                                                        },
                                                        color:
                                                            Colors.transparent,
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
                   Navigator.push(context, MaterialPageRoute(builder: (context) => WidgetSettingRoute(widget.user, this.actions[index], data, index)));
                  });
          },
        ),
        onRefresh: refreshList,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(context,
              MaterialPageRoute(builder: (context) => WidgetView(widget.user)));
        },
        child: Icon(Icons.apps),
        backgroundColor: Colors.blueAccent,
      ),
    );
  }
}
