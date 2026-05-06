import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { XpProvider, useXp } from "../../lib/daily-byte/xp-context";
import { CanvasQuiz } from "../../components/daily-byte/CanvasQuiz";

const catColor = {
    "Lower division": "var(--blue)",
    "Upper division": "var(--amber)",
    "Interview prep": "var(--coral)",
};
const catBg = {
    "Lower division": "var(--blue-dim)",
    "Upper division": "var(--amber-dim)",
    "Interview prep": "var(--coral-dim)",
};

function PlayerInner() {
    const location = useLocation();
    const navigate = useNavigate();
    const problems = location.state?.problems || [];
    
    useEffect(() => {
        if (!problems || problems.length === 0) {
            navigate("/student/daily-byte");
        }
    }, [problems, navigate]);

    const { submitProblem, getSubmission, removeXp, saveProgress } = useXp();
    const totalXp = problems.reduce((s, p) => s + p.xp, 0);

    const [activeIdx, setActiveIdx] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [hintConfirm, setHintConfirm] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    
    const [isRedoingActive, setIsRedoingActive] = useState(false);
    const [redoCount, setRedoCount] = useState(0);

    const byteNum = problems.length > 0 ? problems[0].byte || 1 : 1;

    const earnedXp = problems.reduce((s, p, i) => {
        const sub = getSubmission(`${byteNum}-${i}`);
        return s + (sub?.earned || 0);
    }, 0);

    const handleComplete = (correctCount, totalCount) => {
        if (activeIdx === null) return;
        const p = problems[activeIdx];
        const key = `${byteNum}-${activeIdx}`;
        
        if (getSubmission(key)) {
            setIsRedoingActive(false);
            return;
        }

        const base = Math.floor(p.xp / 2);
        const correctBonus = Math.round((p.xp - base) * (correctCount / totalCount));
        const earned = base + correctBonus;
        submitProblem(key, { correct: correctCount === totalCount, earned });
    };

    const handleRedo = () => {
        if (activeIdx === null) return;
        const prob = problems[activeIdx];
        const titleKey = prob.title.replace(/\s+/g, "");
        saveProgress(`canvas-${prob.byte}-${titleKey}`, undefined);
        setIsRedoingActive(true);
        setShowExplanation(false);
        setShowHint(false);
        setHintConfirm(false);
        setRedoCount(prev => prev + 1);
    };

    const handleHintClick = () => {
        if (activeIdx === null) return;
        const key = `${byteNum}-${activeIdx}`;
        if (getSubmission(key) || isRedoingActive) { setShowHint(true); return; }
        setHintConfirm(true);
    };

    const confirmHint = () => {
        removeXp(1);
        setHintConfirm(false);
        setShowHint(true);
    };

    const openProblem = (idx) => {
        setActiveIdx(idx);
        setShowHint(false);
        setHintConfirm(false);
        setShowExplanation(false);
        setIsRedoingActive(false);
    };

    const closeProblem = () => {
        setActiveIdx(null);
        setShowHint(false);
        setHintConfirm(false);
        setShowExplanation(false);
        setIsRedoingActive(false);
    };

    const navigateNext = () => {
        if (activeIdx === null) return;
        if (activeIdx < problems.length - 1) {
            openProblem(activeIdx + 1);
        }
    };

    const navigatePrev = () => {
        if (activeIdx === null) return;
        if (activeIdx > 0) {
            openProblem(activeIdx - 1);
        }
    };

    if (problems.length === 0) return null;

    if (activeIdx === null) {
        return (
            <div className="daily-byte-theme">
                <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
                    <div onClick={() => navigate("/student/daily-byte")} style={{ color: "var(--text-dim)", fontSize: 13, display: "block", marginBottom: 16, cursor: "pointer" }}>← Generate new byte</div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Daily Byte Session</h1>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                        {problems.length} problems · <span style={{ color: "var(--accent)" }}>{earnedXp} / {totalXp} XP</span>
                    </p>
                    <div style={{ width: "100%", height: 3, background: "var(--border)", borderRadius: 2, marginBottom: 24 }}>
                        <div style={{ height: "100%", background: "var(--accent)", borderRadius: 2, width: `${totalXp > 0 ? (earnedXp / totalXp) * 100 : 0}%`, transition: "width 0.5s" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {problems.map((p, i) => {
                            const sub = getSubmission(`${byteNum}-${i}`);
                            const category = p.category || "General";
                            const color = catColor[category] || "var(--blue)";
                            const bg = catBg[category] || "var(--blue-dim)";

                            return (
                                <div key={i} onClick={() => openProblem(i)} style={{
                                    background: "var(--bg-card)", border: `1px solid ${sub ? (sub.correct ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)") : "var(--border)"}`,
                                    borderRadius: 12, padding: "16px 20px", cursor: "pointer",
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                                                <span style={{ fontSize: 10, fontWeight: 600, color, background: bg, padding: "2px 8px", borderRadius: 6 }}>{category}</span>
                                                <span style={{ fontSize: 10, color: "var(--text-dim)", background: "var(--bg-input)", padding: "2px 8px", borderRadius: 6 }}>{(p.type || "unknown").replace("_", " ")}</span>
                                            </div>
                                            <div style={{ fontSize: 15, fontWeight: 600 }}>{p.title}</div>
                                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{p.course}</div>
                                        </div>
                                        <div>
                                            {sub ? (
                                                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>{sub.earned}/{p.xp} XP</span>
                                            ) : (
                                                <span style={{ fontSize: 13, color: "var(--accent)" }}>★ {p.xp}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    const p = problems[activeIdx];
    const globalSub = getSubmission(`${byteNum}-${activeIdx}`);
    const componentKey = `${activeIdx}-${redoCount}`;
    const category = p.category || "General";
    const color = catColor[category] || "var(--blue)";
    const bg = catBg[category] || "var(--blue-dim)";

    return (
        <div className="daily-byte-theme">
            <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <div onClick={closeProblem} style={{ color: "var(--text-dim)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center" }}>← Back to menu</div>
                </div>
                
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color, background: bg, padding: "2px 8px", borderRadius: 6 }}>{category}</span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{p.title}</h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{p.course}</p>
                <p style={{ fontSize: 13, color: "var(--accent)", marginBottom: 20 }}>
                    {globalSub ? `${globalSub.earned}/${p.xp} XP earned` : `★ ${p.xp} XP`}
                </p>

                <details style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                    <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--text-muted)" }}>Mini Lecture</summary>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-muted)", marginTop: 10 }}>{p.mini_lecture}</p>
                </details>

                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                    <CanvasQuiz key={componentKey} problem={p} onComplete={handleComplete} submitted={isRedoingActive ? false : !!globalSub} />
                </div>

                {!showHint && !hintConfirm && (
                    <button onClick={handleHintClick} style={{ background: "none", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 8, padding: "8px 16px", color: "var(--amber)", fontSize: 12, cursor: "pointer", marginBottom: 16 }}>Show hint</button>
                )}
                {hintConfirm && (
                    <div style={{ background: "var(--amber-dim)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "var(--amber)" }}>Using a hint costs 1 XP</span>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={confirmHint} style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 6, padding: "6px 12px", color: "var(--amber)", fontSize: 12, cursor: "pointer" }}>See anyway</button>
                            <button onClick={() => setHintConfirm(false)} style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 12px", color: "var(--text-dim)", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                        </div>
                    </div>
                )}
                {showHint && (
                    <div style={{ background: "var(--amber-dim)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "var(--amber)", lineHeight: 1.6 }}>{p.hint}</div>
                )}

                {showExplanation && globalSub && (
                    <div style={{ background: globalSub?.correct ? "var(--green-bg)" : "var(--red-bg)", border: `1px solid ${globalSub?.correct ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>{p.explanation}</p>
                    </div>
                )}

                <div style={{ display: "flex", width: "100%", marginTop: 24, alignItems: "center", flexWrap: "wrap", gap: "12px 0" }}>
                    <div style={{ flex: 1, minWidth: "max-content" }}>
                        {(activeIdx > 0) && (
                            <button onClick={navigatePrev} style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", color: "var(--text)", fontSize: 12, cursor: "pointer" }}>
                                ← Previous
                            </button>
                        )}
                    </div>
                    
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                        {globalSub && (
                            <button 
                                onClick={() => setShowExplanation(!showExplanation)} 
                                style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", color: "var(--text)", fontSize: 12, cursor: "pointer" }}
                            >
                                {showExplanation ? "Hide explanation" : "See explanation"}
                            </button>
                        )}
                        <button onClick={handleRedo} style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", color: "var(--text)", fontSize: 12, cursor: "pointer" }}>
                            Redo
                        </button>
                    </div>
                    
                    <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", minWidth: "max-content" }}>
                        {(activeIdx < problems.length - 1) && (
                            <button onClick={navigateNext} style={{ background: "var(--accent-dim)", border: "1px solid rgba(94,232,183,0.3)", borderRadius: 8, padding: "10px 16px", color: "var(--accent)", fontSize: 12, cursor: "pointer" }}>
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DailyBytePlayer() {
    return (
        <XpProvider>
            <PlayerInner />
        </XpProvider>
    );
}
