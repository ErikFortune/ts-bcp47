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

import { ScriptSubtag } from '../common';
import { TagOrSubtag } from './tagOrSubtag';

export class Script implements TagOrSubtag<'script', ScriptSubtag> {
    // script is 4ALPHA, canonical is initial caps
    public static readonly wellFormed = /^[A-Za-z]{4}$/;
    public static readonly canonical = /^[A-Z][a-z]{3}$/;

    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    public readonly type: 'script' = 'script';
    public readonly isSubtag: boolean = true;

    public isWellFormed(val: unknown): val is ScriptSubtag {
        // script tag is 4ALPHA
        return typeof val === 'string' && Script.wellFormed.test(val);
    }

    public isCanonical(val: unknown): val is ScriptSubtag {
        // canonical form is initial caps
        return typeof val === 'string' && Script.canonical.test(val);
    }

    public toCanonical(val: unknown): Result<ScriptSubtag> {
        if (this.isCanonical(val)) {
            return succeed(val);
        } else if (this.isWellFormed(val)) {
            return succeed(`${val[0].toUpperCase}${val.slice(1).toLowerCase()}` as ScriptSubtag);
        }
        return fail(`"${val}: not a well-formed script subtag`);
    }
}
