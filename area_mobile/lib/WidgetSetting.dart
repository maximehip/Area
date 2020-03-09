import 'dart:convert';

import 'package:area_mobile/Options.dart';
import 'package:flutter/material.dart';
import 'package:area_mobile/User.dart';
import 'package:area_mobile/Widget.dart';
import 'package:http/http.dart' as http;

class WidgetSettingRoute extends StatefulWidget {
  final User user;
  final String widget;
  final List<AWidget> data;
  final List<String> sender;
  final List<String> trigger;
  final int index;
  final Function cb;


  const WidgetSettingRoute(
      this.user, this.widget, this.data, this.index, this.cb, this.sender, this.trigger);
  @override
  State<StatefulWidget> createState() {
    return WidgetSettingView();
  }
}

class WidgetSettingView extends State<WidgetSettingRoute> {
  String selected1;
  String selected2;
  String selected3;
  List<String> listWidget;
  List<String> selected;
  String dropdownValue;
  String dropdownValue2;
  String dropdownValue3;
  final GlobalKey<ScaffoldState> _scaffoldKey = new GlobalKey<ScaffoldState>();
  var action = List<String>()..length = 3;
  bool hasAction = true;

  void callback(List<TextEditingController> ltc)
  {
    setState(() {
      action[0] = ltc[0].toString();
      action[1] = ltc[1].toString();
      action[2] = ltc[2].toString();
    });
  }

  void initList() {
    selected = widget.widget.split(" ");
    listWidget = List<String>();
    for (AWidget widget in widget.data) {
      if (widget.name == selected[0]) {
        dropdownValue = widget.name;
      }
      listWidget.add(widget.name);
    }

    for (String sender in widget.sender) {
      if (sender == selected[1]) {
        dropdownValue2 = sender;
      }
    }
  }

  @override
  void initState() {
    initList();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: Text(widget.user.email),
        centerTitle: true,
        automaticallyImplyLeading: false,
      ),
      body: new Container(
        child: Center(
          child: ListView(children: <Widget>[
            
          Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: <Widget>[
              DropdownButton<String>(
                value: dropdownValue3,
                icon: Icon(Icons.arrow_downward),
                iconSize: 24,
                elevation: 16,
                style: TextStyle(color: Colors.deepPurple),
                underline: Container(
                  height: 2,
                  color: Colors.deepPurpleAccent,
                ),
                onChanged: (String newValue) {
                  setState(() {
                    dropdownValue3 = newValue;
                  });
                },
                items: widget.trigger.map<DropdownMenuItem<String>>((String value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
              ),
              DropdownButton<String>(
                value: dropdownValue,
                icon: Icon(Icons.arrow_downward),
                iconSize: 24,
                elevation: 16,
                style: TextStyle(color: Colors.deepPurple),
                underline: Container(
                  height: 2,
                  color: Colors.deepPurpleAccent,
                ),
                onChanged: (String newValue) {
                  setState(() {
                    dropdownValue = newValue;
                  });
                },
                items: listWidget.map<DropdownMenuItem<String>>((String value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
              ),
              DropdownButton<String>(
                value: dropdownValue2,
                icon: Icon(Icons.arrow_downward),
                iconSize: 24,
                elevation: 16,
                style: TextStyle(color: Colors.deepPurple),
                underline: Container(
                  height: 2,
                  color: Colors.deepPurpleAccent,
                ),
                onChanged: (String newValue) {
                  setState(() {
                    dropdownValue2 = newValue;
                  });
                },
                items:
                    widget.sender.map<DropdownMenuItem<String>>((String value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
              ),
              new RaisedButton(
                child: const Text('Edit Action Reaction'),
                onPressed: () async {
                  String str = dropdownValue + "0" + dropdownValue2;
                  var _serviceUrl =
                      'https://area-oui.herokuapp.com/api/action/edit';
                  var client = new http.Client();
                  await client.post(_serviceUrl, headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'authorization': widget.user.token
                  }, body: {
                    "str": str,
                    "index": widget.index.toString()
                  }).then((response) {
                    widget.cb(str.replaceAll('0', ' '), widget.index);
                  });
                  _serviceUrl = 'https://area-oui.herokuapp.com/api/trigger/edit';
                  await client.post(_serviceUrl, headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'authorization': widget.user.token
                  }, body: {
                    "str": dropdownValue3,
                    "index": widget.index.toString()
                  }).then((response) {
                    Map<String, dynamic> getted = jsonDecode(response.body);
                    if (getted["success"] == true) {
                      _scaffoldKey.currentState.showSnackBar(new SnackBar(
                          backgroundColor: Colors.green,
                          content: new Text("Saved")));
                    }
                  });
                },
                color: Colors.cyan,
              ),
              options(context, dropdownValue, widget.user,widget.index),
              options(context, dropdownValue2, widget.user, widget.index),
            ],
          ),
          ],)
        ),
      ),
    );
  }
}
