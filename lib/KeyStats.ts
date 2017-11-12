import {Moment} from 'moment';


/**
 * Class representing key stats of a keyserver
 */
export class KeyStats {
	/** The keyserver's total number of keys */
	public readonly totalKeys: number;

	/** The keyserver's key changes on a daily basis */
	public readonly dailyKeys: KeyStatsEntry[];

	/** The keyserver's key changes on a hourly basis */
	public readonly hourlyKeys: KeyStatsEntry[];

	/** Constructor for creating a new key stats object */
	constructor(totalKeys: number, dailyKeys: KeyStatsEntry[], hourlyKeys: KeyStatsEntry[]) {
		this.totalKeys = totalKeys;
		this.dailyKeys = dailyKeys;
		this.hourlyKeys = hourlyKeys;
	}
}

/**
 * Class representing a key stats entry
 */
export class KeyStatsEntry {
	/** The time of this data set */
	public readonly dateTime: Moment;

	/** New keys that occurred at this time */
	public readonly newKeys: number;

	/** Updated keys that occurred at this time */
	public readonly updatedKeys: number;

	/** Constructor for creating a new key stat entry object */
	constructor(dateTime: Moment, newKeys: number, updatedKeys: number) {
		this.dateTime = dateTime;
		this.newKeys = newKeys;
		this.updatedKeys = updatedKeys;
	}
}
