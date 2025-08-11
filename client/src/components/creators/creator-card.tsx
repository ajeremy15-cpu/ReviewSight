import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
// If your apiRequest lives in "@/lib/api", switch the import accordingly:
import { apiRequest } from "@/lib/queryClient";
import CreatorCard from "@/components/creators/creator-card";

// --- Types to help with editor hints (not strict to backend) ---
type PlatformStats = {
  followers?: number;
  impressions?: number;
  engagementRate?: number;
  posts?: number;
  [k: string]: number | undefined;
};

type RawCreator = {
  id: string;
  name?: string;
  displayName?: string;
  bio?: string;
  city?: string;
  country?: string;
  niches?: string[];
  followers?: number;
  engagementRate?: number;
  links?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    website?: string;
    [k: string]: string | undefined;
  };
  platforms?: {
    instagram?: PlatformStats;
    tiktok?: PlatformStats;
    facebook?: PlatformStats;
    [k: string]: PlatformStats | undefined;
  };
  brandFitScore?: number;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  // allow any other fields
  [k: string]: any;
};

type CreatorsApiResponse =
  | RawCreator[]
  | { creators: RawCreator[] }
  | { data: RawCreator[] };

// --- Normalize backend shape into what CreatorCard expects ---
function normalizeCreator(raw: RawCreator) {
  return {
    id: raw.id,
    displayName: raw.displayName || raw.name || "Unknown",
    bio: raw.bio || "",
    city: raw.city || "",
    country: raw.country || "",
    niches: raw.niches || [],
    followers:
      raw.followers ??
      raw.platforms?.instagram?.followers ??
      raw.platforms?.tiktok?.followers ??
      raw.platforms?.facebook?.followers ??
      0,
    engagementRate:
      raw.engagementRate ??
      raw.platforms?.instagram?.engagementRate ??
      raw.platforms?.tiktok?.engagementRate ??
      raw.platforms?.facebook?.engagementRate ??
      0,
    instagramUrl: raw.instagramUrl || raw.links?.instagram,
    facebookUrl: raw.facebookUrl || raw.links?.facebook,
    tiktokUrl: raw.tiktokUrl || raw.links?.tiktok,
    brandFitScore: raw.brandFitScore,
  };
}

function extractCreators(resp: CreatorsApiResponse | null | undefined): RawCreator[] {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  // @ts-ignore tolerant to loose shapes
  if (Array.isArray(resp.creators)) return resp.creators;
  // @ts-ignore tolerant to loose shapes
  if (Array.isArray(resp.data)) return resp.data;
  return [];
}

export default function Creators() {
  // Optional shortlist state (client‑side only for now)
  const [shortlistedIds, setShortlistedIds] = useState<Record<string, boolean>>({});

  const { data, isLoading, error, refetch } = useQuery({
    // You can also use the default queryFn by only providing queryKey,
    // but we’ll call the helper explicitly for clarity.
    queryKey: ["/api/creators"],
    queryFn: async () => {
      return await apiRequest<CreatorsApiResponse>("GET", "/api/creators");
    },
    staleTime: 5 * 60 * 1000,
  });

  const creators = useMemo(() => {
    const raws = extractCreators(data);
    return raws.map(normalizeCreator);
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-6 text-sm opacity-80">
        Loading creators…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-3 text-red-600 font-medium">
          Failed to load creators
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 rounded-md border hover:bg-gray-50"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!creators.length) {
    return (
      <div className="p-6">
        <div className="text-sm opacity-80">
          No creators found yet.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {creators.map((c) => {
        const isShortlisted = !!shortlistedIds[c.id];
        return (
          <CreatorCard
            key={c.id}
            creator={c}
            isShortlisted={isShortlisted}
            onShortlist={(current) => {
              // toggle shortlist locally; swap with API when ready
              setShortlistedIds((prev) => ({
                ...prev,
                [c.id]: !current,
              }));
            }}
          />
        );
      })}
    </div>
  );
}
