"use client";

import React from "react";
import { useClassesController } from "../controller/useClassesController";
import { ClassesView } from "./view";

export function ClassesPage() {
  const controller = useClassesController();
  return <ClassesView controller={controller} />;
}
