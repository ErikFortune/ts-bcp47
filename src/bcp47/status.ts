export type TagValidity = 'unknown' | 'well-formed' | 'valid' | 'strictly-valid';
export type TagNormalization = 'unknown' | 'none' | 'canonical' | 'preferred';
export interface TagStatus {
    validity: TagValidity;
    normalization: TagNormalization;
}

const validityRank: Record<TagValidity, number> = {
    /* eslint-disable @typescript-eslint/naming-convention */
    unknown: 0,
    'well-formed': 500,
    valid: 900,
    'strictly-valid': 1000,
    /* eslint-enable @typescript-eslint/naming-convention */
};

const normalizationRank: Record<TagNormalization, number> = {
    unknown: 0,
    none: 100,
    canonical: 900,
    preferred: 1000,
};

export function compareValidity(v1: TagValidity, v2: TagValidity): -1 | 0 | 1 {
    if (validityRank[v1] > validityRank[v2]) {
        return 1;
    } else if (validityRank[v1] < validityRank[v2]) {
        return -1;
    }
    return 0;
}

export function mostValid(v1: TagValidity, v2: TagValidity): TagValidity {
    return validityRank[v1] >= validityRank[v2] ? v1 : v2;
}

export function compareNormalization(n1: TagNormalization, n2: TagNormalization): -1 | 0 | 1 {
    if (normalizationRank[n1] > normalizationRank[n2]) {
        return 1;
    } else if (normalizationRank[n1] < normalizationRank[n2]) {
        return -1;
    }
    return 0;
}

export function mostNormalized(n1: TagNormalization, n2: TagNormalization): TagNormalization {
    return normalizationRank[n1] >= normalizationRank[n2] ? n1 : n2;
}
