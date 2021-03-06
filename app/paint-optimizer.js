import {readFileSync} from "fs";

/**
 * Given the number of colors will return an array the length of the possible solutions with the values
 * in the array being the value index.
 *
 * @param {number} colors
 * @returns {Array<number>}
 */
export function createPossibleSolutions(colors) {
	const numberOfPossibleSolutions = Math.pow(2, colors);
	const possibleSolutions = new Array(numberOfPossibleSolutions);

	for (let possibleSolution = 0; possibleSolution < numberOfPossibleSolutions; possibleSolution++) {
		possibleSolutions[possibleSolution] = possibleSolution;
	}

	return possibleSolutions;
}

/**
 * Converts a number into a string binary representation of itself.
 *
 * @param {number} decimalEncodedSolution
 * @returns {string}
 */
export function convertDecimalSolutionToBinary(decimalEncodedSolution) {
	return Number.prototype.toString.call(decimalEncodedSolution, 2);
}

/**
 * Returns a function that can be used to sort strings by the number of times they contain `characterToSortBy`.
 * Ascending order based on the number of instances of `characterToSortBy`.
 *
 * @param {string} characterToSortBy
 * @returns {(first: string, second: string) => number}
 */
export function sortPossibleSolutions(characterToSortBy) {
	return (first, second) => characterCount(first, characterToSortBy) - characterCount(second, characterToSortBy);
}

/**
 * Returns a function that when given a string less then `requiredLength` will left pad it with `paddingCharacter`
 * until it reaches that length.
 *
 * @param {number} requiredLength
 * @param {string} paddingCharacter
 * @returns {(possibleSolution: string) => string}
 */
export function padPossibleSolution(requiredLength, paddingCharacter) {
	return possibleSolution => {
		if (possibleSolution.length < requiredLength) {
			return paddingCharacter.repeat(requiredLength - possibleSolution.length) + possibleSolution;
		}

		return possibleSolution;
	}
}

/**
 * If any of the provided requirements are satisfied by the `possibleSolution` then return true,
 * else return false.
 *
 * @param {string} possibleSolution
 * @param {Array<{columnIndex: number, requestedType: string}>} requirements
 * @returns {boolean}
 */
export function areRequirementsSatisfied(possibleSolution, requirements) {
	for (let [columnIndex, requestedType] of requirements) {
		if (possibleSolution[columnIndex] === requestedType) {
			return true;
		}
	}

	return false;
}

/**
 * Returns a string that encodes a solution that satisfies the clients or `undefined` if no
 * solution could be found. The fewer `1`s in the solution the "cheaper" it is deemed.
 *
 * @param {number} colors
 * @param {Map<number, Map<number, string>>} allRequirements
 * @returns {?string}
 */
export function findCheapestSolution(colors, allRequirements) {
	return createPossibleSolutions(colors)
		.map(convertDecimalSolutionToBinary)
		.sort(sortPossibleSolutions("1"))
		.map(padPossibleSolution(colors, "0"))
		.find(doesSolutionSatisfyAllClients(allRequirements));
}

/**
 * Reads the contents of `fileName` and breaks it up by new line.
 *
 * @param {string} file
 * @returns {Array<string>}
 */
export function readFileContents(fileName) {
	const fileContents = readFileSync(fileName, {encoding: "utf8"});

	return fileContents.split("\n");
}

/**
 * Parses and transforms the file input lines into data structures required by module functions to
 * solve optimization problem.
 *
 * @param {Array<string>} fileLines
 * @returns {{colors: Number, allRequirements: Map}}
 */
export function parseFileInput(fileLines) {
	const allRequirements = new Map();
	const colors = parseInt(fileLines.shift(), 10);

	for (let line of fileLines) {
		let clientRequirements = parseFileInputLine(line);

		allRequirements.set(allRequirements.size, clientRequirements);
	}

	return {colors, allRequirements};
}

/**
 * Parses and transforms a single line in a problem input file.
 *
 * @param {string} line
 * @returns {Map}
 */
export function parseFileInputLine(line) {
	const clientRequirements = new Map();
	const clientRequirementTokens = line.split(/\s/);

	for (let requirementTokens = 0; requirementTokens < clientRequirementTokens.length; requirementTokens+=2) {
		const colorID = clientRequirementTokens[requirementTokens];
		const colorType = clientRequirementTokens[requirementTokens + 1];
		const mappedColourID = parseInt(colorID, 10) - 1;
		const mappedColorType = colorType === "G" ? "0" : "1";

		clientRequirements.set(mappedColourID, mappedColorType);
	}

	return clientRequirements;
}

/**
 * Parses the first index in the provided array as an input file and finds the cheapest solution.
 *
 * @param {Array<string>}
 * @returns {string}
 */
export default function optimizer([fileName]) {
	const fileLines = readFileContents(fileName);
	const {colors, allRequirements} = parseFileInput(fileLines);
	const cheapestSolution = findCheapestSolution(colors, allRequirements);

	if (cheapestSolution === undefined) {
		return "No solution exists";
	} else {
		let transformedSolution = "";

		for (let encodedColor of cheapestSolution) {
			const decodedColor = encodedColor === "0" ? "G" : "M";
			transformedSolution += decodedColor + " ";
		}

		return transformedSolution
	}
}

/**
 * Returns true if the `possibleSolution` satisfies all the clients.
 *
 * @param {Map<number, Map<number, string>>} allRequirements
 * @returns {(possibleSolution: string) => boolean}
 */
function doesSolutionSatisfyAllClients(allRequirements) {
	return possibleSolution => {
		for (let [,clientRequirements] of allRequirements) {
			if (areRequirementsSatisfied(possibleSolution, clientRequirements) === false) {
				return false;
			}
		}

		return true;
	}
}

/**
 * Number of times a character is found in a string.
 *
 * @param {string} string
 * @param {string} characterToCount
 * @returns {number}
 */
function characterCount(string, characterToCount) {
	let charactersFound = 0;

	for (let char of string) {
		if (char === characterToCount) {
			charactersFound++;
		}
	}

	return charactersFound;
}
