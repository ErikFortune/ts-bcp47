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

import { Result, succeed } from '@fgv/ts-utils';

import { GrandfatheredTag } from '../model';
import { TagOrSubtag } from './tagOrSubtag';

export class Grandfathered implements TagOrSubtag<'grandfathered', GrandfatheredTag> {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    public readonly type: 'grandfathered' = 'grandfathered';
    public readonly isSubtag: boolean = false;

    public isWellFormed(val: unknown): val is GrandfatheredTag {
        // not actually validating structure for grandfathered tags
        return typeof val === 'string' && /^[A-Za-z][A-Za-z0-9-]+$/.test(val);
    }

    public isCanonical(val: unknown): val is GrandfatheredTag {
        const result = this.toCanonical(val);
        if (result.isSuccess()) {
            return result.value === val;
        }
        return false;
    }

    public toCanonical(val: unknown): Result<GrandfatheredTag> {
        if (typeof val === 'string') {
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
            return succeed(canonical.join('-') as GrandfatheredTag);
        }
        return fail(`"${val}: not a well-formed grandfathered tag`);
    }
}
