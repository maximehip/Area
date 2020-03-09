define({ "api": [
  {
    "type": "post",
    "url": "/api/register",
    "title": "Create User account",
    "name": "Area",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Users users address email.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Users users password.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Users users pseudo.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"msg\": \"Your account has been created\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/login",
    "title": "Login User/Get request token",
    "name": "Login",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Users users address email.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Users users password.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"token\": \"JWT token\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/api/me",
    "title": "Get information about user",
    "name": "Me",
    "group": "User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"success\": true,\n      \"infos\": {\n      \t\"_id\": user id,\n      \t\"email\": user email,\n      \t\"password\": user password,\n     \t\"date\": creation date,\n\t\t\t\"widgets\": {\n\t\t\t\t\"widget1\",\n\t\t\t\t\"widget2\"\n \t\t}\n \t}\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/api/getToken",
    "title": "Get user token",
    "name": "Token",
    "group": "User",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"data\": \"JWT token\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/widgets/email",
    "title": "Send email to someone",
    "name": "Email",
    "group": "Widget",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sender",
            "description": "<p>'s adress</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "app",
            "description": "<p>password</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "receipent",
            "description": "<p>'s adress</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"message\": \"Email sent to ..\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widget"
  },
  {
    "type": "post",
    "url": "/api/reaction",
    "title": "Use reaction of an widget",
    "name": "Reaction",
    "group": "Widget",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "action",
            "description": "<p>Name of the first action</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "reaction",
            "description": "<p>Name of the second action</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"message\": \"done\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widget"
  },
  {
    "type": "post",
    "url": "/api/widgets/spotify/nowplaying",
    "title": "Get current playing music in Spotify",
    "name": "Spotify",
    "group": "Widget",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"music\": \"Music of Artist name\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widget"
  },
  {
    "type": "post",
    "url": "/api/widgets/discord",
    "title": "Send a message to user",
    "name": "Spotify",
    "group": "Widget",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"message\": \"done\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widget"
  },
  {
    "type": "post",
    "url": "/api/widgets/actions",
    "title": "Get widget actions",
    "name": "Actions",
    "group": "Widgets",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "widget",
            "description": "<p>widget name</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"0\": \"Action 1\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "post",
    "url": "/api/widgets",
    "title": "Add widget to user",
    "name": "AddWidget",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "widget",
            "description": "<p>Widget name</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"message\": \"done\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "get",
    "url": "/api/widgets/add",
    "title": "Add action in user account",
    "name": "Add_Widget",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"data\": \"done\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "get",
    "url": "/api/widgets/chucknorris",
    "title": "Get random Chuck Norris Joke",
    "name": "Chuck_Nurris",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  RANDROM JOKE\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "post",
    "url": "/api/widgets/delete",
    "title": "Delete widget in user account",
    "name": "Delete",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "widget",
            "description": "<p>widget name</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"message\": \"Done\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "get",
    "url": "/api/action/edit",
    "title": "Edit specific action/reaction",
    "name": "Edit_Action",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "index",
            "description": "<p>Index of action</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "str",
            "description": "<p>String with widget0widget</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"data\": done,\t\t\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "get",
    "url": "/api/widgets/lyrics",
    "title": "Remove action in user account",
    "name": "Lyrics",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Song name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "artiste",
            "description": "<p>Artist name</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"lyrics\": \" bla bla bla\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "get",
    "url": "/api/widgets/movie/list",
    "title": "Get 5 movies soon available",
    "name": "MoviesList",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"success\": true,\n      \"data\": [\n\t\t\tmovie1,\n\t\t\tmovie2\n\t\t\t]\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "get",
    "url": "/api/widgets/movie/trending",
    "title": "Get 5 trending movies",
    "name": "MoviesTrending",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"success\": true,\n      \"data\": [\n\t\t\tmovie1,\n\t\t\tmovie2\n\t\t\t]\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "get",
    "url": "/api/action/remove",
    "title": "Remove specific action/reaction",
    "name": "Remove_Action",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "index",
            "description": "<p>Index of action</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "str",
            "description": "<p>String with widget0widget</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"data\": done,\t\t\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "get",
    "url": "/api/widgets/remove",
    "title": "Remove action in user account",
    "name": "Remove_Widget",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "widget1",
            "description": "<p>Name of the first widget</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "widget2",
            "description": "<p>Name of the second widget</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"data\": \"done\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "post",
    "url": "/api/widgets/steam",
    "title": "Get number of player in steam games",
    "name": "Steam",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "game",
            "description": "<p>Game Name</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"success\": true,\n  \"nb\": 2\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "post",
    "url": "/api/widgets/weather",
    "title": "Get infos about weather in city",
    "name": "Weather",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "city",
            "description": "<p>City Name</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "   HTTP/1.1 200 OK\n   {\n     \"data\": [\n       {\n           \"rh\": 72,\n           \"pod\": \"d\",\n           \"lon\": 2.3488,\n           \"pres\": 1000.3,\n           \"timezone\": \"Europe/Paris\",\n           \"ob_time\": \"2020-01-17 16:17\",\n           \"country_code\": \"FR\",\n           \"clouds\": 49,\n           \"ts\": 1579277820,\n           \"solar_rad\": 18.7,\n           \"state_code\": \"11\",\n           \"city_name\": \"Paris\",\n           \"wind_spd\": 1.79,\n           \"last_ob_time\": \"2020-01-17T16:17:00\",\n           \"wind_cdir_full\": \"southwest\",\n           \"wind_cdir\": \"SW\",\n           \"slp\": 1019.9,\n           \"vis\": 5,\n           \"h_angle\": 72,\n           \"sunset\": \"16:24\",\n           \"dni\": 158.8,\n           \"dewpt\": 4.2,\n           \"snow\": 0,\n           \"uv\": 2.01596,\n           \"precip\": 0,\n           \"wind_dir\": 227,\n           \"sunrise\": \"07:36\",\n           \"ghi\": 20.09,\n           \"dhi\": 22.53,\n           \"aqi\": 34,\n           \"lat\": 48.85341,\n           \"weather\": {\n               \"icon\": \"c02d\",\n               \"code\": \"802\",\n               \"description\": \"Scattered clouds\"\n           },\n           \"datetime\": \"2020-01-17:16\",\n           \"temp\": 8.9,\n           \"station\": \"C1292\",\n           \"elev_angle\": 2.44,\n           \"app_temp\": 8.9\n       }\n   ],\n   \"count\": 1\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  },
  {
    "type": "get",
    "url": "/api/widgets/list",
    "title": "Get list of widgets",
    "name": "Widgets",
    "group": "Widgets",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "access-token",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n      \"success\": true,\n      \"widgets\": {\n      \t\"widget1\",\n\t\t\t\"widget2\"\n \t}\n    }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./api/api.js",
    "groupTitle": "Widgets"
  }
] });
