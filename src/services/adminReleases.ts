import { isAdminDataDummyEnabled, requestAdminJson } from "@/services/adminClient";
import { mockAdminReleases } from "@/data/adminReleases";
import { AdminRelease, AdminReleaseStatus } from "@/types/admin";

const ADMIN_RELEASES_KEY = "admin:releases";

const readStoredReleases = (): AdminRelease[] => {
  try {
    const raw = localStorage.getItem(ADMIN_RELEASES_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_RELEASES_KEY, JSON.stringify(mockAdminReleases));
      return mockAdminReleases;
    }

    const parsed = JSON.parse(raw) as AdminRelease[];
    if (!Array.isArray(parsed)) {
      return mockAdminReleases;
    }

    // Re-seed if stored data is missing fields added in newer mock versions
    const isStale = parsed.some((r) => r.copyrightYear === undefined);
    if (isStale) {
      localStorage.setItem(ADMIN_RELEASES_KEY, JSON.stringify(mockAdminReleases));
      return mockAdminReleases;
    }

    return parsed;
  } catch {
    return mockAdminReleases;
  }
};

const writeStoredReleases = (releases: AdminRelease[]) => {
  localStorage.setItem(ADMIN_RELEASES_KEY, JSON.stringify(releases));
};

export const getAdminReleases = async (): Promise<AdminRelease[]> => {
  if (isAdminDataDummyEnabled()) {
    return readStoredReleases();
  }

  const payload = await requestAdminJson<{ data?: AdminRelease[]; releases?: AdminRelease[] }>("/releases");
  return payload.data || payload.releases || [];
};

export const updateAdminReleaseStatus = async (
  releaseId: AdminRelease["id"],
  status: AdminReleaseStatus
): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredReleases().map((release) =>
      release.id === releaseId ? { ...release, status } : release
    );
    writeStoredReleases(updated);
    return;
  }

  await requestAdminJson(`/releases/${releaseId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const updateAdminReleaseUpc = async (releaseId: AdminRelease["id"], upc: string): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredReleases().map((release) =>
      release.id === releaseId ? { ...release, upc } : release
    );
    writeStoredReleases(updated);
    return;
  }

  await requestAdminJson(`/releases/${releaseId}/upc`, {
    method: "PATCH",
    body: JSON.stringify({ upc }),
  });
};

export const updateAdminTrackIsrc = async (
  releaseId: AdminRelease["id"],
  trackId: AdminRelease["trackList"][number]["id"],
  isrc: string
): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredReleases().map((release) => {
      if (release.id !== releaseId) {
        return release;
      }

      return {
        ...release,
        trackList: release.trackList?.map((track) =>
          track.id === trackId ? { ...track, isrc } : track
        ),
      };
    });

    writeStoredReleases(updated);
    return;
  }

  await requestAdminJson(`/releases/${releaseId}/tracks/${trackId}/isrc`, {
    method: "PATCH",
    body: JSON.stringify({ isrc }),
  });
};