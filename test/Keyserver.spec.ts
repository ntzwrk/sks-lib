import * as chai from 'chai';
import * as fs from 'fs';
import * as moment from 'moment';

import {
	Keyserver,
	KeyStats,
	KeyStatsEntry,
	GossipPeer,
	MailsyncPeer,
	ParseError,
	Stats
} from '../lib/index';


describe('Keyserver', () => {
	var validHtml: string;
	var validHtmlWithMailsyncPeers: string;

	var validStats: Stats;
	var validStatsWithMailsyncPeers: Stats;

	var validKeyStats: KeyStats;

	before(() => {
		validHtml = fs.readFileSync('test/assets/valid_keyserver.ntzwrk.org_2017-11-09.html','utf8');
		validHtmlWithMailsyncPeers = fs.readFileSync('test/assets/valid_keys.digitalis.org_2017-11-12.html','utf8');

		validStats = Keyserver.parseStatsHtml(validHtml);
		validStatsWithMailsyncPeers = Keyserver.parseStatsHtml(validHtmlWithMailsyncPeers);

		validKeyStats = Keyserver.parseKeyStatsHtml(validHtml);
	});

	it('parses stats correctly', () => {
		chai.expect(validStats.hostName).to.equal('keyserver.ntzwrk.org');
		chai.expect(validStats.nodeName).to.equal('phobos');
		chai.expect(validStats.serverContact).to.equal('0x4124909FDAB6DE615DD5BFD65EE2F34DE4DB893E');

		chai.expect(validStats.software).to.equal('SKS');
		chai.expect(validStats.version).to.equal('1.1.6');
		chai.expect(validStats.debugLevel).to.equal(3);

		chai.expect(validStats.httpPort).to.equal(11371);
		chai.expect(validStats.reconPort).to.equal(11370);

		chai.expect(validStats.keys).to.equal(4849636);

		chai.expect(validStats.statsTime).to.deep.equal(moment('2017-11-09 16:25:04 CET', 'YYYY-MM-DD HH:mm:ss'));

		chai.expect(validStats.gossipPeerCount).to.equal(18);
		chai.expect(validStats.gossipPeers[0]).to.deep.equal(new GossipPeer('keys.fspproductions.biz', 11370));

		chai.expect(validStats.mailsyncPeerCount).to.equal(0);
		chai.expect(validStats.mailsyncPeers).to.deep.equal([]);
		chai.expect(validStatsWithMailsyncPeers.mailsyncPeerCount).to.equal(1);
		chai.expect(validStatsWithMailsyncPeers.mailsyncPeers[0]).to.deep.equal(new MailsyncPeer('pgp-public-keys@the.earth.li'));
	});

	it('fails parsing stats from invalid html correctly', () => {
		chai.expect(() => Keyserver.parseStatsHtml('')).to.throw(ParseError);
	});

	it('parses key stats correctly', () => {
		chai.expect(validKeyStats.totalKeys).to.equal(4849636);
		chai.expect(validKeyStats.dailyKeys[0]).to.deep.equal(new KeyStatsEntry(moment('2017-11-09', 'YYYY-MM-DD'), 1118, 516));
		chai.expect(validKeyStats.dailyKeys[30]).to.deep.equal(new KeyStatsEntry(moment('2017-10-10', 'YYYY-MM-DD'), 1224, 859));
		chai.expect(validKeyStats.hourlyKeys[0]).to.deep.equal(new KeyStatsEntry(moment('2017-11-09 16', 'YYYY-MM-DD HH'), 42, 23));
		chai.expect(validKeyStats.hourlyKeys[736]).to.deep.equal(new KeyStatsEntry(moment('2017-10-10 01', 'YYYY-MM-DD HH'), 42, 21));
	});

	it('fails parsing key stats from invalid html correctly', () => {
		chai.expect(() => Keyserver.parseKeyStatsHtml('')).to.throw(ParseError);
	});
});
