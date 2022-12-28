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
import { Result, allSucceed, succeed } from '@fgv/ts-utils';

import { LanguageTagParts } from '../common';
import { TagValidatorBase } from './baseValidator';
import { TagValidity } from './common';

export class IsWellFormedValidator extends TagValidatorBase {
    public validity: TagValidity = 'well-formed';

    protected _checkLanguage(parts: LanguageTagParts): Result<Iana.LanguageSubtags.LanguageSubtag | undefined> {
        return parts.primaryLanguage ? this.iana.subtags.languages.verifyIsWellFormed(parts.primaryLanguage) : succeed(undefined);
    }

    protected _checkExtlangs(parts: LanguageTagParts): Result<Iana.LanguageSubtags.ExtLangSubtag[] | undefined> {
        if (parts.extlangs) {
            return allSucceed(
                parts.extlangs.map((e) => this.iana.subtags.extlangs.verifyIsWellFormed(e)),
                parts.extlangs
            );
        }
        return succeed(undefined);
    }

    protected _checkScript(parts: LanguageTagParts): Result<Iana.LanguageSubtags.ScriptSubtag | undefined> {
        return parts.script ? this.iana.subtags.scripts.verifyIsWellFormed(parts.script) : succeed(undefined);
    }

    protected _checkRegion(parts: LanguageTagParts): Result<Iana.LanguageSubtags.RegionSubtag | undefined> {
        return parts.region ? this.iana.subtags.regions.verifyIsWellFormed(parts.region) : succeed(undefined);
    }

    protected _checkVariants(parts: LanguageTagParts): Result<Iana.LanguageSubtags.VariantSubtag[] | undefined> {
        if (parts.variants) {
            return allSucceed(
                parts.variants.map((v) => this.iana.subtags.variants.verifyIsWellFormed(v)),
                parts.variants
            ).onSuccess((v) => {
                return this._verifyUnique('variant subtag', v, (v) => v);
            });
        }
        return succeed(undefined);
    }

    protected _checkExtensionSingleton(singleton: ExtensionSingleton): Result<ExtensionSingleton> {
        return this.iana.extensions.extensions.verifyIsWellFormed(singleton);
    }

    protected _checkExtensionSubtagValue(value: ExtensionSubtag): Result<ExtensionSubtag> {
        return Subtags.Validate.extensionSubtag.verifyIsWellFormed(value);
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
        return parts.grandfathered ? this.iana.subtags.grandfathered.verifyIsWellFormed(parts.grandfathered) : succeed(undefined);
    }
}
