const requiredJobs = ["repository", "backend-static", "backend-tests", "backend-coverage", "frontend", "e2e"];
const results = JSON.parse(process.env.QUALITY_JOB_RESULTS);
const failures = requiredJobs.filter((job) => results[job]?.result !== "success");

if (failures.length > 0) {
  console.error(`Full quality gate failed: ${failures.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log("Full quality gate passed: every required job succeeded.");
}
