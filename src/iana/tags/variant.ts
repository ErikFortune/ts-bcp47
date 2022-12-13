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

import { TagOrSubtag } from './tagOrSubtag';
import { VariantSubtag } from '../model';

export class Variant implements TagOrSubtag<'variant', VariantSubtag> {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    public readonly type: 'variant' = 'variant';
    public readonly isSubtag: boolean = true;

    public isWellFormed(val: unknown): val is VariantSubtag {
        // variant is: 5*8alphanum or (DIGIT 3alphanum)
        return typeof val === 'string' && (/^[A-Za-z][A-Za-z0-9]{4,7}$/.test(val) || /^[0-9][A-Za-z0-9]{3,7}$/.test(val));
    }

    public isCanonical(val: unknown): val is VariantSubtag {
        // canonical form is lower case
        return typeof val === 'string' && (/^[a-z][a-z0-9]{4,7}$/.test(val) || /^[0-9][a-z0-9]{3,7}$/.test(val));
    }

    public toCanonical(val: unknown): Result<VariantSubtag> {
        if (this.isCanonical(val)) {
            return succeed(val);
        } else if (this.isWellFormed(val)) {
            return succeed(`${val[0].toUpperCase}${val.slice(1).toLowerCase()}` as VariantSubtag);
        }
        return fail(`"${val}: not a well-formed variant subtag`);
    }
}
