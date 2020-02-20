import 'dart:ffi';

import 'package:area_mobile/User.dart';
import 'package:area_mobile/Widget.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class CreateReaction extends StatefulWidget {
  final User user;
  CreateReaction(this.user);

  @override
  CreateReactionView createState() => CreateReactionView();
}

class CreateReactionView extends State<CreateReaction> {
  List<String> widgetName = [];
  List<DropdownMenuItem<String>> dropList = [], dropList2 = [];
  List<AWidget> data = [];
  String value, value2;

  @override
  void initState() {
    super.initState();

    getWidgets().then((response) {
      response = null;
      for (var i = 0; i < data.length; i++) {
        widgetName.add(data[i].name);
        print(data[i].name);
      }
      dropList = widgetName.map<DropdownMenuItem<String>>((String value) {
        return DropdownMenuItem<String>(
          value: value,
          child: Text(value),
        );
      }).toList();
      value = widgetName[0];
      print(widgetName);
      print(data[0].url);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar:
            AppBar(centerTitle: true, title: Text("Create an action-reaction")),
        body: Center(
            child: Container(
                decoration: BoxDecoration(color: Colors.blueGrey),
                child: Padding(
                    padding: EdgeInsets.all(10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
                        Container(
                          decoration: BoxDecoration(color: Colors.lightBlue),
                          child: Column(
                            children: <Widget>[
                              Padding(
                                padding: EdgeInsets.only(top: 10),
                                child: Text("Action Widget :"),
                              ),

                              /* Container(
                            decoration: BoxDecoration(color: Colors.indigoAccent),
                            child: Column(
                              children: <Widget>[
                                Padding(
                                  padding: EdgeInsets.only(top: 10),
                                  child: Text("Action"),
                                ),
                                Padding(
                                  padding: EdgeInsets.all(10),
                                  child: DropdownButton<String>(
                                    icon: Icon(Icons.format_list_bulleted),
                                    value: value2,
                                    onChanged: getAction(),
                                    items: dropList,
                                  ),
                                ) 
                              ],
                            ),
                          ), */
                            ],
                          ),
                        ),
                        Padding(
                          padding: EdgeInsets.only(top: 10),
                          child: Container(
                            decoration: BoxDecoration(color: Colors.lightBlue),
                            child: Column(
                              children: <Widget>[
                                Padding(
                                  padding: EdgeInsets.only(top: 10),
                                  child: Text("Reaction Widget :"),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Padding(
                          padding: EdgeInsets.all(5),
                          child: RaisedButton(
                            onPressed: () {
                              saveLink();
                            },
                            child: Text(
                              "Save Link",
                              textAlign: TextAlign.center,
                            ),
                          ),
                        )
                      ],
                    )))));
  }

  void saveLink() async {
    AWidget act, react;

    for (var w in data) {
      if (value == w.name) {
        act = w;
      }
      if (value2 == w.name) {
        react = w;
      }
    }
    print(act.url);
    print(react.url);

    var Client = new http.Client();
    /* await Client.get('https://area-oui.herokuapp.com/api/...', headers: {'authorization': widget.user.token}).then((res) {
      Map<String, dynamic> getted = jsonDecode(res.body);
      if (getted['success'] == true) {

      }
    }); */
  }

/*   Function getAction() {
    print(value);
    int i = widgetName.indexOf(value);
    data.forEach((i) => {print(i.name), print(i.description)});
    var client = http.Client();
    client.get(data[i].url, headers: {'authorization': widget.user.token}).then(
        (res) {
      Map<String, dynamic> getted = jsonDecode(res.body);
      if (getted["success"]) {}
    });
    return (String val) {
      setState(() {
        value2 = val;
      });
    };
  } */

  Future<Void> getWidgets() async {
    const _serviceUrl = 'https://area-oui.herokuapp.com/api/widgets/list';
    var client = new http.Client();
    await client.get(_serviceUrl,
        headers: {'authorization': widget.user.token}).then((response) {
      Map<String, dynamic> getted = jsonDecode(response.body);
      if (getted["success"] == true) {
        this.setState(() {
          List widgets = getted["widgets"];
          for (var i = 0; i < widgets.length; i++) {
            AWidget widget = new AWidget(
                widgets[i]["name"],
                widgets[i]["version"],
                widgets[i]["description"],
                widgets[i]["url"],
                widgets[i]["image"]);
            data.add(widget);
          }
        });
      }
    });
    return null;
  }
}
