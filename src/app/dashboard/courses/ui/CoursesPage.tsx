"use client";

import React from "react";
import { useCoursesController } from "../controller/useCoursesController";
import { CoursesView } from "./view";

export function CoursesPage() {
  const controller = useCoursesController();
  return <CoursesView controller={controller} />;
}
