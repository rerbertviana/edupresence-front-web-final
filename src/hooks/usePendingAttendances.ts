"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type PendingAttendanceDTO = {
  id: number;
  studentId: number;
  lessonId: number;

  recordType: "CHECKIN" | "CHECKOUT" | string;
  recordTime: string;
  status: "PENDING" | "PRESENT" | "ABSENT" | string;

  deviceId: string;

  student: {
    id: number;
    registrationNumber: string;
    courseId: number;
    currentSemester: number;
    user: {
      id: number;
      fullName: string;
      email: string;
      role: "STUDENT" | string;
      createdAt?: string;
    };
    course: {
      id: number;
      name: string;
    };
  };

  lesson: {
    id: number;
    classSubjectId: number;
    date: string;
    startTime: string;
    endTime: string;
    status: "OPEN" | "CLOSED" | string;

    classSubject: {
      id: number;
      classId: number;
      subjectId: number;
      teacherId: number;

      class: {
        id: number;
        courseId: number;
        semester: string;
        shift: "MORNING" | "AFTERNOON" | "NIGHT" | string;
        course: { id: number; name: string };
      };

      subject: { id: number; name: string; workload: number };

      teacher: {
        id: number;
        user: {
          id: number;
          fullName: string;
          email: string;
          role: "TEACHER" | string;
        };
      };
    };
  };

  justification: string | null;
};

type UsePendingAttendancesArgs = {
  enabled: boolean;
};

const STORAGE_KEY = "edupresence_pending_last_notified_count";

function readStoredCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

function writeStoredCount(v: number) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, String(v));
}

export function usePendingAttendances({ enabled }: UsePendingAttendancesArgs) {
  const [animateBell, setAnimateBell] = useState(false);

  const lastNotifiedCountRef = useRef<number>(readStoredCount());

  const hydratedRef = useRef(false);

  const { data: pendingAttendances } = useQuery<PendingAttendanceDTO[]>({
    queryKey: ["pending-attendances"],
    queryFn: async () => {
      const response = await api.get<PendingAttendanceDTO[]>(
        "/attendances/filters/pending",
      );
      return response.data;
    },
    enabled,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const pendingCount = pendingAttendances?.length ?? 0;

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;

      if (pendingCount > 0 && lastNotifiedCountRef.current === 0) {
        lastNotifiedCountRef.current = pendingCount;
        writeStoredCount(pendingCount);
      }

      if (pendingCount === 0) {
        lastNotifiedCountRef.current = 0;
        writeStoredCount(0);
      }

      return;
    }

    const lastNotified = lastNotifiedCountRef.current;

    if (pendingCount > lastNotified) {
      setAnimateBell(true);

      const timeout = setTimeout(() => {
        setAnimateBell(false);
      }, 1200);

      lastNotifiedCountRef.current = pendingCount;
      writeStoredCount(pendingCount);

      return () => clearTimeout(timeout);
    }

    if (pendingCount === 0 && lastNotified !== 0) {
      lastNotifiedCountRef.current = 0;
      writeStoredCount(0);
    }
  }, [pendingCount]);

  return {
    pendingAttendances: pendingAttendances ?? [],
    pendingCount,
    animateBell,
  };
}
