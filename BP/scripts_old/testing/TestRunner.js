// 📁 testing/TestRunner.js
export class TestRunner {
	constructor(server) {
		this.server = server;
		this.tests = new Map();
	}

	registerTest(name, testFunction) {
		this.tests.set(name, testFunction);
	}

	async runAllTests() {
		const results = [];

		for (const [name, test] of this.tests) {
			try {
				const start = Date.now();
				await test();
				const duration = Date.now() - start;
				results.push({ name, status: "✓", duration });
			} catch (error) {
				results.push({
					name,
					status: "✗",
					error: error.message
				});
			}
		}

		this.logResults(results);
		return results;
	}

	logResults(results) {
		console.log("=== TEST RESULTS ===");
		results.forEach((test) => {
			if (test.status === "✓") {
				console.log(
					`§a${test.name.padEnd(30)} ${test.status} (${
						test.duration
					}ms)`
				);
			} else {
				console.log(
					`§c${test.name.padEnd(30)} ${test.status} ${test.error}`
				);
			}
		});
	}
}
