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

import { LanguageSubtag, RegionSubtag, ScriptSubtag } from '../../iana/language-subtags';
import { Result, succeed } from '@fgv/ts-utils';
import { TagNormalization, TagValidity } from '../status';

import { LanguageTagParser } from './languageTagParser';
import { LanguageTagParts } from '../common';
import { ValidCanonicalNormalizer } from './validCanonicalNormalizer';

export class PreferredTagNormalizer extends ValidCanonicalNormalizer {
    public readonly validity: TagValidity = 'valid';
    public readonly normalization: TagNormalization = 'preferred';

    protected _processLanguage(parts: LanguageTagParts): Result<LanguageSubtag | undefined> {
        if (parts.primaryLanguage) {
            const language = this.iana.subtags.languages.tryGet(parts.primaryLanguage);
            if (!language) {
                return fail(`invalid language subtag "${parts.primaryLanguage}"`);
            }
            return succeed(language.preferredValue ?? language.subtag);
        }
        return succeed(undefined);
    }

    protected _processScript(parts: LanguageTagParts): Result<ScriptSubtag | undefined> {
        if (parts.primaryLanguage && parts.script) {
            const language = this.iana.subtags.languages.tryGet(parts.primaryLanguage);
            // istanbul ignore next - internal error difficult to test
            if (!language) {
                return fail(`invalid primary language subtag "${parts.primaryLanguage}.`);
            }

            const script = this.iana.subtags.scripts.toValidCanonical(parts.script).getValueOrDefault();
            if (!script) {
                return fail(`invalid script subtag "${parts.script}`);
            }

            if (language.suppressScript !== script) {
                return succeed(script);
            }
        }
        return succeed(undefined);
    }

    protected _processRegion(parts: LanguageTagParts): Result<RegionSubtag | undefined> {
        return this.iana.subtags.regions.get(parts.region).onSuccess((region) => {
            return succeed(region?.preferredValue ?? region?.subtag);
        });
    }

    protected _postValidate(parts: LanguageTagParts): Result<LanguageTagParts> {
        return super._postValidate(parts).onSuccess((parts) => {
            return this.iana.subtags.grandfathered.get(parts.grandfathered).onSuccess((grandfathered) => {
                if (grandfathered) {
                    if (grandfathered.preferredValue) {
                        return LanguageTagParser.parse(grandfathered.preferredValue, this.iana)
                            .onSuccess((gfParts) => {
                                if (gfParts.grandfathered !== undefined) {
                                    return fail(
                                        `preferred value ${grandfathered.preferredValue} of grandfathered tag ${parts.grandfathered} is also grandfathered.`
                                    );
                                }
                                return this.process(gfParts);
                            })
                            .onFailure((message) => {
                                return fail(
                                    `grandfathered tag "${parts.grandfathered}" has invalid preferred value "${grandfathered.preferredValue}":\n${message}`
                                );
                            });
                    }
                }
                return succeed(parts);
            });
        });
    }
}
