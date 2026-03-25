"use client";

import { useEffect, useMemo, useState } from "react";

const PROFILE_AVATAR_EVENT = "stackaura-profile-avatar-change";

function storageKey(userId: string) {
  return `stackaura_profile_avatar:${userId}`;
}

function readStoredAvatar(userId: string) {
  if (typeof window === "undefined" || !userId) {
    return null;
  }

  return window.localStorage.getItem(storageKey(userId)) || null;
}

function initialsFromEmail(userEmail: string) {
  return (
    userEmail
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "S"
  );
}

function emitAvatarChange(userId: string, value: string | null) {
  window.dispatchEvent(
    new CustomEvent(PROFILE_AVATAR_EVENT, {
      detail: { userId, value },
    }),
  );
}

export function useProfileAvatar(userId: string, userEmail: string) {
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  useEffect(() => {
    setAvatarSrc(readStoredAvatar(userId));

    function handleStorage(event: StorageEvent) {
      if (event.key !== storageKey(userId)) {
        return;
      }

      setAvatarSrc(event.newValue || null);
    }

    function handleAvatarChange(event: Event) {
      const detail = (event as CustomEvent<{ userId?: string; value?: string | null }>).detail;
      if (detail?.userId !== userId) {
        return;
      }

      setAvatarSrc(detail.value || null);
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(PROFILE_AVATAR_EVENT, handleAvatarChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PROFILE_AVATAR_EVENT, handleAvatarChange as EventListener);
    };
  }, [userId]);

  const initials = useMemo(() => initialsFromEmail(userEmail), [userEmail]);

  function saveAvatar(nextValue: string | null) {
    if (typeof window === "undefined" || !userId) {
      return;
    }

    if (nextValue) {
      window.localStorage.setItem(storageKey(userId), nextValue);
    } else {
      window.localStorage.removeItem(storageKey(userId));
    }

    setAvatarSrc(nextValue);
    emitAvatarChange(userId, nextValue);
  }

  return {
    avatarSrc,
    initials,
    saveAvatar,
  };
}
