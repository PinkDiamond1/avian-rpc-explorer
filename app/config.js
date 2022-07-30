"use strict";

const debug = require("debug");
const debugLog = debug("avnexp:config");

const fs = require('fs');
const crypto = require('crypto');
const url = require('url');
const path = require('path');

let baseUrl = (process.env.AVNEXP_BASEURL || "/").trim();
if (!baseUrl.startsWith("/")) {
	baseUrl = "/" + baseUrl;
}
if (!baseUrl.endsWith("/")) {
	baseUrl += "/";
}


let cdnBaseUrl = (process.env.AVNEXP_CDN_BASE_URL || ".").trim();
while (cdnBaseUrl.endsWith("/")) {
	cdnBaseUrl = cdnBaseUrl.substring(0, cdnBaseUrl.length - 1);
}

let s3BucketPath = (process.env.AVNEXP_S3_BUCKET_PATH || "").trim();
while (s3BucketPath.endsWith("/")) {
	s3BucketPath = s3BucketPath.substring(0, s3BucketPath.length - 1);
}


const coins = require("./coins.js");
const credentials = require("./credentials.js");

const currentCoin = process.env.AVNEXP_COIN || "AVN";

const rpcCred = credentials.rpc;

if (rpcCred.cookie && !rpcCred.username && !rpcCred.password && fs.existsSync(rpcCred.cookie)) {
	console.log(`Loading RPC cookie file: ${rpcCred.cookie}`);
	
	[ rpcCred.username, rpcCred.password ] = fs.readFileSync(rpcCred.cookie).toString().split(':', 2);
	
	if (!rpcCred.password) {
		throw new Error(`Cookie file ${rpcCred.cookie} in unexpected format`);
	}
}

const cookieSecret = process.env.AVNEXP_COOKIE_SECRET
 || (rpcCred.password && crypto.createHmac('sha256', JSON.stringify(rpcCred))
                               .update('avn-rpc-explorer-cookie-secret').digest('hex'))
 || "0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";


const electrumServerUriStrings = (process.env.AVNEXP_ELECTRUM_SERVERS || process.env.AVNEXP_ELECTRUMX_SERVERS || "").split(',').filter(Boolean);
const electrumServers = [];
for (let i = 0; i < electrumServerUriStrings.length; i++) {
	const uri = url.parse(electrumServerUriStrings[i]);
	
	electrumServers.push({protocol:uri.protocol.substring(0, uri.protocol.length - 1), host:uri.hostname, port:parseInt(uri.port)});
}

// default=false env vars
[
	"AVNEXP_DEMO",
	"AVNEXP_PRIVACY_MODE",
	"AVNEXP_NO_INMEMORY_RPC_CACHE",
	"AVNEXP_RPC_ALLOWALL",
	"AVNEXP_ELECTRUM_TXINDEX",
	"AVNEXP_UI_HIDE_INFO_NOTES",

].forEach(function(item) {
	if (process.env[item] === undefined) {
		process.env[item] = "false";

		debugLog(`Config(default): ${item}=false`)
	}
});


// default=true env vars
[
	"AVNEXP_NO_RATES",
	"AVNEXP_SLOW_DEVICE_MODE"

].forEach(function(item) {
	if (process.env[item] === undefined) {
		process.env[item] = "true";

		debugLog(`Config(default): ${item}=true`)
	}
});

const slowDeviceMode = (process.env.AVNEXP_SLOW_DEVICE_MODE.toLowerCase() == "true");

module.exports = {
	host: process.env.AVNEXP_HOST || "127.0.0.1",
	port: process.env.PORT || process.env.AVNEXP_PORT || 3002,

	baseUrl: baseUrl,

	coin: currentCoin,

	displayDefaults: {
		displayCurrency: (process.env.AVNEXP_DISPLAY_CURRENCY || "avn"),
		localCurrency: (process.env.AVNEXP_LOCAL_CURRENCY || "usd"),
		theme: (process.env.AVNEXP_UI_THEME || "dark"),
		timezone: (process.env.AVNEXP_UI_TIMEZONE || "local")
	},

	cookieSecret: cookieSecret,

	privacyMode: (process.env.AVNEXP_PRIVACY_MODE.toLowerCase() == "true"),
	slowDeviceMode: slowDeviceMode,
	demoSite: (process.env.AVNEXP_DEMO.toLowerCase() == "true"),
	queryExchangeRates: (process.env.AVNEXP_NO_RATES.toLowerCase() != "true" && process.env.AVNEXP_PRIVACY_MODE.toLowerCase() != "true"),
	noInmemoryRpcCache: (process.env.AVNEXP_NO_INMEMORY_RPC_CACHE.toLowerCase() == "true"),
	
	rpcConcurrency: (process.env.AVNEXP_RPC_CONCURRENCY || (slowDeviceMode ? 3 : 10)),

	filesystemCacheDir: (process.env.AVNEXP_FILESYSTEM_CACHE_DIR || path.join(process.cwd(),"./cache")),

	noTxIndexSearchDepth: (+process.env.AVNEXP_NOTXINDEX_SEARCH_DEPTH || 3),

	cdn: {
		active: (cdnBaseUrl == "." ? false : true),
		s3Bucket: process.env.AVNEXP_S3_BUCKET,
		s3BucketPath: s3BucketPath,
		baseUrl: cdnBaseUrl
	},

	rpcBlacklist:
	  process.env.AVNEXP_RPC_ALLOWALL.toLowerCase() == "true"  ? []
	: process.env.AVNEXP_RPC_BLACKLIST ? process.env.AVNEXP_RPC_BLACKLIST.split(',').filter(Boolean)
	: [
		"addnode",
		"backupwallet",
		"bumpfee",
		"clearbanned",
		"createmultisig",
		"createwallet",
		"disconnectnode",
		"dumpprivkey",
		"dumpwallet",
		"encryptwallet",
		"generate",
		"generatetoaddress",
		"getaccountaddrss",
		"getaddressesbyaccount",
		"getbalance",
		"getnewaddress",
		"getrawchangeaddress",
		"getreceivedbyaccount",
		"getreceivedbyaddress",
		"gettransaction",
		"getunconfirmedbalance",
		"getwalletinfo",
		"importaddress",
		"importmulti",
		"importprivkey",
		"importprunedfunds",
		"importpubkey",
		"importwallet",
		"invalidateblock",
		"keypoolrefill",
		"listaccounts",
		"listaddressgroupings",
		"listlockunspent",
		"listreceivedbyaccount",
		"listreceivedbyaddress",
		"listsinceblock",
		"listtransactions",
		"listunspent",
		"listwallets",
		"lockunspent",
		"logging",
		"move",
		"preciousblock",
		"pruneblockchain",
		"reconsiderblock",
		"removeprunedfunds",
		"rescanblockchain",
		"savemempool",
		"sendfrom",
		"sendmany",
		"sendtoaddress",
		"setaccount",
		"setban",
		"setmocktime",
		"setnetworkactive",
		"signmessage",
		"signmessagewithprivatekey",
		"signrawtransaction",
		"signrawtransactionwithkey",
		"stop",
		"submitblock",
		"syncwithvalidationinterfacequeue",
		"verifychain",
		"waitforblock",
		"waitforblockheight",
		"waitfornewblock",
		"walletlock",
		"walletpassphrase",
		"walletpassphrasechange",
	],

	addressApi: process.env.AVNEXP_ADDRESS_API,
	electrumTxIndex: process.env.AVNEXP_ELECTRUM_TXINDEX != "false",
	electrumServers: electrumServers,

	redisUrl:process.env.AVNEXP_REDIS_URL,

	site: {
		hideInfoNotes: process.env.AVNEXP_UI_HIDE_INFO_NOTES,
		homepage:{
			recentBlocksCount: parseInt(process.env.AVNEXP_UI_HOME_PAGE_LATEST_BLOCKS_COUNT || (slowDeviceMode ? 5 : 10))
		},
		blockTxPageSize: (slowDeviceMode ? 10 : 20),
		addressTxPageSize: 10,
		txMaxInput: (slowDeviceMode ? 3 : 15),
		browseBlocksPageSize: parseInt(process.env.AVNEXP_UI_BLOCKS_PAGE_BLOCK_COUNT || (slowDeviceMode ? 10 : 25)),
		browseMempoolTransactionsPageSize: (slowDeviceMode ? 10 : 25),
		addressPage:{
			txOutputMaxDefaultDisplay:10
		},
		valueDisplayMaxLargeDigits: 10,
		prioritizedToolIdsList: [0, 10, 11, 9, 3, 4, 16, 12, 2, 5, 15, 1, 6, 7, 13, 8],
		toolSections: [
			{name: "Basics", items: [0, 2]},
			{name: "Mempool", items: [4, 16, 5]},
			{name: "Analysis", items: [9, 18, 10, 11, 12, 3]},
			{name: "Technical", items: [15, 6, 7, 1]},
			{name: "Fun", items: [8, 17, 19, 13]},
		]
	},

	credentials: credentials,

	siteTools:[
	/* 0 */		{name:"Node Details", url:"./node-details", desc:"Node basics (version, uptime, etc)", iconClass:"bi-info-circle"},
	/* 1 */		{name:"Peers", url:"./peers", desc:"Details about the peers connected to this node.", iconClass:"bi-diagram-3"},

	/* 2 */		{name:"Browse Blocks", url:"./blocks", desc:"Browse all blocks in the blockchain.", iconClass:"bi-boxes"},
	/* 3 */		{name:"Transaction Stats", url:"./tx-stats", desc:"See graphs of total transaction volume and transaction rates.", iconClass:"bi-graph-up"},

	/* 4 */		{name:"Mempool Summary", url:"./mempool-summary", desc:"Detailed summary of the current mempool for this node.", iconClass:"bi-hourglass-split"},
	/* 5 */		{name:"Browse Mempool", url:"./mempool-transactions", desc:"Browse unconfirmed/pending transactions.", iconClass:"bi-book"},

	/* 6 */		{name:"RPC Browser", url:"./rpc-browser", desc:"Browse the RPC functionality of this node. See docs and execute commands.", iconClass:"bi-journal-text"},
	/* 7 */		{name:"RPC Terminal", url:"./rpc-terminal", desc:"Directly execute RPCs against this node.", iconClass:"bi-terminal"},

	/* 8 */		{name:(coins[currentCoin].name + " Fun"), url:"./fun", desc:"Curated fun/interesting historical blockchain data.", iconClass:"bi-flag"},

	/* 9 */		{name:"Mining Summary", url:"./mining-summary", desc:"Summary of recent data about miners.", iconClass:"bi-hammer"},
	/* 10 */	{name:"Block Stats", url:"./block-stats", desc:"Summary data for blocks in configurable range.", iconClass:"bi-stack"},
	/* 11 */	{name:"Block Analysis", url:"./block-analysis", desc:"Summary analysis for all transactions in a block.", iconClass:"bi-chevron-double-down"},
	/* 12 */	{name:"Difficulty History", url:"./difficulty-history", desc:"Details of difficulty changes over time.", iconClass:"bi-clock-history"},

	/* 13 */	{name:"Whitepaper Extractor", url:"./avian-whitepaper", desc:"Extract the Avian whitepaper from data embedded within the blockchain.", iconClass:"bi-file-earmark-text"},
	
	/* 14 */	{name:"Predicted Blocks", url:"./predicted-blocks", desc:"View predicted future blocks based on the current mempool.", iconClass:"bi-arrow-right-circle"},

	/* 15 */	{name:"API", url:"./api/docs", desc:"View docs for the public API.", iconClass:"bi-braces-asterisk"},

	/* 16 */	{name:"Next Block", url:"./next-block", desc:"View a prediction for the the next block, based on the current mempool.", iconClass:"bi-minecart-loaded"},
	/* 17 */	{name:"Quotes", url:"./quotes", desc:"Curated list of Avian-related quotes.", iconClass:"bi-chat-quote"},

	/* 18 */	{name:"UTXO Set", url:"./utxo-set", desc:"View the latest UTXO Set.", iconClass:"bi-list-columns"},

	/* 19 */	{name:"Holidays", url:"./holidays", desc:"Curated list of Avian 'Holidays'.", iconClass:"bi-calendar-heart"},
	]
};

debugLog(`Config(final): privacyMode=${module.exports.privacyMode}`);
debugLog(`Config(final): slowDeviceMode=${module.exports.slowDeviceMode}`);
debugLog(`Config(final): demo=${module.exports.demoSite}`);
debugLog(`Config(final): rpcAllowAll=${module.exports.rpcBlacklist.length == 0}`);
