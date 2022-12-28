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

import * as Iana from '../../iana';

import { LanguageTagParts, languageTagPartsToString } from '../common';
import { NormalizeTag, TagNormalization } from '../normalization';
import { Result, allSucceed, fail, mapResults, succeed } from '@fgv/ts-utils';

import { IsValidValidator } from './isValid';
import { TagValidity } from './common';

export class IsStrictlyValidValidator extends IsValidValidator {
    public validity: TagValidity = 'strictly-valid';
    public normalization: TagNormalization = 'unknown';

    protected _checkExtlangs(parts: LanguageTagParts): Result<Iana.LanguageSubtags.ExtLangSubtag[] | undefined> {
        if (parts.extlangs) {
            return super._checkExtlangs(parts).onSuccess(() => {
                return this._validateExtlangPrefix(parts);
            });
        }
        return succeed(undefined);
    }

    protected _checkVariants(parts: LanguageTagParts): Result<Iana.LanguageSubtags.VariantSubtag[] | undefined> {
        if (parts.variants) {
            return allSucceed(
                parts.variants.map((v) => this.iana.subtags.variants.verifyIsValid(v)),
                parts.variants
            ).onSuccess((v) => {
                return this._verifyUnique('variant subtag', v, (v) => v);
            });
        }
        return succeed(undefined);
    }

    protected _validateExtlangPrefix(parts: Readonly<LanguageTagParts>): Result<Iana.LanguageSubtags.ExtLangSubtag[] | undefined> {
        if (parts.extlangs) {
            const prefix = this.iana.subtags.languages.toCanonical(parts.primaryLanguage).getValueOrDefault();
            if (!prefix) {
                return fail('missing primary language for extlang prefix validation.');
            }

            return mapResults(
                parts.extlangs.map((extlang) => {
                    const def = this.iana.subtags.extlangs.tryGet(extlang);
                    // istanbul ignore next - should never happen due to guards earlier in conversion
                    if (!def) {
                        return fail(`invalid extlang subtag "${extlang}" (not registered).`);
                    }
                    if (prefix !== def.prefix) {
                        return fail(`invalid prefix "${prefix}" for extlang subtag ${extlang} (expected "${def.prefix}").`);
                    }
                    return succeed(extlang);
                })
            );
        }
        return succeed(undefined);
    }

    protected _validateVariantPrefix(
        parts: Readonly<LanguageTagParts>,
        variants: Iana.LanguageSubtags.VariantSubtag[]
    ): Result<Iana.LanguageSubtags.VariantSubtag[] | undefined> {
        const { primaryLanguage, extlangs, script, region } = parts;
        const nonCanonical = { primaryLanguage, extlangs, script, region };
        const canonical = NormalizeTag.processParts(nonCanonical, 'canonical');
        // istanbul ignore next - should be caught in the first pass
        if (canonical.isFailure()) {
            return fail(`failed to normalize variant prefix: ${canonical.message}`);
        }
        let prefix = languageTagPartsToString(canonical.value);

        return mapResults(
            variants.map((variant) => {
                const def = this.iana.subtags.variants.tryGet(variant);
                // istanbul ignore next - should be caught in the first pass
                if (!def) {
                    return fail(`invalid variant subtag "${variant}" (not registered).`);
                }

                // only fail if registration specifies prefixes but none are present
                if (def.prefix?.includes(prefix as Iana.LanguageSubtags.ExtendedLanguageRange) === false) {
                    return fail(`invalid prefix "${prefix}" for variant subtag ${variant} (expected "(${def.prefix.join(', ')})").`);
                }
                const canonicalVariant = this.iana.subtags.variants.toCanonical(variant).getValueOrDefault();
                prefix = `${prefix}-${canonicalVariant}`;
                return succeed(variant);
            })
        );
    }
}
