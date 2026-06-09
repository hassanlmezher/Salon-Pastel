import { useEffect, useState } from "react";
import type { DraftBooking } from "../types";
import { defaultDraft, readDraft, writeDraft } from "../mocks/storage";

export function usePersistedDraft() {
  const [draft, setDraft] = useState<DraftBooking>(readDraft);

  useEffect(() => {
    writeDraft(draft);
  }, [draft]);

  const resetDraft = () => setDraft(defaultDraft);

  return { draft, setDraft, resetDraft };
}
