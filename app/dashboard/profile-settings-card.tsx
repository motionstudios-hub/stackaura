"use client";

import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  cn,
  lightProductCompactGhostButtonClass,
  lightProductInsetPanelClass,
  lightProductStatusPillClass,
  publicSecondaryButtonClass,
} from "../components/stackaura-ui";
import { useProfileAvatar } from "./use-profile-avatar";

const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
const AVATAR_SIZE = 320;

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read image."));
    };
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not process image."));
    image.src = src;
  });
}

async function resizeProfilePhoto(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("Please choose an image smaller than 2MB.");
  }

  const dataUrl = await fileToDataUrl(file);
  const image = await loadImage(dataUrl);

  const cropSize = Math.min(image.width, image.height);
  const cropX = (image.width - cropSize) / 2;
  const cropY = (image.height - cropSize) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not process image.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    cropX,
    cropY,
    cropSize,
    cropSize,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );

  return canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.88);
}

export default function ProfileSettingsCard({
  userId,
  userEmail,
  role,
  isMerchantActive,
}: {
  userId: string;
  userEmail: string;
  role: string;
  isMerchantActive: boolean;
}) {
  const { avatarSrc, initials, saveAvatar } = useProfileAvatar(userId, userEmail);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const resized = await resizeProfilePhoto(file);
      saveAvatar(resized);
      setMessage("Profile photo updated.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update profile photo.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleRemovePhoto() {
    saveAvatar(null);
    setMessage("Profile photo removed.");
    setError(null);
  }

  return (
    <div className="mt-5 grid gap-3">
      <div className={cn(lightProductInsetPanelClass, "p-5")}>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="h-20 w-20 rounded-[28px]">
              <AvatarImage src={avatarSrc ?? undefined} alt={`${userEmail} profile photo`} />
              <AvatarFallback className="rounded-[28px] text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="break-words text-lg font-semibold text-[#0a2540] dark:text-white">
                {userEmail}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#6b7c93] dark:text-[#8dd8ff]">
                {role}
              </div>
              <div className="mt-3">
                <span className={lightProductStatusPillClass(isMerchantActive ? "success" : "warning")}>
                  {isMerchantActive ? "Active merchant access" : "Pending merchant access"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 xl:justify-self-end">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isSaving}
              className={cn(publicSecondaryButtonClass, "min-h-[44px] px-4 py-2.5")}
            >
              {isSaving ? "Saving photo..." : avatarSrc ? "Change photo" : "Upload photo"}
            </button>

            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isSaving || !avatarSrc}
              className={cn(
                lightProductCompactGhostButtonClass,
                "min-h-[40px] justify-center rounded-2xl px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              Remove photo
            </button>
          </div>
        </div>

        <div className="mt-4 text-xs leading-6 text-[#6b7c93] dark:text-[#89a4bf]">
          Use a square JPG, PNG, or WebP image up to 2MB. The profile photo is stored for this
          signed-in operator in this browser.
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl border border-emerald-300/70 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/18 dark:bg-emerald-400/10 dark:text-emerald-200">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-amber-300/70 bg-amber-50/82 px-4 py-3 text-sm text-amber-700 dark:border-amber-400/18 dark:bg-amber-400/10 dark:text-amber-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className={cn(lightProductInsetPanelClass, "p-4")}>
        <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93] dark:text-[#8dd8ff]">
          User email
        </div>
        <div className="mt-2 text-sm text-[#0a2540] dark:text-white">{userEmail}</div>
      </div>
    </div>
  );
}
