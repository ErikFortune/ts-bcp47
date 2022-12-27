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
import * as Subtags from './subtags';

import { ExtLangSubtag, ExtendedLanguageRange, LanguageSubtag, RegionSubtag, ScriptSubtag, VariantSubtag } from '../iana/language-subtags';
import { ExtensionSubtagValue, LanguageTagParts, languageTagPartsToString } from './common';
import { Result, allSucceed, captureResult, fail, mapResults, populateObject, succeed } from '@fgv/ts-utils';

import { ExtensionSingleton } from './subtags/model';
import { ValidTag } from './validTag';

export class CanonicalTag {
    public readonly tag: string;
    public readonly from: ValidTag;
    public readonly parts: LanguageTagParts;

    protected constructor(from: ValidTag, iana: Iana.LanguageRegistries) {
        this.from = from;

        const tag = from.tag;
        const parts = this._normalize(tag, from.parts, iana).getValueOrThrow();

        this.parts = Object.freeze(parts);
        this.tag = languageTagPartsToString(this.parts);
    }

    public static create(tag: string, iana: Iana.LanguageRegistries): Result<CanonicalTag>;
    public static create(from: ValidTag, iana: Iana.LanguageRegistries): Result<CanonicalTag>;
    public static create(from: string | ValidTag, iana: Iana.LanguageRegistries): Result<CanonicalTag> {
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
            return new CanonicalTag(valid!, iana);
        });
    }

    public toString(): string {
        return this.tag;
    }

    protected _normalize(tag: string, parts: LanguageTagParts, iana: Iana.LanguageRegistries): Result<LanguageTagParts> {
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
                primaryLanguage: () => this._normalizeLanguage(parts.primaryLanguage, iana),
                extlangs: () => this._normalizeExtlangs(parts.extlangs, iana),
                script: () => this._normalizeScript(parts, iana),
                region: () => this._normalizeRegion(parts.region, iana),
                variants: () => this._normalizeVariants(parts.variants, iana),
                extensions: () => this._normalizeExtensions(parts.extensions, iana),
                privateUse: () => this._normalizePrivateUseTags(parts.privateUse, iana),
            },
            { suppressUndefined: true }
        );

        return preferred;
    }

    protected _normalizeLanguage(from: LanguageSubtag | undefined, iana: Iana.LanguageRegistries): Result<LanguageSubtag | undefined> {
        if (from) {
            const language = iana.subtags.languages.tryGet(from);
            // istanbul ignore next - internal error difficult to test
            if (!language) {
                return fail(`invalid language subtag "${from}.`);
            }
            return succeed(language.preferredValue ?? language.subtag);
        }
        return succeed(undefined);
    }

    protected _normalizeExtlangs(from: ExtLangSubtag[] | undefined, iana: Iana.LanguageRegistries): Result<ExtLangSubtag[] | undefined> {
        if (from) {
            if (from.length > 1) {
                return fail('empty extlang subtag array');
            } else if (from.length > 1) {
                return fail('multiple extlang subtags');
            }
            return mapResults(from.map((extlang) => iana.subtags.extlangs.toValidCanonical(extlang)));
        }
        return succeed(undefined);
    }

    protected _normalizeScript(parts: LanguageTagParts, iana: Iana.LanguageRegistries): Result<ScriptSubtag | undefined> {
        if (parts.primaryLanguage && parts.script) {
            const language = iana.subtags.languages.tryGet(parts.primaryLanguage);
            // istanbul ignore next - internal error difficult to test
            if (!language) {
                return fail(`invalid primary language subtag "${parts.primaryLanguage}.`);
            }

            const script = iana.subtags.scripts.toValidCanonical(parts.script).getValueOrDefault();
            if (!script) {
                return fail(`invalid script subtag "${parts.script}`);
            }

            if (language.suppressScript !== script) {
                return succeed(script);
            }
        }
        return succeed(undefined);
    }

    protected _normalizeRegion(from: RegionSubtag | undefined, iana: Iana.LanguageRegistries): Result<RegionSubtag | undefined> {
        if (from) {
            const region = iana.subtags.regions.tryGet(from);
            // istanbul ignore next - internal error difficult to test
            if (!region) {
                return fail(`invalid region subtag "${from}.`);
            }
            return succeed(region.preferredValue ?? region.subtag);
        }
        return succeed(undefined);
    }

    protected _normalizeVariants(from: VariantSubtag[] | undefined, iana: Iana.LanguageRegistries): Result<VariantSubtag[] | undefined> {
        if (from) {
            const results: Result<unknown>[] = [];
            const present = new Set<VariantSubtag>();
            const canonical: VariantSubtag[] = [];

            for (const original of from) {
                results.push(
                    iana.subtags.variants.toValidCanonical(original).onSuccess((variant) => {
                        if (present.has(variant)) {
                            return fail(`duplicate variant subtag "${variant}"`);
                        }
                        present.add(variant);
                        canonical.push(variant);
                        return succeed(variant);
                    })
                );
            }

            if (canonical.length < 1) {
                results.push(fail('empty variants array'));
            }

            return allSucceed(results, canonical);
        }
        return succeed(undefined);
    }

    protected _normalizeExtensions(
        from: ExtensionSubtagValue[] | undefined,
        iana: Iana.LanguageRegistries
    ): Result<ExtensionSubtagValue[] | undefined> {
        if (from) {
            const results: Result<unknown>[] = [];
            const present = new Set<ExtensionSingleton>();
            const canonical: ExtensionSubtagValue[] = [];

            for (const original of from) {
                results.push(
                    iana.extensions.extensions.toValidCanonical(original.singleton).onSuccess((singleton) => {
                        if (present.has(singleton)) {
                            return fail(`duplicate extension subtag "${singleton}"`);
                        }
                        present.add(singleton);
                        Subtags.Validate.extensionSubtag.toCanonical(original.value).onSuccess((value) => {
                            canonical.push({ singleton, value });
                            return succeed(true);
                        });
                        return succeed(true);
                    })
                );
            }

            if (canonical.length < 1) {
                results.push(fail('empty extensions array'));
            }

            return allSucceed(results, canonical);
        }
        return succeed(undefined);
    }

    protected _normalizePrivateUseTags(
        from: ExtendedLanguageRange[] | undefined,
        _iana: Iana.LanguageRegistries
    ): Result<ExtendedLanguageRange[] | undefined> {
        if (from) {
            const results: Result<unknown>[] = [];
            const canonical: ExtendedLanguageRange[] = [];

            for (const original of from) {
                results.push(
                    Iana.LanguageSubtags.Validate.extendedLanguageRange.toCanonical(original).onSuccess((value) => {
                        canonical.push(value);
                        return succeed(value);
                    })
                );
            }

            if (canonical.length < 1) {
                results.push(fail('empty private-use array'));
            }

            return allSucceed(results, canonical);
        }
        return succeed(undefined);
    }

    protected _checkGrandfathered(parts: LanguageTagParts, iana: Iana.LanguageRegistries): Result<LanguageTagParts | undefined> {
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

    protected _checkRedundant(tag: string, iana: Iana.LanguageRegistries): Result<LanguageTagParts | undefined> {
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
