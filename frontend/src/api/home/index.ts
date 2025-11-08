// src/api/home/index.ts
import { HomeService } from "./service";

export const homeClient = new HomeService();

export * from "./types";
