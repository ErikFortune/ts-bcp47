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

import { ExtendedLanguageRange, VariantSubtag } from '../iana/language-subtags';
import { LanguageTagParts, languageTagPartsToString } from './common';
import { Result, allSucceed, captureResult, fail, succeed } from '@fgv/ts-utils';
import { ExtensionSingleton } from './subtags/model';

export class ValidTag {
    public readonly parts: Readonly<LanguageTagParts>;

    protected constructor(init: Readonly<LanguageTagParts>, registry: Iana.IanaRegistries) {
        this.parts = Object.freeze(ValidTag.validateParts(init, registry).getValueOrThrow());
    }

    public get tag(): string {
        return languageTagPartsToString(this.parts);
    }

    public static create(tag: string, registry: Iana.IanaRegistries): Result<ValidTag>;
    public static create(parts: LanguageTagParts, registry: Iana.IanaRegistries): Result<ValidTag>;
    public static create(tagOrParts: string | LanguageTagParts, registry: Iana.IanaRegistries): Result<ValidTag> {
        return captureResult(() => {
            const parts =
                typeof tagOrParts === 'string' ? Parser.LanguageTagParser.parse(tagOrParts, registry).getValueOrThrow() : tagOrParts;
            return new ValidTag(parts, registry);
        });
    }

    public static validateExtlangPrefix(parts: Readonly<LanguageTagParts>, iana: Iana.IanaRegistries): Result<true> {
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

    public static validateVariantPrefix(parts: Readonly<LanguageTagParts>, iana: Iana.IanaRegistries): Result<true> {
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

    public static validateParts(parts: Readonly<LanguageTagParts>, iana: Iana.IanaRegistries): Result<LanguageTagParts> {
        const results: Result<unknown>[] = [];
        const validated: LanguageTagParts = {};

        if (parts.grandfathered) {
            // see if this is a grandfathered tag
            const grandfathered = iana.subtags.grandfathered.tryGet(parts.grandfathered);
            if (grandfathered) {
                validated.grandfathered = grandfathered.tag;
                return succeed(validated);
            }
            results.push(fail(`${parts.grandfathered}: invalid grandfathered tag`));
        }

        if (parts.primaryLanguage !== undefined) {
            results.push(
                iana.subtags.languages.toValidCanonical(parts.primaryLanguage).onSuccess((lang) => {
                    validated.primaryLanguage = lang;
                    return succeed(lang);
                })
            );
        }

        if (parts.primaryLanguage === undefined) {
            const tag = languageTagPartsToString(parts);

            // primary language must be defined except for
            // a fully private tag
            if (parts.privateUse === undefined || parts.privateUse.length < 1) {
                results.push(fail(`${tag}: missing primary language`));
            }
        }

        if (parts.extlangs !== undefined) {
            validated.extlangs = [];
            for (const extlang of parts.extlangs) {
                results.push(
                    iana.subtags.extlangs.toValidCanonical(extlang).onSuccess((lang) => {
                        validated.extlangs!.push(lang);
                        return succeed(lang);
                    })
                );
            }
            if (parts.extlangs.length > 1) {
                return fail('multiple extlang subtags not allowed');
            }
        }

        if (parts.script !== undefined) {
            results.push(
                iana.subtags.scripts.toValidCanonical(parts.script).onSuccess((script) => {
                    validated.script = script;
                    return succeed(script);
                })
            );
        }

        if (parts.region !== undefined) {
            results.push(
                iana.subtags.regions.toValidCanonical(parts.region).onSuccess((region) => {
                    validated.region = region;
                    return succeed(region);
                })
            );
        }

        if (parts.variants !== undefined) {
            const present = new Set<VariantSubtag>();
            validated.variants = [];
            for (const original of parts.variants) {
                results.push(
                    iana.subtags.variants.toValidCanonical(original).onSuccess((variant) => {
                        if (present.has(variant)) {
                            return fail(`duplicate variant subtag "${variant}"`);
                        }
                        present.add(variant);
                        validated.variants!.push(variant);
                        return succeed(variant);
                    })
                );
            }
        }

        if (parts.extensions !== undefined) {
            const present = new Set<ExtensionSingleton>();
            validated.extensions = [];
            for (const original of parts.extensions) {
                results.push(
                    iana.extensions.extensions.toValidCanonical(original.singleton).onSuccess((singleton) => {
                        if (present.has(singleton)) {
                            return fail(`duplicate extension subtag "${singleton}"`);
                        }
                        present.add(singleton);
                        Subtags.Validate.extensionSubtag.toCanonical(original.value).onSuccess((value) => {
                            validated.extensions!.push({ singleton, value });
                            return succeed(true);
                        });
                        return succeed(true);
                    })
                );
            }
        }

        if (parts.privateUse !== undefined) {
            validated.privateUse = [];
            for (const original of parts.privateUse) {
                results.push(
                    Iana.LanguageSubtags.Validate.extendedLanguageRange.toCanonical(original).onSuccess((canonical) => {
                        validated.privateUse!.push(canonical);
                        return succeed(true);
                    })
                );
            }
        }

        return allSucceed(results, validated);
    }

    public toString(): string {
        return this.tag;
    }
}
