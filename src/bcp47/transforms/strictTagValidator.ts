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

import { ExtLangSubtag, ExtendedLanguageRange, VariantSubtag } from '../../iana/language-subtags';
import { LanguageTagParts, languageTagPartsToString } from '../common';
import { Result, fail, mapResults, succeed } from '@fgv/ts-utils';
import { TagNormalization, TagValidity } from '../status';
import { CanonicalNormalizer } from './canonicalNormalizer';
import { TagValidator } from './tagValidator';

export class StrictTagValidator extends TagValidator {
    public readonly validity: TagValidity = 'strictly-valid';
    public readonly normalization: TagNormalization = 'unknown';

    protected _processExtlangs(parts: LanguageTagParts): Result<ExtLangSubtag[] | undefined> {
        return super._processExtlangs(parts).onSuccess((extlangs) => {
            return this._validateExtlangPrefix(parts, extlangs);
        });
    }

    protected _processVariants(parts: LanguageTagParts): Result<VariantSubtag[] | undefined> {
        if (parts.variants) {
            return super._processVariants(parts).onSuccess((variants) => {
                return this._validateVariantPrefix(parts, variants);
            });
        }
        return succeed(undefined);
    }

    protected _validateExtlangPrefix(
        parts: Readonly<LanguageTagParts>,
        extlangs: ExtLangSubtag[] | undefined
    ): Result<ExtLangSubtag[] | undefined> {
        if (extlangs) {
            const prefix = this.iana.subtags.languages.toCanonical(parts.primaryLanguage).getValueOrDefault();
            if (!prefix) {
                return fail('missing primary language for extlang prefix validation.');
            }

            return mapResults(
                extlangs.map((extlang) => {
                    const def = this.iana.subtags.extlangs.tryGet(extlang);
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
        variants: VariantSubtag[] | undefined
    ): Result<VariantSubtag[] | undefined> {
        if (variants) {
            const { primaryLanguage, extlangs, script, region } = parts;
            const nonCanonical = { primaryLanguage, extlangs, script, region };
            const canonical = new CanonicalNormalizer(this.iana).processParts(nonCanonical);
            if (canonical.isFailure()) {
                return fail(`failed to normalize variant prefix: ${canonical.message}`);
            }
            let prefix = languageTagPartsToString(canonical.value);

            return mapResults(
                variants.map((variant) => {
                    const def = this.iana.subtags.variants.tryGet(variant);
                    if (!def) {
                        return fail(`invalid variant subtag "${variant}" (not registered).`);
                    }

                    // only fail if registration specifies prefixes but none are present
                    if (def.prefix?.includes(prefix as ExtendedLanguageRange) === false) {
                        return fail(`invalid prefix "${prefix}" for variant subtag ${variant} (expected "(${def.prefix.join(', ')})").`);
                    }
                    const canonicalVariant = this.iana.subtags.variants.toCanonical(variant).getValueOrDefault();
                    prefix = `${prefix}-${canonicalVariant}`;
                    return succeed(variant);
                })
            );
        }
        return succeed(undefined);
    }
}
