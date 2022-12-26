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

import { LanguageSubtag, RegionSubtag, ScriptSubtag } from '../iana/language-subtags';
import { LanguageTagParts, languageTagPartsToString } from './common';
import { Result, captureResult, fail, populateObject, succeed } from '@fgv/ts-utils';

import { ValidTag } from './validTag';

export class PreferredTag {
    public readonly tag: string;
    public readonly from: ValidTag;
    public readonly parts: LanguageTagParts;

    protected constructor(from: ValidTag, iana: Iana.IanaRegistries) {
        this.from = from;

        const tag = from.tag;
        const parts = this._applyPreferredValues(tag, from.parts, iana).getValueOrThrow();

        this.parts = Object.freeze(parts);
        this.tag = languageTagPartsToString(this.parts);
    }

    public static create(tag: string, iana: Iana.IanaRegistries): Result<PreferredTag>;
    public static create(from: ValidTag, iana: Iana.IanaRegistries): Result<PreferredTag>;
    public static create(from: string | ValidTag, iana: Iana.IanaRegistries): Result<PreferredTag> {
        let valid: ValidTag | undefined;

        if (typeof from === 'string') {
            const validated = ValidTag.create(from, iana);
            if (validated.isFailure()) {
                return fail(`invalid language tag "${from}": ${validated.message}`);
            }
            valid = validated.value;
        } else {
            valid = from;
        }

        return captureResult(() => {
            return new PreferredTag(valid!, iana);
        });
    }

    public toString(): string {
        return this.tag;
    }

    protected _applyPreferredValues(tag: string, parts: LanguageTagParts, iana: Iana.IanaRegistries): Result<LanguageTagParts> {
        const grandfathered = this._checkGrandfathered(parts, iana);
        if (grandfathered.isFailure() || grandfathered.value !== undefined) {
            return grandfathered as Result<LanguageTagParts>;
        }

        const redundant = this._checkRedundant(tag, iana);
        if (redundant.isFailure() || redundant.value !== undefined) {
            return redundant as Result<LanguageTagParts>;
        }

        const preferred = populateObject<LanguageTagParts>(
            {
                primaryLanguage: () => this._checkLanguage(parts.primaryLanguage, iana),
                extlangs: () => succeed(parts.extlangs),
                script: () => this._checkScript(parts, iana),
                region: () => this._checkRegion(parts.region, iana),
                variants: () => succeed(parts.variants),
                extensions: () => succeed(parts.extensions),
                privateUse: () => succeed(parts.privateUse),
            },
            { suppressUndefined: true }
        );

        return preferred;
    }

    protected _checkLanguage(from: LanguageSubtag | undefined, iana: Iana.IanaRegistries): Result<LanguageSubtag | undefined> {
        if (from) {
            const language = iana.subtags.languages.tryGet(from);
            // istanbul ignore next - internal error difficult to test
            if (!language) {
                return fail(`invalid language subtag "${from}.`);
            }
            return succeed(language.preferredValue ?? from);
        }
        return succeed(undefined);
    }

    protected _checkScript(parts: LanguageTagParts, iana: Iana.IanaRegistries): Result<ScriptSubtag | undefined> {
        if (parts.primaryLanguage && parts.script) {
            const language = iana.subtags.languages.tryGet(parts.primaryLanguage);
            // istanbul ignore next - internal error difficult to test
            if (!language) {
                return fail(`invalid primary language subtag "${parts.primaryLanguage}.`);
            }
            if (language.suppressScript !== parts.script) {
                return succeed(parts.script);
            }
        }
        return succeed(undefined);
    }

    protected _checkRegion(from: RegionSubtag | undefined, iana: Iana.IanaRegistries): Result<RegionSubtag | undefined> {
        if (from) {
            const region = iana.subtags.regions.tryGet(from);
            // istanbul ignore next - internal error difficult to test
            if (!region) {
                return fail(`invalid region subtag "${from}.`);
            }
            return succeed(region.preferredValue ?? from);
        }
        return succeed(undefined);
    }

    protected _checkGrandfathered(parts: LanguageTagParts, iana: Iana.IanaRegistries): Result<LanguageTagParts | undefined> {
        if (parts.grandfathered) {
            const grandfathered = iana.subtags.grandfathered.tryGet(parts.grandfathered);
            // istanbul ignore next - internal error hard to test
            if (!grandfathered) {
                return fail(`invalid grandfathered tag "${parts.grandfathered}"`);
            }
            if (grandfathered.preferredValue) {
                const preferred = ValidTag.create(grandfathered.preferredValue, iana);
                // istanbul ignore next - internal error hard to test
                if (preferred.isFailure()) {
                    return fail(
                        `grandfathered tag "${parts.grandfathered}" has invalid preferred value "${grandfathered.preferredValue}: ${preferred.message}.`
                    );
                }
                return succeed(preferred.value.parts);
            }
        }
        return succeed(undefined);
    }

    protected _checkRedundant(tag: string, iana: Iana.IanaRegistries): Result<LanguageTagParts | undefined> {
        const redundant = iana.subtags.redundant.tryGet(tag);
        if (redundant?.preferredValue !== undefined) {
            const preferred = ValidTag.create(redundant.preferredValue, iana);
            // istanbul ignore next - internal error hard to test
            if (preferred.isFailure()) {
                return fail(`redundant tag "${tag}" has invalid preferred value "${redundant.preferredValue}: ${preferred.message}.`);
            }
            return succeed(preferred.value.parts);
        }
        return succeed(undefined);
    }
}
