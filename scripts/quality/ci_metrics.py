"""Measure completed Actions attempts: wall time, runner delay and summed job cost."""

import argparse
import json
import subprocess
from datetime import datetime
from pathlib import Path
from statistics import median


def instant(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def measure(run, jobs):
    if not jobs or any(job["status"] != "completed" for job in jobs):
        raise ValueError("Only complete workflow attempts can be measured")
    started = instant(run["run_started_at"])
    finished = max(instant(job["completed_at"]) for job in jobs)
    rows = []
    for job in jobs:
        name = job["name"]
        dependencies = []
        if name == "Backend global coverage":
            dependencies = [item for item in jobs if "Backend tests (" in item["name"]]
        elif name == "Full quality gate":
            dependencies = [item for item in jobs if item != job]
        ready = max(
            [started] + [instant(item["completed_at"]) for item in dependencies]
        )
        job_start = instant(job["started_at"])
        job_end = instant(job["completed_at"])
        execution = next(
            (
                step
                for step in job["steps"]
                if step["name"].startswith(("Tests et", "Parcours Playwright"))
            ),
            None,
        )
        setup = next(
            (step for step in job["steps"] if step["name"] == "Set up job"), None
        )
        rows.append(
            {
                "name": name,
                "conclusion": job["conclusion"],
                "job_seconds": (job_end - job_start).total_seconds(),
                "runner_delay_seconds": max(0, (job_start - ready).total_seconds()),
                "runner_setup_seconds": (
                    (
                        instant(setup["completed_at"]) - instant(setup["started_at"])
                    ).total_seconds()
                    if setup
                    else None
                ),
                "preparation_seconds": (
                    (instant(execution["started_at"]) - job_start).total_seconds()
                    if execution
                    else None
                ),
            }
        )
    critical = max(
        (job for job in jobs if job["name"] != "Full quality gate"),
        key=lambda job: instant(job["completed_at"]),
    )
    return {
        "run": run["id"],
        "attempt": run["run_attempt"],
        "sha": run["head_sha"],
        "conclusion": run["conclusion"],
        "wall_seconds": (finished - started).total_seconds(),
        "job_seconds": sum(row["job_seconds"] for row in rows),
        "jobs_count": len(rows),
        "critical_predecessor": critical["name"],
        "jobs": rows,
    }


def api(path):
    return json.loads(subprocess.check_output(["gh", "api", path], encoding="utf-8"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("runs", nargs="+", help="run-id or run-id:attempt")
    parser.add_argument("--repo", default="GaranceRichard/assess-teams")
    parser.add_argument(
        "--output", type=Path, default=Path(".cache/ci/measurements.json")
    )
    args = parser.parse_args()
    measurements = []
    for identifier in args.runs:
        run_id, _, attempt = identifier.partition(":")
        path = f"repos/{args.repo}/actions/runs/{run_id}"
        run = api(path + (f"/attempts/{attempt}" if attempt else ""))
        jobs_path = path + f"/attempts/{run['run_attempt']}/jobs"
        jobs = []
        page = 1
        while True:
            batch = api(jobs_path + f"?per_page=100&page={page}")["jobs"]
            jobs.extend(batch)
            if len(batch) < 100:
                break
            page += 1
        measurements.append(measure(run, jobs))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(measurements, indent=2) + "\n", encoding="utf-8")
    print(
        "run:attempt | wall seconds | summed job seconds | jobs | critical predecessor"
    )
    for item in measurements:
        print(
            f"{item['run']}:{item['attempt']} | {item['wall_seconds']:.0f} | "
            f"{item['job_seconds']:.0f} | {item['jobs_count']} | {item['critical_predecessor']}"
        )
    if len(measurements) > 1:
        print(
            f"Median wall: {median(item['wall_seconds'] for item in measurements):.0f}s; "
            f"median summed jobs: {median(item['job_seconds'] for item in measurements):.0f}s"
        )


if __name__ == "__main__":
    main()
