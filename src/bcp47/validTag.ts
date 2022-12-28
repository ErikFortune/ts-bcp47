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

import * as Iana from '../iana';
import * as Parser from './languageTagParser';

import { LanguageTagParts, languageTagPartsToString } from './common';
import { Result, captureResult, fail, succeed } from '@fgv/ts-utils';

import { ExtendedLanguageRange } from '../iana/language-subtags';
import { NormalizeTag } from './normalization';
import { ValidateTag } from './validation';

export class ValidTag {
    public readonly parts: Readonly<LanguageTagParts>;

    protected constructor(init: Readonly<LanguageTagParts>) {
        this.parts = Object.freeze({ ...init });
    }

    public get tag(): string {
        return languageTagPartsToString(this.parts);
    }

    public static create(tag: string, iana: Iana.LanguageRegistries): Result<ValidTag>;
    public static create(parts: LanguageTagParts, iana: Iana.LanguageRegistries): Result<ValidTag>;
    public static create(tagOrParts: string | LanguageTagParts, iana: Iana.LanguageRegistries): Result<ValidTag> {
        return captureResult(() => {
            const parts: LanguageTagParts =
                typeof tagOrParts === 'string' ? Parser.LanguageTagParser.parse(tagOrParts, iana).getValueOrThrow() : tagOrParts;

            ValidateTag.checkParts(parts, 'valid').getValueOrThrow();
            const normalized = NormalizeTag.processParts(parts, 'canonical').getValueOrThrow();
            return new ValidTag(normalized);
        });
    }

    public static validateExtlangPrefix(parts: Readonly<LanguageTagParts>, iana: Iana.LanguageRegistries): Result<true> {
        if (parts.extlangs) {
            const prefix = parts.primaryLanguage;
            if (!prefix) {
                return fail('missing primary language for extlang prefix validation.');
            }

            if (parts.extlangs.length > 1) {
                return fail('multiple extlang subtags not allowed');
            }

            for (const extlang of parts.extlangs) {
                const def = iana.subtags.extlangs.tryGetCanonical(extlang);
                if (!def) {
                    return fail(`invalid extlang subtag "${extlang}" (not registered).`);
                }
                if (prefix !== def.prefix) {
                    return fail(`invalid prefix "${prefix}" for extlang subtag ${extlang} (expected "${def.prefix}").`);
                }
            }
        }
        return succeed(true);
    }

    public static validateVariantPrefix(parts: Readonly<LanguageTagParts>, iana: Iana.LanguageRegistries): Result<true> {
        if (parts.variants) {
            const { primaryLanguage, extlangs, script, region } = parts;
            let prefix = languageTagPartsToString({ primaryLanguage, extlangs, script, region });

            for (const variant of parts.variants) {
                const def = iana.subtags.variants.tryGetCanonical(variant);
                if (!def) {
                    return fail(`invalid variant subtag "${variant}" (not registered).`);
                }

                // only fail if registration specifies prefixes but none are present
                if (def.prefix?.includes(prefix as ExtendedLanguageRange) === false) {
                    return fail(`invalid prefix "${prefix}" for variant subtag ${variant} (expected "(${def.prefix.join(', ')})").`);
                }
                prefix = `${prefix}-${variant}`;
            }
        }
        return succeed(true);
    }

    public toString(): string {
        return this.tag;
    }
}
