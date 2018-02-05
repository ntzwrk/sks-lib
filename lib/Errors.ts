/**
 * Class representing an error that no key could been found
 */
export class NoKeyFoundError extends Error {
	/** Constructor for creating a new no key found error */
	constructor() {
		super();

		this.name = 'NoKeyFoundError';
		this.message = 'Could not find a key in server reply';
	}
}

/**
 * Class representing an error that occured while parsing the keyserver's html
 */
export class ParseError extends Error {
	/** Constructor for creating a new parse error */
	constructor(attribute?: string) {
		super();

		this.name = 'ParseError';
		this.message = attribute !== undefined ?
			'Could not parse attribute "' + attribute + '" retrieved html' :
			'Could not parse retrieved html';
	}
}
