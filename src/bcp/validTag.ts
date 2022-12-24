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

import { Result, allSucceed, succeed } from '@fgv/ts-utils';
import { LanguageTagParts } from './common';

export class ValidTag {
    public readonly parts: Readonly<LanguageTagParts>;

    protected constructor(init: Readonly<LanguageTagParts>) {
        this.parts = Object.freeze({ ...init });
    }

    public static create(tag: string, registry: Iana.LanguageSubtags.TagRegistry): Result<ValidTag> {
        return Parser.LanguageTagParser.parse(tag, registry).onSuccess((parts) => {
            return succeed(new ValidTag(parts));
        });
    }

    public static validateParts(parts: Readonly<LanguageTagParts>, iana: Iana.LanguageSubtags.TagRegistry): Result<LanguageTagParts> {
        const results: Result<unknown>[] = [];
        const validated: LanguageTagParts = {};

        if (parts.primaryLanguage !== undefined) {
            results.push(
                iana.languages.toValidCanonical(parts.primaryLanguage).onSuccess((lang) => {
                    validated.primaryLanguage = lang;
                    return succeed(lang);
                })
            );
        }

        if (parts.extlangs !== undefined) {
            validated.extlangs = [];
            for (const extlang of parts.extlangs) {
                results.push(
                    iana.extlangs.toValidCanonical(extlang).onSuccess((lang) => {
                        validated.extlangs!.push(lang);
                        return succeed(lang);
                    })
                );
            }
        }

        if (parts.script !== undefined) {
            results.push(
                iana.scripts.toValidCanonical(parts.script).onSuccess((script) => {
                    validated.script = script;
                    return succeed(script);
                })
            );
        }

        if (parts.region !== undefined) {
            results.push(
                iana.regions.toValidCanonical(parts.region).onSuccess((region) => {
                    validated.region = region;
                    return succeed(region);
                })
            );
        }

        if (parts.variants !== undefined) {
            validated.variants = [];
            for (const original of parts.variants) {
                results.push(
                    iana.variants.toValidCanonical(original).onSuccess((variant) => {
                        validated.variants!.push(variant);
                        return succeed(variant);
                    })
                );
            }
        }

        return allSucceed(results, validated);
    }
}
