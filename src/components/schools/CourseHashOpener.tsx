"use client";
/**
 * When a link such as /schools/technology-computers-ai#course-tech-web-development
 * is followed, open that course's <details> so the learner lands on an
 * expanded outline instead of a closed one.
 *
 * useEffect runs code in the browser AFTER React has put the page on screen.
 * The function it returns is the "cleanup", run when the component goes away.
 */
import { useEffect } from "react";

export function CourseHashOpener() {
  useEffect(() => {
    function openCourseFromHash() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const element = document.getElementById(id);
      if (element instanceof HTMLDetailsElement) {
        element.open = true;
        element.scrollIntoView({ block: "start" });
      }
    }

    openCourseFromHash();
    window.addEventListener("hashchange", openCourseFromHash);
    return () => window.removeEventListener("hashchange", openCourseFromHash);
  }, []);

  // This component only adds behaviour; it draws nothing.
  return null;
}
