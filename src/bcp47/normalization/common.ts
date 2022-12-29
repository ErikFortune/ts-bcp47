/*
 * Copyright (c) 2022 Erik Fortune
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export type TagNormalization = 'unknown' | 'none' | 'canonical' | 'preferred';

const normalizationRank: Record<TagNormalization, number> = {
    unknown: 0,
    none: 100,
    canonical: 900,
    preferred: 1000,
};

export function compareNormalization(n1: TagNormalization, n2: TagNormalization): -1 | 0 | 1 {
    if (normalizationRank[n1] > normalizationRank[n2]) {
        return 1;
    } else if (normalizationRank[n1] < normalizationRank[n2]) {
        return -1;
    }
    return 0;
}

export function mostNormalized(n1: TagNormalization, n2: TagNormalization): TagNormalization {
    // istanbul ignore next - hard to hit due to guards
    return normalizationRank[n1] > normalizationRank[n2] ? n1 : n2;
}
