/**
 * Class representing an error that occured while parsing the keyserver's html
 */
export class ParseError extends Error {
	/** The canonical name */
	name: string;

	/** The error message */
	message: string;

	/** Constructor for creating a new parse error */
	constructor(attribute?: string) {
		super(attribute);

		this.name = 'ParseError';
		this.message = attribute !== undefined ?
			'Could not parse attribute "' + attribute + '" retrieved html' :
			'Could not parse retrieved html';
	}
}
