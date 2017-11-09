import * as chai from 'chai';
import * as fs from 'fs';
import * as moment from 'moment';

import {Keyserver, ParseError, Peer, Stats} from '../lib/index';


describe('Keyserver', () => {
	var validHtml: string;
	var validStats: Stats;

	before(() => {
		validHtml = fs.readFileSync('test/assets/valid_keyserver.ntzwrk.org_2017-11-09.html','utf8');
		validStats = Keyserver.parseHtml(validHtml);
	});

	it('has correct attributes', () => {
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

		chai.expect(validStats.peerCount).to.equal(18);
		chai.expect(validStats.peers[0]).to.deep.equal(new Peer('keys.fspproductions.biz', 11370));
	});

	it('fails correctly', () => {
		chai.expect(() => Keyserver.parseHtml('')).to.throw(ParseError);
	});
});
