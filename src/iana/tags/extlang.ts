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

import { ExtLangSubtag } from '../common';
import { TagOrSubtag } from './tagOrSubtag';

export class ExtLang implements TagOrSubtag<'extlang', ExtLangSubtag> {
    // extlang is 3ALPHA, canonical is lower case
    public static readonly wellFormed = /^[A-Za-z]{3}$/;
    public static readonly canonical = /^[a-z]{3}$/;

    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    public readonly type: 'extlang' = 'extlang';
    public readonly isSubtag: boolean = true;

    public isWellFormed(val: unknown): val is ExtLangSubtag {
        return typeof val === 'string' && ExtLang.wellFormed.test(val);
    }

    public isCanonical(val: unknown): val is ExtLangSubtag {
        return typeof val === 'string' && ExtLang.canonical.test(val);
    }

    public toCanonical(val: unknown): Result<ExtLangSubtag> {
        if (this.isWellFormed(val)) {
            // canonical form is lower case
            return succeed(val.toLowerCase() as ExtLangSubtag);
        }
        return fail(`"${val}: not a well-formed extlang subtag`);
    }
}
