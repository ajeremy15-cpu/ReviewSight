import { useEffect, useMemo, useState } from "react";
import CreatorCard from "@/components/creators/creator-card";

type PlatformStats = {
  followers?: number;
  engagementRate?: number;
  impressions?: number;
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
  links?: { instagram?: string; facebook?: string; tiktok?: string; website?: string };
  platforms?: { instagram?: PlatformStats; tiktok?: PlatformStats; facebook?: PlatformStats };
  brandFitScore?: number;
  [k: string]: any;
};

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
    instagramUrl: raw.links?.instagram,
    facebookUrl: raw.links?.facebook,
    tiktokUrl: raw.links?.tiktok,
    brandFitScore: raw.brandFitScore,
  };
}

export default function Creators() {
  // diagnostics + data
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<number | null>(null);
  const [json, setJson] = useState<any>(null);
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // shortlist (client-only for now)
  const [shortlisted, setShortlisted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setStatus(null);
        setJson(null);
        setText("");

        // Force no-cache to avoid 304-without-body edge cases
        const res = await fetch("/api/creators", {
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        setStatus(res.status);

        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          setJson(await res.json());
        } else {
          setText(await res.text());
        }
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const creators: RawCreator[] = useMemo(() => {
    if (!json) return [];
    if (Array.isArray(json)) return json as RawCreator[];
    if (Array.isArray(json?.creators)) return json.creators as RawCreator[];
    if (Array.isArray(json?.data)) return json.data as RawCreator[];
    return [];
  }, [json]);

  const normalized = creators.map(normalizeCreator);

  // Show a small diagnostics panel until we see valid data
  const showDiag = loading || error || status !== 200 || !normalized.length;

  return (
    <div className="p-6">
      {showDiag && (
        <div className="mb-4 rounded-xl border p-4 text-sm">
          <div className="font-semibold mb-1">Creators Diagnostics</div>
          <div>Loading: {String(loading)}</div>
          <div>Status: {status ?? "n/a"}</div>
          {error && <div className="text-red-600">Error: {error}</div>}
          {json && (
            <div className="mt-2">
              <div>JSON keys: {JSON.stringify(Object.keys(json))}</div>
              <div>Parsed creators length: {normalized.length}</div>
            </div>
          )}
          {!!text && (
            <pre className="mt-2 whitespace-pre-wrap overflow-auto">{text}</pre>
          )}
        </div>
      )}

      {!loading && !error && normalized.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {normalized.map((c) => (
            <CreatorCard
              key={c.id}
              creator={c as any}
              isShortlisted={!!shortlisted[c.id]}
              onShortlist={(current) => {
                setShortlisted((prev) => ({ ...prev, [c.id]: !current }));
              }}
            />
          ))}
        </div>
      ) : (
        !loading && !error && (
          <div className="text-sm opacity-80">No creators found.</div>
        )
      )}
    </div>
  );
}
