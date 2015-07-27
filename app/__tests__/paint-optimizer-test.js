import {
	equal,
	deepEqual
} from "assert";

import {join} from "path";

import {
	it,
	describe
} from "mocha";

import optimizer, {
	parseFileInput,
	readFileContents,
	parseFileInputLine,
	padPossibleSolution,
	findCheapestSolution,
	sortPossibleSolutions,
	createPossibleSolutions,
	areRequirementsSatisfied,
	convertDecimalSolutionToBinary
} from "../paint-optimizer";

describe("Paint optimizer", () => {
	it("createPossibleSolutions creates all possible results.", () => {
		// When.
		const possibleSolutions = createPossibleSolutions(4);

		// Then.
		equal(possibleSolutions.length, 16);
		// Verify the array contains all the solutions in increasing order.
		for (let possibleSolution = 0; possibleSolution < possibleSolutions.length; possibleSolution++) {
			equal(possibleSolutions[possibleSolution], possibleSolution);
		}
	});

	it("convertSolutionsToBinary converts decimal solution to binary.", () => {
		// Given.
		const possibleSolutions = createPossibleSolutions(3);
		const expectedBinaryEncodedSolutions = ["0", "1", "10", "11", "100", "101", "110", "111"];

		// When.
		const binaryEncodedSolutions = possibleSolutions.map(convertDecimalSolutionToBinary);

		// Then.
		deepEqual(binaryEncodedSolutions, expectedBinaryEncodedSolutions);
	});

	it("sortPossibleSolutions orders possible solutions by count of 1", () => {
		// Given.
		const binaryEncodedSolutions = ["0", "1", "10", "11", "100", "101", "110", "111", "1000"];
		const expectedSortedBinaryEncodedSolutions = ["0", "1", "10", "100", "1000", "11", "101", "110", "111"];

		// When.
		binaryEncodedSolutions.sort(sortPossibleSolutions("1"));

		// Then.
		deepEqual(binaryEncodedSolutions, expectedSortedBinaryEncodedSolutions);
	});

	it("pads possible solutions with leading zeros", () => {
		// Given.
		const possibleSolutions = ["0", "1", "10", "100", "1000", "11", "101", "110", "111"];
		const expectedPaddedSolutions = ["000", "001", "010", "100", "1000", "011", "101", "110", "111"];

		// When.
		const paddedPosssibleSolutions = possibleSolutions.map(padPossibleSolution(3, "0"));

		// Then.
		deepEqual(paddedPosssibleSolutions, expectedPaddedSolutions);
	});

	describe("areRequirementsSatisfied", () => {
		it("areRequirementsSatisfied passes when first requirement passes", () => {
			// Given.
			const possibleSolution = "00000";
			const requirements = new Map([[0, "0"], [2, "0"], [4, "0"]]);

			// When.
			const possibleSolutionSatisfies = areRequirementsSatisfied(possibleSolution, requirements);

			// Then.
			equal(possibleSolutionSatisfies, true);
		});

		it("areRequirementsSatisfied passes when second requirement passes", () => {
			// Given.
			const possibleSolution = "00000";
			const requirements = new Map([[0, "1"], [2, "0"], [4, "0"]]);

			// When.
			const possibleSolutionSatisfies = areRequirementsSatisfied(possibleSolution, requirements);

			// Then.
			equal(possibleSolutionSatisfies, true);
		});

		it("areRequirementsSatisfied passes when last requirement passes", () => {
			// Given.
			const possibleSolution = "00000";
			const requirements = new Map([[0, "1"], [4, "0"]]);

			// When.
			const possibleSolutionSatisfies = areRequirementsSatisfied(possibleSolution, requirements);

			// Then.
			equal(possibleSolutionSatisfies, true);
		});

		it("areRequirementsSatisfied passes when initial part of solution fails", () => {
			// Given.
			const possibleSolution = "10000";
			const requirements = new Map([[0, "0"], [4, "0"]]);

			// When.
			const possibleSolutionSatisfies = areRequirementsSatisfied(possibleSolution, requirements);

			// Then.
			equal(possibleSolutionSatisfies, true);
		});

		it("areRequirementsSatisfied fails when no requirement passes", () => {
			// Given.
			const possibleSolution = "10000";
			const requirements = new Map([[0, "0"], [4, "1"]]);

			// When.
			const possibleSolutionSatisfies = areRequirementsSatisfied(possibleSolution, requirements);

			// Then.
			equal(possibleSolutionSatisfies, false);
		});
	});

	describe("findCheapestSolution", () => {
		it("findCheapestSolution satisfies the outlying client with one expensive batch", () => {
			// Given.
			const expectedSolution = "00001";
			const allRequirements = new Map([
				[0, new Map([[0, "1"], [2, "0"], [4, "0"]])],
				[1, new Map([[1, "0"], [2, "1"], [3, "0"]])],
				[2, new Map([[4, "1"]])]
			]);

			// When.
			const solution = findCheapestSolution(5, allRequirements);

			// Then.
			equal(solution, expectedSolution);
		});

		it("findCheapestSolution fails to find solution when two client want opposite of each other", () => {
			// Given.
			const expectedSolution = undefined;
			const allRequirements = new Map([
				[0, new Map([[0, "0"]])],
				[1, new Map([[0, "1"]])]
			]);

			// When.
			const solution = findCheapestSolution(1, allRequirements);

			// Then.
			equal(solution, expectedSolution);
		});

		it("findCheapestSolution finds a solution when all colors must be expensive", () => {
			// Given.
			const expectedSolution = "11";
			const allRequirements = new Map([
				[0, new Map([[0, "0"], [1, "1"]])],
				[1, new Map([[0, "1"]])]
			]);

			// When.
			const solution = findCheapestSolution(2, allRequirements);

			// Then.
			equal(solution, expectedSolution);
		});

		it("findCheapestSolution finds a solution that satisfies many clients", () => {
			// Given.
			const expectedSolution = "01010";
			const allRequirements = new Map([
				[0, new Map([[1, "1"]])],
				[1, new Map([[4, "0"]])],
				[2, new Map([[0, "0"]])],
				[3, new Map([[0, "0"], [3, "1"], [4, "0"]])],
				[4, new Map([[2, "0"]])],
				[5, new Map([[4, "0"]])],
				[6, new Map([[0, "0"], [2, "0"], [4, "0"]])],
				[7, new Map([[2, "0"]])],
				[8, new Map([[1, "1"]])],
				[9, new Map([[0, "0"], [4, "0"]])],
				[10, new Map([[1, "1"]])],
				[11, new Map([[4, "0"]])],
				[12, new Map([[3, "1"]])],
				[13, new Map([[3, "1"], [4, "0"]])]
			]);

			// When.
			const solution = findCheapestSolution(5, allRequirements);

			// Then.
			equal(solution, expectedSolution);
		});
	})

	it("readFileContents reads and breaks a file into lines", () => {
		// Given.
		const fileName = join(__dirname, "testInput.txt");

		// When.
		const fileLines = readFileContents(fileName);

		// Then.
		equal(fileLines.length, 4);
		equal(fileLines[0], "5");
		equal(fileLines[1], "1 M 3 G 5 G");
		equal(fileLines[2], "2 G 3 M 4 G");
		equal(fileLines[3], "5 M");
	});

	it("parseFileInputLine", () => {
		// Given.
		const fileLine = "2 G 3 M 4 G";

		// When.
		const clientRequirements = parseFileInputLine(fileLine);

		// Then.
		equal(clientRequirements.size, 3);
		equal(clientRequirements.get(1), 0);
		equal(clientRequirements.get(2), 1);
	});

	it("parseFileInput", () => {
		// Given
		const fileLines = ["5", "1 M 3 G 5 G", "2 G 3 M 4 G", "5 M"];

		// When.
		const {colors, allRequirements} = parseFileInput(fileLines);

		// Then.
		equal(colors, 5);
		equal("1", allRequirements.get(0).get(0));
		equal("0", allRequirements.get(0).get(2));
		equal("1", allRequirements.get(2).get(4));
		equal(3, allRequirements.size);
	});

	it("optimizer finds cheapest solution", () => {
		// Given.
		const fileName = join(__dirname, "testInput.txt");

		// When.
		const cheapestSolution = optimizer([fileName]);

		// Then.
		equal(cheapestSolution, "G G G G M ");
	});

	it("optimizer notifies of no solution if it can't find one", () => {
		// Given.
		const fileName = join(__dirname, "testInputFail.txt");

		// When.
		const cheapestSolution = optimizer([fileName]);

		// Then.
		equal(cheapestSolution, "No solution exists");
	});
});
