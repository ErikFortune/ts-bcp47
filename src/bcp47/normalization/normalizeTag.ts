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
import { TagNormalization, compareNormalization } from '../status';

import { CanonicalNormalizer } from './canonicalNormalizer';
import { LanguageTagParts } from '../common';
import { PreferredNormalizer } from './preferredTagNormalizer';
import { TagNormalizer } from './baseNormalizer';

export class NormalizeTag {
    protected static _normalizers: Record<TagNormalization, TagNormalizer | undefined> | undefined = undefined;

    public static toCanonical(parts: LanguageTagParts) {
        return this.processParts(parts, 'canonical');
    }

    public static toPreferred(parts: LanguageTagParts) {
        return this.processParts(parts, 'preferred');
    }

    public static chooseNormalizer(wantNormalization: TagNormalization, haveNormalization?: TagNormalization): TagNormalizer | undefined {
        if (haveNormalization && compareNormalization(haveNormalization, wantNormalization) > 0) {
            return undefined;
        }

        if (!this._normalizers) {
            this._normalizers = {
                unknown: undefined,
                none: undefined,
                canonical: new CanonicalNormalizer(),
                preferred: new PreferredNormalizer(),
            };
        }
        return this._normalizers![wantNormalization];
    }

    public static processParts(
        parts: LanguageTagParts,
        wantNormalization: TagNormalization,
        haveNormalization?: TagNormalization
    ): Result<LanguageTagParts> {
        const normalizer = this.chooseNormalizer(wantNormalization, haveNormalization);
        return normalizer?.processParts(parts) ?? succeed(parts);
    }
}
