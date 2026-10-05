import { EvaluationDeleteDialog } from "./EvaluationDeleteDialog";
import { EvaluationLifecycleDialog } from "./EvaluationLifecycleDialog";
import type { Evaluation, NameInput, Question } from "./evaluations";
import { NameDialog } from "./NameDialog";

export type EditTarget =
  | { kind: "évaluation"; value?: Evaluation }
  | { kind: "question"; value?: Question };
export type DeleteTarget =
  | { kind: "évaluation"; value: Evaluation }
  | { kind: "question"; value: Question };
export type LifecycleTarget = {
  action: "validate" | "archive";
  value: Evaluation;
};

type Props = {
  deleting: DeleteTarget | null;
  editing: EditTarget | null;
  lifecycle: LifecycleTarget | null;
  onCloseDelete: () => void;
  onCloseEdit: () => void;
  onCloseLifecycle: () => void;
  onDelete: () => Promise<void>;
  onSave: (input: NameInput) => Promise<void>;
  onTransition: () => Promise<void>;
};

export function EvaluationPageDialogs(props: Props) {
  return (
    <>
      {props.editing && (
        <NameDialog
          kind={props.editing.kind}
          value={props.editing.value}
          onCancel={props.onCloseEdit}
          onSubmit={props.onSave}
        />
      )}
      {props.deleting && (
        <EvaluationDeleteDialog
          kind={props.deleting.kind}
          value={props.deleting.value}
          onCancel={props.onCloseDelete}
          onConfirm={props.onDelete}
        />
      )}
      {props.lifecycle && (
        <EvaluationLifecycleDialog
          action={props.lifecycle.action}
          evaluation={props.lifecycle.value}
          onCancel={props.onCloseLifecycle}
          onConfirm={props.onTransition}
        />
      )}
    </>
  );
}
