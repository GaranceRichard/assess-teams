export function checkResults(plan, jobs) {
  if (jobs.plan?.result !== "success") return ["plan"];
  const expected = plan.exhaustive
    ? ["full"]
    : [
        "repository",
        ...["backend", "frontend", "e2e"].filter((domain) =>
          plan.checks.some(({ scope }) => scope.startsWith(domain)),
        ),
      ];
  const failures = expected.filter((job) => jobs[job]?.result !== "success");
  const optional = ["repository", "backend", "frontend", "e2e", "full"].filter(
    (job) => !expected.includes(job),
  );
  failures.push(...optional.filter((job) => jobs[job]?.result !== "skipped"));
  return failures;
}
if (process.env.QUALITY_PLAN && process.env.QUALITY_JOB_RESULTS) {
  const failures = checkResults(
    JSON.parse(process.env.QUALITY_PLAN),
    JSON.parse(process.env.QUALITY_JOB_RESULTS),
  );
  if (failures.length) {
    console.error(`[FAIL] Gates requis: ${failures.join(", ")}`);
    process.exitCode = 1;
  } else console.log("[PASS] Tous les controles requis par le diff ont reussi");
} else if (process.argv[1]?.endsWith("selective-ci.mjs")) process.exitCode = 1;
