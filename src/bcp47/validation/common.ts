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

export type TagValidity = 'unknown' | 'well-formed' | 'valid' | 'strictly-valid';

const validityRank: Record<TagValidity, number> = {
    /* eslint-disable @typescript-eslint/naming-convention */
    unknown: 0,
    'well-formed': 500,
    valid: 900,
    'strictly-valid': 1000,
    /* eslint-enable @typescript-eslint/naming-convention */
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
