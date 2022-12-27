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

import {
    ExtLangSubtag,
    ExtendedLanguageRange,
    GrandfatheredTag,
    LanguageSubtag,
    RegionSubtag,
    ScriptSubtag,
    VariantSubtag,
} from '../../iana/language-subtags';
import { ExtensionSingleton, ExtensionSubtag } from '../subtags/model';
import { ExtensionSubtagValue, LanguageTagParts } from '../common';
import { Result, fail, mapResults, succeed } from '@fgv/ts-utils';
import { TagNormalization, TagValidity } from '../status';
import { TagTransform } from './tagTransform';

export class ValidCanonicalNormalizer extends TagTransform {
    public validity: TagValidity = 'valid';
    public normalization: TagNormalization = 'canonical';

    protected _processLanguage(parts: LanguageTagParts): Result<LanguageSubtag | undefined> {
        if (parts.primaryLanguage) {
            return this.iana.subtags.languages.toValidCanonical(parts.primaryLanguage);
        }
        return succeed(parts.primaryLanguage);
    }

    protected _processExtlangs(parts: LanguageTagParts): Result<ExtLangSubtag[] | undefined> {
        if (parts.extlangs) {
            return mapResults(parts.extlangs.map((e) => this.iana.subtags.extlangs.toValidCanonical(e)));
        }
        return succeed(undefined);
    }

    protected _processScript(parts: LanguageTagParts): Result<ScriptSubtag | undefined> {
        if (parts.script) {
            return this.iana.subtags.scripts.toValidCanonical(parts.script);
        }
        return succeed(undefined);
    }

    protected _processRegion(parts: LanguageTagParts): Result<RegionSubtag | undefined> {
        if (parts.region) {
            return this.iana.subtags.regions.toValidCanonical(parts.region);
        }
        return succeed(undefined);
    }

    protected _processVariants(parts: LanguageTagParts): Result<VariantSubtag[] | undefined> {
        if (parts.variants) {
            return mapResults(parts.variants.map((v) => this.iana.subtags.variants.toValidCanonical(v))).onSuccess((v) =>
                this._verifyUnique('variant', v, (v) => v)
            );
        }
        return succeed(undefined);
    }

    protected _processExtensionSingleton(singleton: ExtensionSingleton): Result<ExtensionSingleton> {
        return this.iana.extensions.extensions.toValidCanonical(singleton);
    }

    protected _processExtensionSubtagValue(value: ExtensionSubtag): Result<ExtensionSubtag> {
        return Subtags.Validate.extensionSubtag.toCanonical(value);
    }

    protected _processExtensions(parts: LanguageTagParts): Result<ExtensionSubtagValue[] | undefined> {
        return super._processExtensions(parts).onSuccess((extensions) => {
            return this._verifyUnique('extensions', extensions, (e) => e.singleton);
        });
    }

    protected _processPrivateUseTags(parts: LanguageTagParts): Result<ExtendedLanguageRange[] | undefined> {
        if (parts.privateUse) {
            return mapResults(parts.privateUse.map((pu) => Iana.LanguageSubtags.Validate.extendedLanguageRange.toCanonical(pu)));
        }
        return succeed(parts.privateUse);
    }

    protected _processGrandfatheredTags(parts: LanguageTagParts): Result<GrandfatheredTag | undefined> {
        if (parts.grandfathered) {
            return this.iana.subtags.grandfathered.toValidCanonical(parts.grandfathered);
        }
        return succeed(undefined);
    }

    protected _postValidate(parts: LanguageTagParts): Result<LanguageTagParts> {
        return this._basicPostValidation(parts).onSuccess((parts) => {
            if (parts.extlangs && parts.extlangs.length > 1) {
                return fail(`${parts.extlangs.join('-')}: too many extlangs`);
            }
            return succeed(parts);
        });
    }
}
