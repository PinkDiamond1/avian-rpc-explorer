"use strict";

const os = require('os');
const path = require('path');
const url = require('url');

const avnUri = process.env.AVNEXP_AVIAND_URI ? url.parse(process.env.AVNEXP_AVIAND_URI, true) : { query: { } };
const avnAuth = avnUri.auth ? avnUri.auth.split(':') : [];

module.exports = {
	rpc: {
		host: avnUri.hostname || process.env.AVNEXP_AVIAND_HOST || "127.0.0.1",
		port: avnUri.port || process.env.AVNEXP_AVIAND_PORT || 8332,
		username: avnAuth[0] || process.env.AVNEXP_AVIAND_USER,
		password: avnAuth[1] || process.env.AVNEXP_AVIAND_PASS,
		cookie: avnUri.query.cookie || process.env.AVNEXP_AVIAND_COOKIE || path.join(os.homedir(), '.avian', '.cookie'),
		timeout: parseInt(avnUri.query.timeout || process.env.AVNEXP_AVIAND_RPC_TIMEOUT || 5000),
	},

	// optional: enter your api access key from ipstack.com below
	// to include a map of the estimated locations of your node's
	// peers
	// format: "ID_FROM_IPSTACK"
	ipStackComApiAccessKey: process.env.AVNEXP_IPSTACK_APIKEY,

	// optional: enter your api access key from mapbox.com below
	// to enable the tiles for map of the estimated locations of
	// your node's peers
	// format: "APIKEY_FROM_MAPBOX"
	mapBoxComApiAccessKey: process.env.AVNEXP_MAPBOX_APIKEY,

	// optional: GA tracking code
	// format: "UA-..."
	googleAnalyticsTrackingId: process.env.AVNEXP_GANALYTICS_TRACKING,

	// optional: sentry.io error-tracking url
	// format: "SENTRY_IO_URL"
	sentryUrl: process.env.AVNEXP_SENTRY_URL,
};
