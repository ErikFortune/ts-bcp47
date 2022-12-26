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
import * as Subtags from './subtags';

import { LanguageTagParts, languageTagPartsToString } from './common';
import { Result, fail, succeed } from '@fgv/ts-utils';

export class WellFormedTag {
    public readonly parts: Readonly<LanguageTagParts>;

    protected constructor(init: Readonly<LanguageTagParts>) {
        this.parts = Object.freeze({ ...init });
    }

    public get tag(): string {
        return languageTagPartsToString(this.parts);
    }

    public static create(tag: string, iana: Iana.IanaRegistries): Result<WellFormedTag>;
    public static create(parts: LanguageTagParts, iana: Iana.IanaRegistries): Result<WellFormedTag>;
    public static create(tagOrParts: string | LanguageTagParts, iana: Iana.IanaRegistries): Result<WellFormedTag> {
        let parts = typeof tagOrParts === 'object' ? tagOrParts : undefined;

        if (parts === undefined) {
            const parsed = Parser.LanguageTagParser.parse(tagOrParts as string, iana);
            if (parsed.isFailure()) {
                return fail(`${tagOrParts}: malformed language tag ("${parsed.message}")`);
            }
            parts = parsed.value;
        }

        return this.ensureWellFormed(parts, iana).onSuccess((parts) => {
            return succeed(new WellFormedTag(parts));
        });
    }

    public static ensureWellFormed(parts: LanguageTagParts, iana: Iana.IanaRegistries): Result<LanguageTagParts> {
        if (parts.primaryLanguage) {
            if (!iana.subtags.languages.isWellFormed(parts.primaryLanguage)) {
                return fail(`${parts.primaryLanguage}: malformed primary language subtag.`);
            }
        } else if (!parts.grandfathered && !parts.privateUse) {
            return fail(`${languageTagPartsToString(parts)}: missing primary language subtag.`);
        }

        if (parts.extlangs) {
            if (parts.extlangs.length === 1) {
                if (!iana.subtags.extlangs.isWellFormed(parts.extlangs[0])) {
                    return fail(`${parts.extlangs[0]}: malformed extlang subtag.`);
                }
            } else if (parts.extlangs.length > 1) {
                return fail(`${languageTagPartsToString(parts)}: multiple extlang subtags not allowed.`);
            } else if (parts.extlangs.length === 0) {
                return fail(`${languageTagPartsToString(parts)}: empty extlangs array not allowed in LanguageTagParts.`);
            }
        }

        if (parts.script && !iana.subtags.scripts.isWellFormed(parts.script)) {
            return fail(`${parts.script}: malformed script subtag.`);
        }

        if (parts.region && !iana.subtags.regions.isWellFormed(parts.region)) {
            return fail(`${parts.region}: malformed region subtag.`);
        }

        if (parts.variants) {
            if (parts.variants.length === 0) {
                return fail(`${languageTagPartsToString(parts)}: empty variants array not allowed in LanguageTagParts.`);
            }

            for (const variant of parts.variants) {
                if (!iana.subtags.variants.isWellFormed(variant)) {
                    return fail(`${variant}: malformed variant subtag.`);
                }
            }
        }

        if (parts.extensions) {
            if (parts.extensions.length === 0) {
                return fail(`${languageTagPartsToString(parts)}: empty extensions array not allowed in LanguageTagParts.`);
            }

            for (const x of parts.extensions) {
                if (!Subtags.Validate.extensionSingleton.isWellFormed(x.singleton)) {
                    return fail(`${x.singleton}: malformed extension singleton.`);
                }
                if (!Subtags.Validate.extensionSubtag.isWellFormed(x.value)) {
                    return fail(`${x.value}: malformed extension subtag`);
                }
            }
        }

        if (parts.privateUse) {
            if (parts.privateUse.length === 0) {
                return fail(`${languageTagPartsToString(parts)}: empty private-use array not allowed in LanguageTagParts.`);
            }

            for (const p of parts.privateUse) {
                if (!Iana.LanguageSubtags.Validate.extendedLanguageRange.isWellFormed(p)) {
                    return fail(`${p}: malformed private-use subtag.`);
                }
            }
        }
        return succeed(parts);
    }

    public toString(): string {
        return this.tag;
    }
}
