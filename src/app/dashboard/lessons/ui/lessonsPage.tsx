"use client";

import React from "react";
import { LessonsView } from "./view";
import { useLessonsController } from "../controller/useLessonsController";

export function LessonsPage() {
  const controller = useLessonsController();
  return <LessonsView controller={controller} />;
}
