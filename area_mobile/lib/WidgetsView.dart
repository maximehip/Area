import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:async';
import 'dart:convert';
import 'package:area_mobile/User.dart';
import 'package:area_mobile/Widget.dart';

class WidgetView extends StatefulWidget {
  final User user;
  const WidgetView(this.user);
  @override
  State<StatefulWidget> createState() {
    return StateWidgetView();
  }
}

class StateWidgetView extends State<WidgetView>  {
  List <AWidget> data = List<AWidget>();

  Future<String> getWidgets() async {
    const _serviceUrl = 'https://area-oui.herokuapp.com/api/widgets/list';
    var client = new http.Client();
    await client.get(_serviceUrl, headers: {'Content-Type': 'application/x-www-form-urlencoded', 'authorization' : widget.user.token}).then((response) {
      Map<String, dynamic> getted = jsonDecode(response.body);
      if (getted["success"] == true) {
        this.setState(() {
          List widgets = getted["widgets"];
          for (var i = 0; i < widgets.length; i++) {
            AWidget widget = new AWidget(widgets[i]["name"], widgets[i]["version"], widgets[i]["description"], widgets[i]["url"], widgets[i]["image"]);
            data.add(widget);
          }
        });
      } else {
        _scaffoldKey.currentState
            .showSnackBar(new SnackBar(backgroundColor: Colors.red, content: new Text(getted["message"])));
      }
    });
    return "done!";
  }

  @override
  void initState(){
    super.initState();
    this.getWidgets();
  }
  
  final GlobalKey<ScaffoldState> _scaffoldKey = new GlobalKey<ScaffoldState>();
  @override
  Widget build(BuildContext context){
    return new Scaffold(
      key: _scaffoldKey,
      appBar: new AppBar(title: new Text("Widgets"), backgroundColor: Colors.blue),
      body: new ListView.builder(
        itemCount: data == null ? 0 : data.length,
        itemBuilder: (BuildContext context, int index){
          return GestureDetector(
            child: Card(
                  elevation: 8.0,
                  margin: new EdgeInsets.symmetric(horizontal: 10.0, vertical: 6.0),
                  child: Container(
                    decoration: BoxDecoration(color: Color.fromRGBO(64, 75, 96, .9)),
                    child: ListTile(
                        contentPadding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
                        leading: Container(
                          padding: EdgeInsets.only(right: 12.0),
                          decoration: new BoxDecoration(
                              border: new Border(
                                  right: new BorderSide(width: 1.0, color: Colors.white24))),
                          child: Icon(Icons.autorenew, color: Colors.white),
                        ),
                        title: Text(
                          data[index].name,
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                    ),
                  ),
                ),
            onTap: () async {
              const _serviceUrl = 'https://area-oui.herokuapp.com/api/getwidget';
              var client = new http.Client();
              await client.post(_serviceUrl, headers: {'Content-Type': 'application/x-www-form-urlencoded', 'authorization' : widget.user.token}, body: {"widget": data[index]}).then((response) {
                Map<String, dynamic> getted = jsonDecode(response.body);
                if (getted["success"] == true) {
                  this.setState(() {
                    _scaffoldKey.currentState
                        .showSnackBar(new SnackBar(backgroundColor: Colors.green, content: new Text("Added")));
                  });
                } else {
                  _scaffoldKey.currentState
                      .showSnackBar(new SnackBar(backgroundColor: Colors.red, content: new Text(getted["message"])));
                }
              });
            }
          );
        },
      ),
    );
  }
}