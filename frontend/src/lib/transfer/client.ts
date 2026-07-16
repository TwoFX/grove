import { useMemo } from "react";
import useSWRImmutable from "swr/immutable";
import { GroveContextData } from "./contextdata";
import { createContextData } from "./metadata";

export interface Load<T> {
  data: T | undefined;
  isLoading: boolean;
}

// Relative to the document URL, which hash routing keeps fixed at index.html,
// so the data files are always resolved next to the app bundle.
const projectDataUrl = "metadata.json";
const invalidatedFactsUrl = "invalidated.json";

const requiredFetcher = async (url: string): Promise<string> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
};

// Resolves to null when the file is not present. A non-OK response, a
// non-JSON body (e.g. an HTML error page) and a network failure all count
// as "this Grove has no upstream invalidated facts".
const optionalJsonFetcher = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }
    const text = await res.text();
    JSON.parse(text);
    return text;
  } catch {
    return null;
  }
};

export function useFetchGroveContextData(): Load<GroveContextData> {
  const project = useSWRImmutable(projectDataUrl, requiredFetcher);
  const invalidated = useSWRImmutable(invalidatedFactsUrl, optionalJsonFetcher);

  const result: Load<GroveContextData> = useMemo(() => {
    if (project.data === undefined || invalidated.data === undefined) {
      return { data: undefined, isLoading: true };
    }

    return {
      data: createContextData(
        JSON.parse(project.data),
        invalidated.data !== null ? JSON.parse(invalidated.data) : undefined,
      ),
      isLoading: false,
    };
  }, [project.data, invalidated.data]);

  if (project.error) {
    throw project.error;
  }

  return result;
}
