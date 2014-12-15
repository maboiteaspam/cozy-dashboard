![Travis Badge](https://api.travis-ci.org/maboiteaspam/cozy-dashboard.svg)

# maboisteaspam / Cozy-dashboard

![Cozy Logo](https://raw.github.com/cozy/cozy-setup/gh-pages/assets/images/happycloud.png)

Enhanced version of cozy-light original dashboard.
Useful for study and code demo.
It demonstrate
- use of an extra port for a websocket channel.
- require of cozylight modules to query api programatically

# Install with cozy-light
Install Node.js (>= 0.10),
Git and essential build tools to install cozy-light
```
npm i maboiteaspam/cozy-light -g 
cozy-light add-plugin maboiteaspam/cozy-homepage 
cozy-light install maboiteaspam/cozy-dashboard 
cozy-light install maboiteaspam/ma-clef-usb # for example
```

### Run the platform
```
cozy-light start
```
browse http://localhost:19104/


# Install as a stand alone

For testing purpose.

Install Node.js (>= 0.10)
```
npm i maboiteaspam/cozy-dashboard -g
```

### Run the standalone app
```
cozy-dashboard start [-p 8080] [-h 127.0.0.1] [-H ~/lib/node_module/cozy-dashboard/.test-working_dir]
```
browse http://localhost:8080/

### Standalone CLI options

- -p --port default:8080 Port on which http server listens.
- -h --hostname default:127.0.0.1 Hostname on which http server listens.
- -H --home default:~/cozy-dashboard Home directory used by cozyLight under the hood.

### Configuration

None.

