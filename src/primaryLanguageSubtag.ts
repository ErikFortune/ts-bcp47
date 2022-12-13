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

import { Brand, Result, fail, succeed } from '@fgv/ts-utils';
import { SubtagHelper } from './subtagHelper';

export type PrimaryLanguageSubtag = Brand<string, 'PrimaryLanguageSubtag'>;

export class PrimaryLanguageSubtagHelper implements SubtagHelper<PrimaryLanguageSubtag> {
    protected static _subtags?: PrimaryLanguageSubtag[] = undefined;

    isWellFormed(from: unknown): from is PrimaryLanguageSubtag {
        return typeof from === 'string' && /^[A-Za-z]{2,3}$/.test(from);
    }
    isValid(from: unknown): from is PrimaryLanguageSubtag {
        return this.isWellFormed(from);
    }
    isNormalized(from: unknown): from is PrimaryLanguageSubtag {
        return this.isWellFormed(from) && this.normalize(from).getValueOrDefault() === from;
    }
    normalize(from: unknown): Result<PrimaryLanguageSubtag> {
        if (this.isWellFormed(from)) {
            return succeed(from.toLowerCase() as PrimaryLanguageSubtag);
        }
        return fail(`${from} is not a well-formed primary language subtag`);
    }
    getRegisteredSubtags(): PrimaryLanguageSubtag[] {
        if (PrimaryLanguageSubtagHelper._subtags === undefined) {
            throw new Error('yuck');
        }
        return PrimaryLanguageSubtagHelper._subtags;
    }
}
