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
import * as Subtags from '../subtags';

import { ExtensionSubtagValue, LanguageTagParts, languageTagPartsToString } from '../common';
import { Result, fail, mapResults, succeed } from '@fgv/ts-utils';

import { LanguageTagParser } from '../languageTagParser';
import { TagNormalization } from '../status';
import { TagNormalizerBase } from './baseNormalizer';

export class PreferredNormalizer extends TagNormalizerBase {
    public readonly normalization: TagNormalization = 'preferred';

    protected _processLanguage(parts: LanguageTagParts): Result<Iana.LanguageSubtags.LanguageSubtag | undefined> {
        if (parts.primaryLanguage) {
            const language = this._iana.subtags.languages.tryGet(parts.primaryLanguage);
            if (!language) {
                return fail(`invalid language subtag "${parts.primaryLanguage}"`);
            }
            return succeed(language.preferredValue ?? language.subtag);
        }
        return succeed(undefined);
    }

    protected _processExtlangs(parts: LanguageTagParts): Result<Iana.LanguageSubtags.ExtLangSubtag[] | undefined> {
        if (parts.extlangs) {
            return mapResults(parts.extlangs.map((e) => this._iana.subtags.extlangs.toValidCanonical(e)));
        }
        return succeed(undefined);
    }

    protected _processScript(parts: LanguageTagParts): Result<Iana.LanguageSubtags.ScriptSubtag | undefined> {
        if (parts.primaryLanguage && parts.script) {
            const language = this._iana.subtags.languages.tryGet(parts.primaryLanguage);
            // istanbul ignore next - internal error difficult to test
            if (!language) {
                return fail(`invalid primary language subtag "${parts.primaryLanguage}.`);
            }

            const script = this._iana.subtags.scripts.toValidCanonical(parts.script).getValueOrDefault();
            if (!script) {
                return fail(`invalid script subtag "${parts.script}`);
            }

            if (language.suppressScript !== script) {
                return succeed(script);
            }
        }
        return succeed(undefined);
    }

    protected _processRegion(parts: LanguageTagParts): Result<Iana.LanguageSubtags.RegionSubtag | undefined> {
        if (parts.region) {
            return this._iana.subtags.regions.get(parts.region).onSuccess((region) => {
                return succeed(region.preferredValue ?? region.subtag);
            });
        }
        return succeed(undefined);
    }

    protected _processVariants(parts: LanguageTagParts): Result<Iana.LanguageSubtags.VariantSubtag[] | undefined> {
        if (parts.variants) {
            return mapResults(parts.variants.map((v) => this._iana.subtags.variants.toValidCanonical(v))).onSuccess((v) =>
                this._verifyUnique('variant', v, (v) => v)
            );
        }
        return succeed(undefined);
    }

    protected _processExtensionSingleton(singleton: Subtags.Model.ExtensionSingleton): Result<Subtags.Model.ExtensionSingleton> {
        return this._iana.extensions.extensions.toValidCanonical(singleton);
    }

    protected _processExtensionSubtagValue(value: Subtags.Model.ExtensionSubtag): Result<Subtags.Model.ExtensionSubtag> {
        return Subtags.Validate.extensionSubtag.toCanonical(value);
    }

    protected _processExtensions(parts: LanguageTagParts): Result<ExtensionSubtagValue[] | undefined> {
        return super._processExtensions(parts).onSuccess((extensions) => {
            return this._verifyUnique('extensions', extensions, (e) => e.singleton);
        });
    }

    protected _processPrivateUseTags(parts: LanguageTagParts): Result<Iana.LanguageSubtags.ExtendedLanguageRange[] | undefined> {
        if (parts.privateUse) {
            return mapResults(parts.privateUse.map((pu) => Iana.LanguageSubtags.Validate.extendedLanguageRange.toCanonical(pu)));
        }
        return succeed(parts.privateUse);
    }

    protected _processGrandfatheredTags(parts: LanguageTagParts): Result<Iana.LanguageSubtags.GrandfatheredTag | undefined> {
        if (parts.grandfathered) {
            return this._iana.subtags.grandfathered.toValidCanonical(parts.grandfathered);
        }
        return succeed(undefined);
    }

    protected _postValidateGrandfatheredTag(parts: LanguageTagParts): Result<LanguageTagParts> {
        if (parts.grandfathered) {
            return this._iana.subtags.grandfathered.get(parts.grandfathered).onSuccess((grandfathered) => {
                if (grandfathered.preferredValue) {
                    return LanguageTagParser.parse(grandfathered.preferredValue, this._iana)
                        .onSuccess((gfParts) => {
                            // istanbul ignore next - would require a registry error too hard to test
                            if (gfParts.grandfathered !== undefined) {
                                return fail<LanguageTagParts>(
                                    `preferred value ${grandfathered.preferredValue} of grandfathered tag ${parts.grandfathered} is also grandfathered.`
                                );
                            }
                            return this.processParts(gfParts);
                        })
                        .onFailure(
                            // istanbul ignore next - would require a registry error too hard to test
                            (message) => {
                                // istanbul ignore next - would require a registry error too hard to test
                                return fail(
                                    `grandfathered tag "${parts.grandfathered}" has invalid preferred value "${grandfathered.preferredValue}":\n${message}`
                                );
                            }
                        );
                }
                return succeed(parts);
            });
        }
        return succeed(parts);
    }

    protected _postValidateRedundantTag(parts: LanguageTagParts): Result<LanguageTagParts> {
        const tag = languageTagPartsToString(parts);
        const redundant = this._iana.subtags.redundant.tryGetCanonical(tag);
        if (redundant?.preferredValue) {
            return LanguageTagParser.parse(redundant.preferredValue, this._iana);
        }
        return succeed(parts);
    }

    protected _postValidate(parts: LanguageTagParts): Result<LanguageTagParts> {
        return super._postValidate(parts).onSuccess((parts) => {
            if (parts.extlangs && parts.extlangs.length > 1) {
                return fail(`${parts.extlangs.join('-')}: too many extlangs`);
            }
            return this._postValidateGrandfatheredTag(parts).onSuccess((parts) => {
                return this._postValidateRedundantTag(parts);
            });
        });
    }
}
