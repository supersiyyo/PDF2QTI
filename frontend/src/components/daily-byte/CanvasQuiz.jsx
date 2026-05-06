import React, { useState } from "react";

export function CanvasQuiz({ problem, onComplete, submitted }) {
    const content = problem.content;
    const isMultiSelect = problem.type === "select_all";
    const [selectedIndices, setSelectedIndices] = useState(new Set());
    const [hasSubmittedLocal, setHasSubmittedLocal] = useState(false);

    const isAnswered = submitted || hasSubmittedLocal;

    const handleSelect = (index) => {
        if (isAnswered) return;
        
        const newSet = new Set(selectedIndices);
        if (isMultiSelect) {
            if (newSet.has(index)) newSet.delete(index);
            else newSet.add(index);
        } else {
            newSet.clear();
            newSet.add(index);
        }
        setSelectedIndices(newSet);
    };

    const handleSubmit = () => {
        if (isAnswered || selectedIndices.size === 0) return;
        
        setHasSubmittedLocal(true);
        const correctSet = new Set(content.correct_indices);
        
        let correctCount = 0;
        let incorrectCount = 0;
        
        selectedIndices.forEach(idx => {
            if (correctSet.has(idx)) correctCount++;
            else incorrectCount++;
        });

        // Penalize incorrect choices so they can't just select all options and get full points.
        const netCorrect = Math.max(0, correctCount - incorrectCount);
        onComplete(netCorrect, correctSet.size);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ color: "var(--text)", fontSize: "1.1rem", lineHeight: "1.5" }}>
                {content.question}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {content.options.map((option, index) => {
                    const isCorrect = content.correct_indices.includes(index);
                    const isSelected = selectedIndices.has(index);
                    
                    let bg = "var(--bg-input)";
                    let border = "var(--border)";
                    let color = "var(--text)";

                    if (isAnswered) {
                        if (isCorrect) {
                            bg = "var(--green-bg)";
                            border = "var(--green)";
                            color = "var(--green)";
                        } else if (isSelected) {
                            bg = "var(--red-bg)";
                            border = "var(--red)";
                            color = "var(--red)";
                        } else {
                            color = "var(--text-muted)";
                        }
                    } else if (isSelected) {
                        border = "var(--accent)";
                        bg = "rgba(94, 232, 183, 0.05)";
                    }

                    const inputType = isMultiSelect ? "checkbox" : "radio";

                    return (
                        <label
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1rem",
                                backgroundColor: bg,
                                border: `1px solid ${border}`,
                                borderRadius: "8px",
                                color: color,
                                cursor: isAnswered ? "default" : "pointer",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <input 
                                type={inputType} 
                                checked={isSelected}
                                onChange={() => handleSelect(index)}
                                disabled={isAnswered}
                                style={{
                                    width: "18px", height: "18px", accentColor: "var(--accent)", cursor: isAnswered ? "default" : "pointer"
                                }}
                            />
                            <span>{option}</span>
                        </label>
                    );
                })}
            </div>

            {!isAnswered && (
                <button 
                    onClick={handleSubmit} 
                    disabled={selectedIndices.size === 0}
                    style={{
                        padding: "0.75rem",
                        backgroundColor: selectedIndices.size > 0 ? "var(--accent)" : "var(--bg-input)",
                        color: selectedIndices.size > 0 ? "var(--bg-primary)" : "var(--text-muted)",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: selectedIndices.size > 0 ? "pointer" : "not-allowed",
                        marginTop: "1rem"
                    }}
                >
                    Submit Answer
                </button>
            )}
        </div>
    );
}
