import { useState } from "react";
import type { SourceFormValues, SourceType } from "../types/source.types";

export interface NewSourceFormProps {
  onSubmit: (values: SourceFormValues) => void;
  disabled?: boolean;
}

const EMPTY_LIMITS: SourceFormValues["limits"] = {
  timeout_seconds: 10,
  concurrency: 2,
  requests_per_second: 1,
  max_depth: 2,
  max_pages: 100,
  max_response_bytes: 1_000_000,
};

const TYPES: Array<{ value: SourceType; label: string }> = [
  { value: "website", label: "Site web" },
  { value: "api", label: "API" },
  { value: "network", label: "Réseau" },
];

export function NewSourceForm({ onSubmit, disabled = false }: NewSourceFormProps) {
  const [values, setValues] = useState<SourceFormValues>({
    name: "",
    type: "website",
    base_url: "",
    enabled: true,
    allowed_hosts: [],
    limits: EMPTY_LIMITS,
  });

  const setLimit = (key: keyof SourceFormValues["limits"], value: number) => {
    setValues((current) => ({
      ...current,
      limits: { ...current.limits, [key]: value },
    }));
  };

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <div className="form-grid">
        <div className="field">
          <label className="field-label" htmlFor="source-name">
            Nom
          </label>
          <input
            id="source-name"
            className="input"
            required
            value={values.name}
            placeholder="Nom de la source"
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.currentTarget.value }))
            }
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="source-type">
            Type
          </label>
          <select
            id="source-type"
            className="select"
            value={values.type}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                type: event.currentTarget.value as SourceType,
              }))
            }
          >
            {TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="source-url">
          URL de base
        </label>
        <input
          id="source-url"
          className="input"
          required
          type="url"
          value={values.base_url}
          placeholder="https://example.org"
          onChange={(event) =>
            setValues((current) => ({ ...current, base_url: event.currentTarget.value }))
          }
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="source-hosts">
          Domaines autorisés
        </label>
        <input
          id="source-hosts"
          className="input"
          value={values.allowed_hosts.join(", ")}
          placeholder="example.org, api.example.org"
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              allowed_hosts: event.currentTarget.value
                .split(",")
                .map((host) => host.trim())
                .filter((host) => host.length > 0),
            }))
          }
        />
      </div>

      <div className="form-grid">
        <div className="field">
          <label className="field-label" htmlFor="source-timeout">
            Timeout (s)
          </label>
          <input
            id="source-timeout"
            className="input"
            type="number"
            min={1}
            max={120}
            value={values.limits.timeout_seconds}
            onChange={(event) => setLimit("timeout_seconds", Number(event.currentTarget.value))}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="source-concurrency">
            Concurrence
          </label>
          <input
            id="source-concurrency"
            className="input"
            type="number"
            min={1}
            max={16}
            value={values.limits.concurrency}
            onChange={(event) => setLimit("concurrency", Number(event.currentTarget.value))}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="source-depth">
            Profondeur max
          </label>
          <input
            id="source-depth"
            className="input"
            type="number"
            min={0}
            max={10}
            value={values.limits.max_depth}
            onChange={(event) => setLimit("max_depth", Number(event.currentTarget.value))}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="source-pages">
            Pages max
          </label>
          <input
            id="source-pages"
            className="input"
            type="number"
            min={1}
            max={10_000}
            value={values.limits.max_pages}
            onChange={(event) => setLimit("max_pages", Number(event.currentTarget.value))}
          />
        </div>
      </div>

      <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <input
          className="checkbox"
          type="checkbox"
          checked={values.enabled}
          onChange={(event) =>
            setValues((current) => ({ ...current, enabled: event.currentTarget.checked }))
          }
        />
        <span className="cell-muted">Source activée</span>
      </label>

      <div className="cell-actions">
        <button className="button button--primary" type="submit" disabled={disabled}>
          Enregistrer la source
        </button>
      </div>
    </form>
  );
}
