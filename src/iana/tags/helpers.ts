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

import { Result, fail, succeed } from '@fgv/ts-utils';

export const wellFormedTag = /^[A-Za-z][A-Za-z0-9-]+$/;

export function toCanonicalTag<T extends string>(val: unknown, what: string): Result<T> {
    if (typeof val === 'string' && wellFormedTag.test(val)) {
        const parts = val.split('-');
        const canonical: string[] = [];
        let isInitial = true;
        for (const part of parts) {
            if (isInitial || (part.length !== 2 && part.length !== 4)) {
                canonical.push(part.toLowerCase());
            } else if (part.length === 2) {
                canonical.push(part.toUpperCase());
            } else if (part.length === 4) {
                canonical.push(`${part[0].toUpperCase()}${part.slice(1).toLowerCase()}`);
            }
            isInitial = part.length === 1;
        }
        return succeed(canonical.join('-') as T);
    }
    return fail(`"${val}: not a well-formed ${what}`);
}

export function expandTagRange<TTAG extends string>(start: TTAG, end: TTAG | undefined): TTAG[] {
    if (end === undefined) {
        return [start];
    }
    return [start, end];
}
