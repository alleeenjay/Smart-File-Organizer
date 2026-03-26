import type { AutoRule, MovePlanItem } from '../types';

type Props = {
  autoRule: AutoRule;
  setAutoRule: (rule: Partial<AutoRule>) => void;
  autoPlan: MovePlanItem[];
  previewPlan: () => Promise<void>;
  applyPlan: () => Promise<void>;
  undoPlan: () => Promise<void>;
};

export const AutoOrganizePanel = ({ autoRule, setAutoRule, autoPlan, previewPlan, applyPlan, undoPlan }: Props) => (
  <section className="card organize">
    <h2>Auto-Organize</h2>
    <p>Choose a rule and destination, then preview changes before applying.</p>
    <label>Rule</label>
    <select value={autoRule.mode} onChange={(e) => setAutoRule({ mode: e.target.value as AutoRule['mode'] })}>
      <option value="type">By file type</option>
      <option value="extension">By extension</option>
      <option value="month">By modified month</option>
      <option value="year">By modified year</option>
    </select>
    <label>Destination root folder</label>
    <input className="input" value={autoRule.destination} onChange={(e) => setAutoRule({ destination: e.target.value })} />
    <div className="actions">
      <button className="button" onClick={previewPlan}>Preview</button>
      <button className="button" onClick={applyPlan} disabled={!autoPlan.length}>Apply</button>
      <button className="button" onClick={undoPlan}>Undo Last</button>
    </div>
    <h3>Preview ({autoPlan.length} moves)</h3>
    <div className="plan-list">
      {autoPlan.slice(0, 80).map((item) => (
        <div key={`${item.source}-${item.destination}`}>{item.source} → {item.destination}</div>
      ))}
      {autoPlan.length > 80 && <div>...and {autoPlan.length - 80} more</div>}
    </div>
  </section>
);
