import 'Widget.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> getUserData(String token, var itself, List<AWidget> data, Function callback) async {
  List actions = List();
  List sender = List();
  List trigger = List();
  const _serviceUrl = 'https://area-oui.herokuapp.com/api/me';
  var client = new http.Client();
  await client.get(_serviceUrl, headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'authorization': token
  }).then((response) {
    Map<String, dynamic> getted = jsonDecode(response.body);
    if (getted["success"] == true) {
      itself.setState(() {
        List widgets = getted["infos"]["widgets"];
        for (var i = 0; i < widgets.length; i++) {
          AWidget widget =
              new AWidget(widgets[i], "1.0", "description", "url", "image");
          data.add(widget);
        }
        actions = getted["infos"]["actions"];
        for (var i = 0; i < actions.length; i++) {
          actions[i] = actions[i].replaceAll('0', ' ');
        }
        sender = getted["infos"]["senderAdd"].cast<String>();
        trigger = getted["infos"]["triggerAdd"].cast<String>();
      });
    }
    callback(data, actions, sender, trigger);
  });
}
