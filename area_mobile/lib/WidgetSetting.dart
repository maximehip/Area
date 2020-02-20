import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:area_mobile/User.dart';
import 'package:area_mobile/Widget.dart';
import 'package:http/http.dart' as http;

class WidgetSettingRoute extends StatefulWidget {
  final User user;
  final String widget;
  final List<AWidget> data;
  final int index;

  const WidgetSettingRoute(this.user, this.widget, this.data, this.index);
  @override
  State<StatefulWidget> createState() {
    return WidgetSettingView();
  }
}

class WidgetSettingView extends State<WidgetSettingRoute> {
  String selected1;
  String selected2;
  List<String> listWidget;
  List<String> selected;
  String dropdownValue;
  String dropdownValue2;
  final GlobalKey<ScaffoldState> _scaffoldKey = new GlobalKey<ScaffoldState>();

  void initList() {
    selected = widget.widget.split(" ");
    listWidget = List<String>();
    for (AWidget widget in widget.data) {
      if (widget.name == selected[0]) {
        dropdownValue = widget.name;
      } else if (widget.name == selected[1]) {
        dropdownValue2 = widget.name;
      }
      listWidget.add(widget.name);
    }
  }

  @override
  void initState() {
    initList();
    super.initState();
  }

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
          child: Column(
            children: <Widget>[
                DropdownButton<String>(
                value: dropdownValue,
                  icon: Icon(Icons.arrow_downward),
                  iconSize: 24,
                  elevation: 16,
                  style: TextStyle(
                      color: Colors.deepPurple
                  ),
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
                  style: TextStyle(
                      color: Colors.deepPurple
                  ),
                  underline: Container(
                    height: 2,
                    color: Colors.deepPurpleAccent,
                  ),
                  onChanged: (String newValue) {
                    setState(() {
                      dropdownValue2 = newValue;
                    });
                  },
                  items: listWidget.map<DropdownMenuItem<String>>((String value) {
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
                  const _serviceUrl = 'https://area-oui.herokuapp.com/api/action/edit';
                  var client = new http.Client();
                  await client.post( _serviceUrl,headers: {
                    'Content-Type':'application/x-www-form-urlencoded', 'authorization': widget.user.token
                  }, body: {"str": str,  "index": widget.index.toString()}).then((response) {
                    Map<String, dynamic> getted = jsonDecode(response.body);
                    if (getted["success"] == true) {
                      _scaffoldKey.currentState
                          .showSnackBar(new SnackBar(backgroundColor: Colors.green, content: new Text("Saved")));
                    }
                  });
                },
                color: Colors.cyan,
              ),
            ],
          ),
        ),
      ),
    );
  }
}