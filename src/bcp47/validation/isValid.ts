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

import { ExtensionSingleton, ExtensionSubtag } from '../subtags/model';
import { ExtensionSubtagValue, LanguageTagParts } from '../common';
import { Result, allSucceed, fail, succeed } from '@fgv/ts-utils';
import { TagValidatorBase } from './baseValidator';
import { TagValidity } from './common';

export class IsValidValidator extends TagValidatorBase {
    public validity: TagValidity = 'valid';

    protected _checkLanguage(parts: LanguageTagParts): Result<Iana.LanguageSubtags.LanguageSubtag | undefined> {
        return parts.primaryLanguage ? this.iana.subtags.languages.verifyIsValid(parts.primaryLanguage) : succeed(undefined);
    }

    protected _checkExtlangs(parts: LanguageTagParts): Result<Iana.LanguageSubtags.ExtLangSubtag[] | undefined> {
        if (parts.extlangs) {
            return allSucceed(
                parts.extlangs.map((e) => this.iana.subtags.extlangs.verifyIsValid(e)),
                parts.extlangs
            );
        }
        return succeed(undefined);
    }

    protected _checkScript(parts: LanguageTagParts): Result<Iana.LanguageSubtags.ScriptSubtag | undefined> {
        return parts.script ? this.iana.subtags.scripts.verifyIsValid(parts.script) : succeed(undefined);
    }

    protected _checkRegion(parts: LanguageTagParts): Result<Iana.LanguageSubtags.RegionSubtag | undefined> {
        return parts.region ? this.iana.subtags.regions.verifyIsValid(parts.region) : succeed(undefined);
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

    protected _checkExtensionSingleton(singleton: ExtensionSingleton): Result<ExtensionSingleton> {
        return this.iana.extensions.extensions.verifyIsValid(singleton);
    }

    protected _checkExtensionSubtagValue(value: ExtensionSubtag): Result<ExtensionSubtag> {
        return Subtags.Validate.extensionSubtag.verifyIsWellFormed(value);
    }

    protected _checkExtensions(parts: LanguageTagParts): Result<ExtensionSubtagValue[] | undefined> {
        return super._checkExtensions(parts).onSuccess((extensions) => {
            return this._verifyUnique('extensions', extensions, (e) => e.singleton);
        });
    }

    protected _checkPrivateUseTags(parts: LanguageTagParts): Result<Iana.LanguageSubtags.ExtendedLanguageRange[] | undefined> {
        if (parts.privateUse) {
            return allSucceed(
                parts.privateUse.map((pu) => Iana.LanguageSubtags.Validate.extendedLanguageRange.verifyIsWellFormed(pu)),
                parts.privateUse
            );
        }
        return succeed(parts.privateUse);
    }

    protected _checkGrandfatheredTags(parts: LanguageTagParts): Result<Iana.LanguageSubtags.GrandfatheredTag | undefined> {
        return parts.grandfathered ? this.iana.subtags.grandfathered.verifyIsValid(parts.grandfathered) : succeed(undefined);
    }

    protected _postValidate(parts: LanguageTagParts): Result<LanguageTagParts> {
        return this._basicPostValidation(parts).onSuccess((parts) => {
            if (parts.extlangs && parts.extlangs.length > 1) {
                return fail(`${parts.extlangs.join('-')}: multiple extlang subtags is invalid`);
            }
            return succeed(parts);
        });
    }
}
