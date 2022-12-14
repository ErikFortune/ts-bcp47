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

import { toCanonicalTag, wellFormedTag } from './helpers';

import { RedundantTag } from './common';
import { Result } from '@fgv/ts-utils';
import { TagOrSubtag } from './tagOrSubtag';

export class Redundant implements TagOrSubtag<'redundant', RedundantTag> {
    // just validating that there are no invalid characters present, not structure.
    public static readonly wellFormed = wellFormedTag;

    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    public readonly type: 'redundant' = 'redundant';
    public readonly isSubtag: boolean = false;

    public isWellFormed(val: unknown): val is RedundantTag {
        // not actually validating structure for redundant tags
        return typeof val === 'string' && Redundant.wellFormed.test(val);
    }

    public isCanonical(val: unknown): val is RedundantTag {
        const result = this.toCanonical(val);
        if (result.isSuccess()) {
            return result.value === val;
        }
        return false;
    }

    public toCanonical(val: unknown): Result<RedundantTag> {
        return toCanonicalTag(val, 'redundant tag');
    }
}
