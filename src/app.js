#!/usr/bin/env node
'use strict';

const http        = require('http');
const querystring = require('node:querystring');

const CONFIG = {
  host: '0.0.0.0',
  port: 9999,
};


// parse command line
let options = process.argv.slice(2, process.argv.length + 1);

for (var i = 0; i < options.length; i += 2) {
  let flag = options[i]
  switch (flag) {
    case '-port':
      let port = parseInt(options[i+1], 10);
      if (port != NaN) {
        CONFIG.port = port;
      }
      break;
  }
}



// http server
const requestListener = (req, res) => {
  console.time('---');

  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);

  let response = {
    code: 200,
    header: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true })
  };

  // resolve custom response body
  if (  (req.url.length > 1) && (req.url.startsWith('/~'))  ) {
    let pos = req.url.indexOf('/', 1);
    if (pos > 0) {
      let reply = req.url.substring(2, pos);
      if (reply.indexOf(':') > 0) {
        let [format, body, code, header] = reply.split(':');

        try {
          response.body = Buffer.from(body, format).toString('utf8');
          if (code != undefined) {
            response.code   = code;
          }
          if (header != undefined) {
            let str = Buffer.from(header, format).toString('utf8');
            let kv;
            [JSON.parse, querystring.decode].find(
              function(parse) {
                try {
                  kv = parse(str);
                } catch (error) {
                  // ignored
                }  
                return (kv != undefined);
              }
            )
            if (kv != undefined) {
              response.header = kv;
            }
          }
        } catch (error) {
          console.log(error)
        }

      }
    }
  }

  let data = '';
  req.on('data', (chunk) => {
    data = data + chunk;
  });

  req.on('end', () => {
    console.log('Data:', data.toString('utf-8'));

    res.writeHead(response.code, response.header);
    res.end(response.body);
    console.timeEnd('---');
  });
};

const server = http.createServer(requestListener);

server.listen(CONFIG.port, CONFIG.host, () => {
  console.log(`Blackhole Server is running at http://${CONFIG.host}:${CONFIG.port}`);
});
