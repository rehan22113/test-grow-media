"use client";
import React from "react";
import Image from "next/image";

export default function Avatar({ src, alt, size, className }) {
  const getSize = () => {
    switch (size) {
      case "xs":
        return "h-6 w-6";
      case "sm":
        return "h-8 w-8";
      case "md":
        return "h-10 w-10";
      case "lg":
        return "h-12 w-12";
      case "xl":
        return "h-14 w-14";
      case "2xl":
        return "h-16 w-16";
      default:
        return "h-10 w-10";
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-full ${getSize()} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt || "Avatar"}
          fill
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          <svg
            className="h-1/2 w-1/2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}
    </div>
  );
}