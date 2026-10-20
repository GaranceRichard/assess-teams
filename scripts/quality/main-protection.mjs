export const impactCheck = {
  context: "Required impact gate",
  integration_id: 15368,
};

export function protectionRules(ref = "refs/heads/main") {
  return {
    name: "Assess teams - PR and impact gate",
    target: "branch",
    enforcement: "active",
    bypass_actors: [],
    conditions: { ref_name: { include: [ref], exclude: [] } },
    rules: [
      { type: "deletion" },
      { type: "non_fast_forward" },
      {
        type: "pull_request",
        parameters: {
          dismiss_stale_reviews_on_push: false,
          require_code_owner_review: false,
          require_last_push_approval: false,
          allowed_merge_methods: ["merge"],
          required_approving_review_count: 0,
          required_review_thread_resolution: true,
        },
      },
      {
        type: "required_status_checks",
        parameters: {
          required_status_checks: [impactCheck],
          strict_required_status_checks_policy: true,
          do_not_enforce_on_create: false,
        },
      },
    ],
  };
}

export function assertProtection(rules, sources) {
  for (const type of [
    "deletion",
    "non_fast_forward",
    "pull_request",
    "required_status_checks",
  ]) {
    if (!rules.some((rule) => rule.type === type))
      throw new Error(`Protection absente: ${type}`);
  }
  const pull = rules.filter((rule) => rule.type === "pull_request");
  if (
    pull.some(
      ({ parameters: p }) =>
        !p?.required_review_thread_resolution ||
        p.required_approving_review_count !== 0 ||
        p.require_code_owner_review ||
        p.require_last_push_approval ||
        p.allowed_merge_methods?.length !== 1 ||
        p.allowed_merge_methods[0] !== "merge",
    )
  )
    throw new Error("Regles PR incompatibles avec la decision approuvee");
  const checks = rules.filter((rule) => rule.type === "required_status_checks");
  if (
    !checks.some(
      ({ parameters: p }) =>
        p?.strict_required_status_checks_policy === true &&
        p.do_not_enforce_on_create !== true &&
        p.required_status_checks?.some(
          (check) =>
            check.context === impactCheck.context &&
            check.integration_id === impactCheck.integration_id,
        ),
    )
  )
    throw new Error(
      "Required impact gate strict et producteur GitHub Actions requis",
    );
  const ids = new Set(rules.map((rule) => rule.ruleset_id));
  if (
    ids.has(undefined) ||
    sources.length !== ids.size ||
    sources.some(
      (source) =>
        !ids.has(source.id) ||
        source.enforcement !== "active" ||
        !Array.isArray(source.bypass_actors) ||
        source.bypass_actors.length,
    )
  )
    throw new Error("Sources actives sans bypass non demontrees");
}

export function readProtection(client, branch = "main") {
  const rules = client
    .pages(`rules/branches/${encodeURIComponent(branch)}?per_page=100`)
    .flat();
  const ids = [...new Set(rules.map((rule) => rule.ruleset_id))];
  const sources = ids.map((id) =>
    client.api(`rulesets/${id}?includes_parents=true`),
  );
  assertProtection(rules, sources);
  return { rules, sources };
}
