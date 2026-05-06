"use strict";
"use client";
import { createContext, useContext, useState } from "react";
const XpContext = createContext(null);
export function XpProvider({ children }) {
  const [xp, setXp] = useState(0);
  const [submissions, setSubmissions] = useState({});
  const [partialProgress, setPartialProgress] = useState({});
  const addXp = (amount) => setXp((prev) => prev + amount);
  const removeXp = (amount) => setXp((prev) => prev - amount);
  const submitProblem = (key, submission) => {
    setSubmissions((prev) => ({ ...prev, [key]: submission }));
    addXp(submission.earned);
  };
  const getSubmission = (key) => submissions[key];
  const saveProgress = (key, data) => {
    setPartialProgress((prev) => ({ ...prev, [key]: data }));
  };
  const getProgress = (key) => partialProgress[key];
  return <XpContext.Provider value={{ xp, submissions, partialProgress, addXp, removeXp, submitProblem, getSubmission, saveProgress, getProgress }}>{children}</XpContext.Provider>;
}
const defaultState = {
  xp: 0,
  submissions: {},
  partialProgress: {},
  addXp: () => {
  },
  removeXp: () => {
  },
  submitProblem: () => {
  },
  getSubmission: () => void 0,
  saveProgress: () => {
  },
  getProgress: () => void 0
};
export function useXp() {
  const ctx = useContext(XpContext);
  return ctx || defaultState;
}
