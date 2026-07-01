export class ConfidenceScorer {
    score(completeness, hasFullDetail, writeAction, ambiguities) {
        const reasons = [];
        let level = 'MEDIUM';
        let score = completeness.completeness_score;
        if (hasFullDetail && completeness.completeness_score >= 0.98 && ambiguities === 0) {
            level = 'CERTAIN';
            reasons.push('unique id + full detail payload + all refs hydrated');
            score = Math.max(score, 0.99);
        }
        else if (hasFullDetail && completeness.completeness_score >= 0.9) {
            level = 'HIGH';
            reasons.push('high completeness, full detail retrieved');
        }
        else if (completeness.completeness_score >= 0.75) {
            level = 'MEDIUM';
            reasons.push('likely candidate + partial hydration');
        }
        else {
            level = 'LOW';
            reasons.push('multiple candidates or incomplete payload');
        }
        if (writeAction) {
            // Never CERTAIN for writes without extra confirmation already handled upstream
            if (level === 'CERTAIN')
                level = 'HIGH';
            reasons.push('write action requires explicit confirmation');
        }
        if (completeness.blocked_reference_count > 0 || ambiguities > 0) {
            level = level === 'CERTAIN' ? 'HIGH' : 'MEDIUM';
            reasons.push(`${completeness.blocked_reference_count} refs blocked`);
        }
        if (completeness.completeness_score < 0.6) {
            level = 'LOW';
        }
        return { level, score, reasons, criteria_met: reasons };
    }
}
//# sourceMappingURL=confidence-scorer.js.map