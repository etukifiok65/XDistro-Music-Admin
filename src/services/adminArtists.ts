import { isAdminDataDummyEnabled, requestAdminJson } from "@/services/adminClient";
import { mockAdminArtists } from "@/data/adminArtists";
import { AdminArtist } from "@/types/admin";

const ADMIN_ARTISTS_KEY = "admin:artists";

const readStoredArtists = (): AdminArtist[] => {
  try {
    const raw = localStorage.getItem(ADMIN_ARTISTS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ARTISTS_KEY, JSON.stringify(mockAdminArtists));
      return mockAdminArtists;
    }

    const parsed = JSON.parse(raw) as AdminArtist[];
    if (!Array.isArray(parsed)) {
      return mockAdminArtists;
    }

    return parsed;
  } catch {
    return mockAdminArtists;
  }
};

const writeStoredArtists = (artists: AdminArtist[]) => {
  localStorage.setItem(ADMIN_ARTISTS_KEY, JSON.stringify(artists));
};

export const getAdminArtists = async (): Promise<AdminArtist[]> => {
  if (isAdminDataDummyEnabled()) {
    return readStoredArtists();
  }

  const payload = await requestAdminJson<{ data?: AdminArtist[]; artists?: AdminArtist[] }>("/artists");
  return payload.data || payload.artists || [];
};

export const deleteAdminArtist = async (artistId: AdminArtist["id"]): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredArtists().filter((artist) => artist.id !== artistId);
    writeStoredArtists(updated);
    return;
  }

  await requestAdminJson(`/artists/${artistId}`, { method: "DELETE" });
};

export const updateAdminArtist = async (updatedArtist: AdminArtist): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredArtists().map((artist) =>
      artist.id === updatedArtist.id ? { ...artist, ...updatedArtist } : artist
    );
    writeStoredArtists(updated);
    return;
  }

  await requestAdminJson(`/artists/${updatedArtist.id}`, {
    method: "PATCH",
    body: JSON.stringify(updatedArtist),
  });
};

export const updateAdminArtistStatus = async (artistId: AdminArtist["id"], status: string): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredArtists().map((artist) =>
      artist.id === artistId ? { ...artist, status } : artist
    );
    writeStoredArtists(updated);
    return;
  }

  await requestAdminJson(`/artists/${artistId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};