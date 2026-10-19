import pytest

from tests.ci_helpers import load_script

metrics = load_script("ci_metrics")


@pytest.mark.parametrize("prefix", ["", "full / backend / "])
@pytest.mark.parametrize("impact_gate", [False, True])
def test_runner_wait_is_measured_from_dependency_readiness_not_workflow_start(prefix, impact_gate):
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
        job(prefix + "Backend tests (1/5)", "00:03Z", "02:03Z"),
        job(prefix + "Backend global coverage", "02:06Z", "02:16Z"),
        job(prefix + "Full quality gate", "02:19Z", "02:29Z"),
    ]
    if impact_gate:
        jobs.append(job("Required impact gate", "02:32Z", "02:37Z"))
    result = metrics.measure(run, jobs)
    assert result["wall_seconds"] == (157 if impact_gate else 149)
    assert result["job_seconds"] == (145 if impact_gate else 140)
    assert result["jobs_count"] == len(jobs)
    assert [item["runner_delay_seconds"] for item in result["jobs"]] == [3] * len(jobs)
    assert result["critical_predecessor"] == prefix + "Backend global coverage"


def test_incomplete_workflow_is_not_a_performance_measurement():
    with pytest.raises(ValueError):
        metrics.measure({}, [{"status": "in_progress"}])
