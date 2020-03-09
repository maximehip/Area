import 'package:area_mobile/getData.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:async';
import 'dart:convert';
import 'package:area_mobile/User.dart';
import 'package:area_mobile/Widget.dart';
import 'package:slider_side_menu/slider_side_menu.dart';

class WidgetView extends StatefulWidget {
  final User user;
  final List<AWidget> data;

  const WidgetView(this.user, this.data);
  @override
  State<StatefulWidget> createState() {
    return StateWidgetView();
  }
}

class StateWidgetView extends State<WidgetView> {
  List dataList = List();
  List<AWidget> datacpy;
  List actions = List();
  int display;

  callback2(newData, newAction) {
    setState(() {
      datacpy = newData;
    });
  }

  Future<String> getWidgets() async {
    if (display == 0) {
      const _serviceUrl = 'https://area-oui.herokuapp.com/api/widgets/list';
      var client = new http.Client();
      await client.get(_serviceUrl, headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'authorization': widget.user.token
      }).then((response) {
        Map<String, dynamic> getted = jsonDecode(response.body);
        if (getted["success"] == true) {
          this.setState(() {
            dataList = getted["widgets"].cast<String>();
          });
        } else {
          _scaffoldKey.currentState.showSnackBar(new SnackBar(
              backgroundColor: Colors.red, content: new Text(getted["message"])));
        }
      });
    } else if (display == 1) {
      const _serviceUrl = 'https://area-oui.herokuapp.com/api/sender/list';
      var client = new http.Client();
      await client.get(_serviceUrl, headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'authorization': widget.user.token
      }).then((response) {
        Map<String, dynamic> getted = jsonDecode(response.body);
        if (getted["success"] == true) {
          this.setState(() {
            dataList = getted["sender"].cast<String>();
          });
        } else {
          _scaffoldKey.currentState.showSnackBar(new SnackBar(
              backgroundColor: Colors.red, content: new Text(getted["message"])));
        }
      });
    } else if (display == 2) {
      const _serviceUrl = 'https://area-oui.herokuapp.com/api/trigger/list';
      var client = new http.Client();
      await client.get(_serviceUrl, headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'authorization': widget.user.token
      }).then((response) {
        Map<String, dynamic> getted = jsonDecode(response.body);
        if (getted["success"] == true) {
          this.setState(() {
            dataList = getted["trigger"].cast<String>();
          });
        } else {
          _scaffoldKey.currentState.showSnackBar(new SnackBar(
              backgroundColor: Colors.red, content: new Text(getted["message"])));
        }
      });
    }
    return "done!";
  }

  @override
  void initState() {
    super.initState();
    display = 0;
    datacpy = widget.data;
    this.getWidgets();
  }

  final GlobalKey<ScaffoldState> _scaffoldKey = new GlobalKey<ScaffoldState>();
  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      key: _scaffoldKey,
      appBar:
          new AppBar(title: new Text("Widgets"), backgroundColor: Colors.blue),
      body: Stack(
        children: <Widget>[
          new ListView.builder(
            itemCount: dataList == null ? 0 : dataList.length,
            itemBuilder: (BuildContext context, int index) {
              return GestureDetector(
                  child: Card(
                    elevation: 8.0,
                    margin:
                    new EdgeInsets.symmetric(horizontal: 10.0, vertical: 6.0),
                    child: Container(
                      decoration:
                      BoxDecoration(color: Color.fromRGBO(64, 75, 96, .9)),
                      child: ListTile(
                        contentPadding:
                        EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
                        leading: Container(
                          padding: EdgeInsets.only(right: 12.0),
                          decoration: new BoxDecoration(
                              border: new Border(
                                  right: new BorderSide(
                                      width: 1.0, color: Colors.white24))),
                          child: Icon(Icons.autorenew, color: Colors.white),
                        ),
                        title: Text(
                          dataList[index],
                          style: TextStyle(
                              color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ),
                  onTap: () async {
                      var widg = dataList[index].replaceAll(' ', '');
                      widg = widg.toLowerCase();

                      var same = false;
                      for (var elem in datacpy) {
                        if (elem.name.toLowerCase() ==
                            widg.toLowerCase()) same = true;
                      }
                      var _serviceUrl = 'https://area-oui.herokuapp.com/api/' +
                          (!same ? 'getwidget' : 'widgets/delete');
                      if (display == 1) {
                        _serviceUrl = 'https://area-oui.herokuapp.com/api/' +
                            (!same ? 'getsender' : 'sender/delete');
                      } else if (display == 2) {
                        _serviceUrl = 'https://area-oui.herokuapp.com/api/' +
                            (!same ? 'gettrigger' : 'trigger/delete');
                      }
                      var client = new http.Client();
                      await client.post(_serviceUrl, headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'authorization': widget.user.token
                      }, body: {
                        "widget": widg.toString()
                      }).then((response) {
                        Map<String, dynamic> getted = jsonDecode(response.body);
                        if (getted["success"] == true) {
                          this.setState(() {
                            _scaffoldKey.currentState.showSnackBar(new SnackBar(
                                backgroundColor: Colors.green,
                                content: new Text(dataList[index] +
                                    (!same ? " Added" : " Removed"))));
                          });
                        } else {
                          _scaffoldKey.currentState.showSnackBar(new SnackBar(
                              backgroundColor: Colors.red,
                              content: new Text(getted["message"])));
                        }
                        datacpy.clear();
                        getUserData(widget.user.token, this, datacpy, callback2);
                      });
                    }
                  );

            },
          ),
          SliderSideMenu(childrenData: [
            MenuItem(
                label: Text("Widget"),
                icon: Icon(Icons.thumb_up),
              onPressed: (){
                  display = 0;
                  getWidgets();
                  setState(() {});
              }
            ),
            MenuItem(
                label: Text("Sender"),
                icon: Icon(Icons.thumb_up),
              onPressed: (){
                  display = 1;
                  getWidgets();
                  setState(() {});
              }
            ),
            MenuItem(
                label: Text("Trigger"),
                icon: Icon(Icons.thumb_up),
                onPressed: (){
                  display = 2;
                  getWidgets();
                  setState(() {});
                }
            )
          ], description: "Sample tooltip message")
        ],
      )

    );
  }
}
