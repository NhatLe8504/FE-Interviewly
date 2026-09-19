"use client";

import React from "react";

export interface LogoProps {
  className?: string;
  size?: number;
}

/** Official Facebook rounded brand icon with white 'f' */
export function FacebookLogo({ className = "size-5", size = 24 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="24" fill="#1877F2" />
      <path
        fill="#FFFFFF"
        d="M29.5 24h-4v14h-6V24h-3v-5h3v-3.2c0-4.1 2.5-6.4 6.2-6.4 1.8 0 3.7.3 3.7.3v4.1h-2.1c-2 0-2.6 1.3-2.6 2.6V19h4.7l-.9 5z"
      />
    </svg>
  );
}

/** Official TikTok multi-color 3D chromatic aberration icon */
export function TikTokLogo({ className = "size-5", size = 24 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="12" fill="#010101" />
      {/* Cyan Layer */}
      <path
        fill="#25F4EE"
        d="M28.4 13.6c1.6 2.1 3.9 3.5 6.6 3.8v4.2c-2.4-.2-4.6-1.1-6.4-2.5v12.2c0 5.4-4.4 9.8-9.8 9.8-5.4 0-9.8-4.4-9.8-9.8s4.4-9.8 9.8-9.8c.8 0 1.6.1 2.4.3v4.6c-.7-.3-1.5-.5-2.4-.5-3 0-5.4 2.4-5.4 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4V9.8h4.2v3.8z"
      />
      {/* Magenta Layer */}
      <path
        fill="#FE2C55"
        d="M30.4 11.6c1.6 2.1 3.9 3.5 6.6 3.8v4.2c-2.4-.2-4.6-1.1-6.4-2.5v12.2c0 5.4-4.4 9.8-9.8 9.8-5.4 0-9.8-4.4-9.8-9.8s4.4-9.8 9.8-9.8c.8 0 1.6.1 2.4.3v4.6c-.7-.3-1.5-.5-2.4-.5-3 0-5.4 2.4-5.4 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4V7.8h4.2v3.8z"
      />
      {/* White Blend Center Layer */}
      <path
        fill="#FFFFFF"
        d="M29.4 12.6c1.6 2.1 3.9 3.5 6.6 3.8v4.2c-2.4-.2-4.6-1.1-6.4-2.5v12.2c0 5.4-4.4 9.8-9.8 9.8-5.4 0-9.8-4.4-9.8-9.8s4.4-9.8 9.8-9.8c.8 0 1.6.1 2.4.3v4.6c-.7-.3-1.5-.5-2.4-.5-3 0-5.4 2.4-5.4 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4V8.8h4.2v3.8z"
      />
    </svg>
  );
}

/** Official YouTube rounded red badge with white play icon */
export function YouTubeLogo({ className = "size-5", size = 24 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="12" fill="#FF0000" />
      <path
        fill="#FFFFFF"
        d="M19 16l14 8-14 8V16z"
      />
    </svg>
  );
}

/** Official ChatGPT / OpenAI green badge with white vortex rosette */
export function OpenAiLogo({ className = "size-5", size = 24 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="12" fill="#10A37F" />
      <path
        fill="#FFFFFF"
        d="M37.5 22.8a7.8 7.8 0 0 0-.6-6.4 7.9 7.9 0 0 0-8.5-3.8A7.9 7.9 0 0 0 15 15.4a7.8 7.8 0 0 0-5.2 3.8 7.9 7.9 0 0 0 1 9.2 7.8 7.8 0 0 0 .7 6.4 7.9 7.9 0 0 0 8.5 3.8 7.9 7.9 0 0 0 5.7 2.8 7.9 7.9 0 0 0 7.5-5.5 7.8 7.8 0 0 0 5.2-3.8 7.9 7.9 0 0 0-.9-9.3zm-11.8 16.4a5.8 5.8 0 0 1-3.7-1.3l.2-.1 6.2-3.6a1 1 0 0 0 .5-.9v-8.8l2.6 1.5a.1.1 0 0 1 0 .1v7.3a5.9 5.9 0 0 1-5.8 5.8zM13.2 33.9a5.8 5.8 0 0 1-.7-3.9l.2.1 6.2 3.6a1 1 0 0 0 1 0l7.6-4.4v3a.1.1 0 0 1 0 .1l-6.3 3.6a5.9 5.9 0 0 1-8-2.1zm-1.6-12.2a5.8 5.8 0 0 1 3.1-2.6V26.4a1 1 0 0 0 .5.9l7.6 4.4-2.6 1.5a.1.1 0 0 1-.1 0l-6.3-3.6a5.9 5.9 0 0 1-2.2-7.9zm21.6 5a1 1 0 0 0-.5-.9l-7.6-4.4 2.6-1.5a.1.1 0 0 1 .1 0l6.3 3.6a5.9 5.9 0 0 1-.9 10.5v-7.3zm2.6-3.9l-.2-.1-6.2-3.6a1 1 0 0 0-1 0L20.2 23.5v-3a.1.1 0 0 1 0-.1l6.3-3.6a5.9 5.9 0 0 1 8.7 5.6zm-16.4 3.7l2.6-1.5 2.6 1.5-2.6 1.5z"
      />
    </svg>
  );
}

/** Official Google 4-Color 'G' Logo */
export function GoogleLogo({ className = "size-5", size = 24 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="12" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
      <path
        fill="#4285F4"
        d="M35.5 24.3c0-.8-.1-1.6-.2-2.3H24v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7v3.1h3.9c2.3-2.1 3.5-5.2 3.5-9z"
      />
      <path
        fill="#34A853"
        d="M24 36c3.2 0 6-1.1 7.9-2.9l-3.9-3.1c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.8-2.1-6.7-4.9H13.2v3.1C15.2 33.4 19.3 36 24 36z"
      />
      <path
        fill="#FBBC05"
        d="M17.3 26.3c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3V18.6H13.2C12.4 20.2 12 22 12 24s.4 3.8 1.2 5.4l4.1-3.1z"
      />
      <path
        fill="#EA4335"
        d="M24 16.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C29.9 13.3 27.2 12 24 12c-4.7 0-8.8 2.6-10.8 6.6l4.1 3.1c.9-2.8 3.6-4.9 6.7-4.9z"
      />
    </svg>
  );
}

/** Word of Mouth & Referral Icon with high contrast gradient badge */
export function ReferralLogo({ className = "size-5", size = 24 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="12" fill="#8B5CF6" />
      <g fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 28v-2a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5v2" />
        <circle cx="15" cy="15" r="4" />
        <path d="M30 28v-2a5 5 0 0 0-3.5-4.8" />
        <path d="M25 11.2a4 4 0 0 1 3 7.8" />
        <path d="M38 28v-2a5 5 0 0 0-4-4.9" />
        <path d="M33 12a4 4 0 0 1 3 6" />
      </g>
    </svg>
  );
}

/** Other Channels (Events, Workshops, PR) */
export function OtherChannelLogo({ className = "size-5", size = 24 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="12" fill="#4B5563" />
      <circle cx="24" cy="24" r="12" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
      <ellipse cx="24" cy="24" rx="5" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="12" y1="24" x2="36" y2="24" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}

export function ChannelBrandIcon({
  channelKey,
  className = "size-6",
  size,
}: {
  channelKey: string;
  className?: string;
  size?: number;
}) {
  switch (channelKey.toLowerCase()) {
    case "facebook":
    case "fb":
      return <FacebookLogo className={className} size={size} />;
    case "tiktok":
      return <TikTokLogo className={className} size={size} />;
    case "youtube":
    case "yt":
      return <YouTubeLogo className={className} size={size} />;
    case "ai_recommendation":
    case "ai":
    case "chatgpt":
    case "openai":
    case "claude":
      return <OpenAiLogo className={className} size={size} />;
    case "google_search":
    case "google":
      return <GoogleLogo className={className} size={size} />;
    case "referral":
    case "friends":
    case "word_of_mouth":
      return <ReferralLogo className={className} size={size} />;
    default:
      return <OtherChannelLogo className={className} size={size} />;
  }
}