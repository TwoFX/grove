import { useMemo } from "react";
import { GroveContextData } from "./contextdata";
import { createContextData } from "./metadata";
import useSWRImmutable from "swr/immutable";

const stringFetcher: (url: string) => Promise<string> = (url) =>
  fetch(url).then((res) => res.text());

export interface Load<T> {
  data: T | undefined;
  isLoading: boolean;
}

function useFetchProjectData(): Load<string> {
  const { data, error, isLoading } = useSWRImmutable(
    "/metadata.json",
    stringFetcher,
  );
  if (error) {
    throw new Error(error);
  }
  return { data, isLoading };
}

function useFetchInvalidatedFactsData(shouldFetch: boolean): Load<string> {
  const { data, error, isLoading } = useSWRImmutable(
    shouldFetch ? "/invalidated.json" : null,
    stringFetcher,
  );
  if (error) {
    throw new Error(error);
  }
  return { data, isLoading };
}

export function useFetchGroveContextData(
  haveUpstreamInvalidatedFacts: boolean,
): Load<GroveContextData> {
  const projectDataRaw = useFetchProjectData();
  const upstreamInvalidatedFactsData = useFetchInvalidatedFactsData(
    haveUpstreamInvalidatedFacts,
  );

  const result: Load<GroveContextData> = useMemo(() => {
    if (projectDataRaw.isLoading || upstreamInvalidatedFactsData.isLoading) {
      return { data: undefined, isLoading: true };
    }

    if (!projectDataRaw.data) {
      throw new Error("Failed to fetch project data");
    }

    return {
      data: createContextData(
        JSON.parse(projectDataRaw.data),
        upstreamInvalidatedFactsData.data
          ? JSON.parse(upstreamInvalidatedFactsData.data)
          : undefined,
      ),
      isLoading: false,
    };
  }, [
    projectDataRaw.data,
    projectDataRaw.isLoading,
    upstreamInvalidatedFactsData.isLoading,
    upstreamInvalidatedFactsData.data,
  ]);
  return result;
}
