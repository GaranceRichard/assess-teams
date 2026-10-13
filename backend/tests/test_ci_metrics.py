import pytest

from tests.ci_helpers import load_script

metrics = load_script("ci_metrics")


def test_runner_wait_is_measured_from_dependency_readiness_not_workflow_start():
    run = {
        "id": 1,
        "run_attempt": 2,
        "head_sha": "abc",
        "conclusion": "success",
        "run_started_at": "2026-10-13T12:00:00Z",
    }

    def job(name, start, end):
        return {
            "name": name,
            "status": "completed",
            "conclusion": "success",
            "steps": [],
            "started_at": f"2026-10-13T12:{start}",
            "completed_at": f"2026-10-13T12:{end}",
        }

    jobs = [
        job("Backend tests (1/3)", "00:03Z", "02:03Z"),
        job("Backend global coverage", "02:06Z", "02:16Z"),
        job("Full quality gate", "02:19Z", "02:29Z"),
    ]
    result = metrics.measure(run, jobs)
    assert result["wall_seconds"] == 149
    assert result["job_seconds"] == 140
    assert result["jobs_count"] == 3
    assert [item["runner_delay_seconds"] for item in result["jobs"]] == [3, 3, 3]
    assert result["critical_predecessor"] == "Backend global coverage"


def test_incomplete_workflow_is_not_a_performance_measurement():
    with pytest.raises(ValueError):
        metrics.measure({}, [{"status": "in_progress"}])
