#!/usr/bin/env node

var debug = require("debug");
var debugLog = debug("avnexp:config");

// to debug arg settings, enable the below line:
//debug.enable("avnexp:*");

const args = require('meow')(`
	Usage
	  $ avn-rpc-explorer [options]

	Options
	  -p, --port <port>			  port to bind http server [default: 3002]
	  -i, --host <host>			  host to bind http server [default: 127.0.0.1]
	  -a, --basic-auth-password <..> protect web interface with a password [default: no password]
	  -C, --coin <coin>			  crypto-coin to enable [default: AVN]

	  -b, --aviand-uri <uri>	   connection URI for aviand rpc (overrides the options below)
	  -H, --aviand-host <host>	 hostname for aviand rpc [default: 127.0.0.1]
	  -P, --aviand-port <port>	 port for aviand rpc [default: 8332]
	  -c, --aviand-cookie <path>   path to aviand cookie file [default: ~/.avian/.cookie]
	  -u, --aviand-user <user>	 username for aviand rpc [default: none]
	  -w, --aviand-pass <pass>	 password for aviand rpc [default: none]

	  --address-api <option>		 api to use for address queries (options: electrum, blockchain.com, blockchair.com, blockcypher.com) [default: none]
	  -E, --electrum-servers <..>   comma separated list of electrum servers to use for address queries; only used if --address-api=electrum [default: none]

	  --rpc-allowall				 allow all rpc commands [default: false]
	  --rpc-blacklist <methods>	  comma separated list of rpc commands to block [default: see in config.js]
	  --cookie-secret <secret>	   secret key for signed cookie hmac generation [default: hmac derive from aviand pass]
	  --demo						 enable demoSite mode [default: disabled]
	  --no-rates					 disable fetching of currency exchange rates [default: enabled]
	  --slow-device-mode			 disable performance-intensive tasks (e.g. UTXO set fetching) [default: enabled]
	  --privacy-mode				 enable privacyMode to disable external data requests [default: disabled]
	  --max-mem <bytes>			  value for max_old_space_size [default: 1024 (1 GB)]

	  --ganalytics-tracking <tid>	tracking id for google analytics [default: disabled]
	  --sentry-url <sentry-url>	  sentry url [default: disabled]

	  -e, --node-env <env>		   nodejs environment mode [default: production]
	  -h, --help					 output usage information
	  -v, --version				  output version number

	Examples
	  $ avn-rpc-explorer --port 8080 --aviand-port 18443 --aviand-cookie ~/.avian/regtest/.cookie
	  $ avn-rpc-explorer -p 8080 -P 18443 -c ~/.avian/regtest.cookie

	Or using connection URIs
	  $ avn-rpc-explorer -b avian://bob:myPassword@127.0.0.1:18443/
	  $ avn-rpc-explorer -b avian://127.0.0.1:18443/?cookie=$HOME/.avian/regtest/.cookie

	All options may also be specified as environment variables
	  $ AVNEXP_PORT=8080 AVNEXP_AVIAND_PORT=18443 AVNEXP_AVIAND_COOKIE=~/.avian/regtest/.cookie avn-rpc-explorer


`, {
		flags: {
			port: {alias:'p'},
			host: {alias:'i'},
			basicAuthPassword: {alias:'a'},
			coin: {alias:'C'},
			aviandUri: {alias:'b'},
			aviandHost: {alias:'H'},
			aviandPort: {alias:'P'},
			aviandCookie: {alias:'c'},
			aviandUser: {alias:'u'},
			aviandPass: {alias:'w'},
			demo: {},
			rpcAllowall: {},
			electrumServers: {alias:'E'},
			nodeEnv: {alias:'e', default:'production'},
			privacyMode: {},
			slowDeviceMode: {}
		}
	}
).flags;

const envify = k => k.replace(/([A-Z])/g, '_$1').toUpperCase();

Object.keys(args).filter(k => k.length > 1).forEach(k => {
	if (args[k] === false) {
		debugLog(`Config(arg): AVNEXP_NO_${envify(k)}=true`);

		process.env[`AVNEXP_NO_${envify(k)}`] = true;

	} else {
		debugLog(`Config(arg): AVNEXP_${envify(k)}=${args[k]}`);

		process.env[`AVNEXP_${envify(k)}`] = args[k];
	}
});

require('./www');
