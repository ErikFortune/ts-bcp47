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
import { TagNormalization, compareNormalization } from './common';

import { CanonicalNormalizer } from './canonicalNormalizer';
import { LanguageTagParts } from '../common';
import { PreferredNormalizer } from './preferredTagNormalizer';
import { TagNormalizer } from './baseNormalizer';

/**
 * Normalization helpers for BCP-47 language tags.
 * @public
 */
export class NormalizeTag {
    /**
     * @internal
     */
    private static _normalizers: Record<TagNormalization, TagNormalizer | undefined> | undefined = undefined;

    /**
     * Converts a BCP-47 language tag to canonical form.  Canonical form uses the recommended capitalization rules
     * specified in {@link https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1.1 | RFC 5646} but are not
     * otherwise modified.
     *
     * @param parts - The individual {@Link Bcp47.LanguageTagParts | language tag parts} to be normalized.
     * @returns `Success` with the normalized equivalent {@link Bcp47.LanguageTagParts | language tag parts},
     * or `Failure` with details if an error occurs.
     */
    public static toCanonical(parts: LanguageTagParts): Result<LanguageTagParts> {
        return this.processParts(parts, 'canonical');
    }

    /**
     * Converts a BCP-47 language tag to preferred form.  Preferred form uses the recommended capitalization rules
     * specified in {@link https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1.1 | RFC 5646} and also
     * applies additional specified in the 
     * {@link https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry | language subtag registry}:
     * - extraneous (suppressed) script tags are removed.
     * - deprecated language, extlang, script or region tags are replaced with up-to-date preferred values.
     * - grandfathered or redundant tags with a defined preferred-value are replaced in their entirety with
     * the new preferred value.
     * @param parts - The individual {@Link Bcp47.LanguageTagParts | language tag parts} to be normalized.
     * @returns `Success` with the normalized equivalent {@link Bcp47.LanguageTagParts | language tag parts},
     * or `Failure` with details if an error occurs.
     */
    public static toPreferred(parts: LanguageTagParts): Result<LanguageTagParts> {
        return this.processParts(parts, 'preferred');
    }

    public static chooseNormalizer(wantNormalization: TagNormalization, haveNormalization?: TagNormalization): TagNormalizer | undefined {
        if (haveNormalization && compareNormalization(haveNormalization, wantNormalization) >= 0) {
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
