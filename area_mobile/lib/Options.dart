import 'dart:ffi';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:area_mobile/User.dart';
import 'dart:convert';

Widget options(BuildContext context, String widget, User user, int index) {
  final controller = TextEditingController();
  final controller2 = TextEditingController();
  final controller3 = TextEditingController();

  void submitOptions(Map<String, dynamic> option) async {
    const _serviceUrl = 'https://area-oui.herokuapp.com/api/widgets/options';
    var client = new http.Client();
    await client.post(_serviceUrl, headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'authorization': user.token
    }, body: option).then((response) {
      Map<String, dynamic> getted = jsonDecode(response.body);
      print(getted);
    });
  }

  if (widget == "email") {
    return Flexible(
        flex: 0,
        fit: FlexFit.loose,
        child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: <Widget>[
              TextFormField(
                controller: controller,
                decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: "Sender's email address"),
              ),
              TextFormField(
                controller: controller2,
                decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: "Application's password"),
              ),
              TextFormField(
                controller: controller3,
                decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: "Recipient's email address"),
              ),
              RaisedButton(
                  onPressed: () {
                    Map<String, dynamic> option = {
                      'index': index.toString(),
                      'sender_email': controller.text,
                      'appPassword': controller2.text,
                      'to_email' : controller3.text,
                    };
                    submitOptions(option);
                  },
                  child: Text("Save"))
            ]));
  } else if (widget == "discord") {
    return Flexible(
        flex: 0,
        fit: FlexFit.loose,
        child: Column(children: <Widget>[
          TextFormField(
            controller: controller,
            decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: "Discord recipient's name"),
          ),
          RaisedButton(
              onPressed: () {
                Map<String, dynamic> option = {
                  'index': index.toString(),
                  'to_discord': controller.text
                };
                submitOptions(option);
              },
              child: Text("Save"))
        ]));
  } else if (widget == "weather") {
    return Flexible(
        flex: 0,
        child: Column(children: <Widget>[
          TextFormField(
            controller: controller,
            decoration: InputDecoration(
                border: OutlineInputBorder(), labelText: "City"),
          ),
          RaisedButton(
              onPressed: () {
                Map<String, dynamic> option = {
                  'index': index.toString(),
                  'city': controller.text
                };
                submitOptions(option);
              },
              child: Text("Save"))
        ]));
  } else if (widget == "lyrics") {
    return Flexible(
        flex: 0,
        fit: FlexFit.loose,
        child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: <Widget>[
              TextFormField(
                controller: controller,
                decoration: InputDecoration(
                    border: OutlineInputBorder(), labelText: "Song"),
              ),
              TextFormField(
                controller: controller2,
                decoration: InputDecoration(
                    border: OutlineInputBorder(), labelText: "Artist"),
              ),
              RaisedButton(
                  onPressed: () {
                    Map<String, dynamic> option = {
                      'index': index.toString(),
                      'song': controller.text,
                      'artist' : controller2.toString()
                    };
                    submitOptions(option);
                  },
                  child: Text("Save"))
            ]));
  } else {
    return SizedBox.shrink();
  }
}
