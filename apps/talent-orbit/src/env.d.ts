/// <reference types="astro/client" />

declare namespace App {
  /** Origin from `site` in astro.config.mjs, without a trailing slash. */
  interface Locals {
    siteDomain: string;
  }
}
