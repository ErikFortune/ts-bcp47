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
import { Result, mapResults, succeed } from '@fgv/ts-utils';
import { TagNormalization, TagValidity } from '../status';
import { LanguageTagParts } from '../common';
import { TagTransform } from './tagTransform';

export class CanonicalNormalizer extends TagTransform {
    public readonly validity: TagValidity = 'well-formed';
    public readonly normalization: TagNormalization = 'canonical';

    protected _processLanguage(parts: LanguageTagParts): Result<LanguageSubtag | undefined> {
        if (parts.primaryLanguage) {
            return this.iana.subtags.languages.toCanonical(parts.primaryLanguage);
        }
        return succeed(parts.primaryLanguage);
    }

    protected _processExtlangs(parts: LanguageTagParts): Result<ExtLangSubtag[] | undefined> {
        if (parts.extlangs) {
            return mapResults(parts.extlangs.map((e) => this.iana.subtags.extlangs.toCanonical(e)));
        }
        return succeed(undefined);
    }

    protected _processScript(parts: LanguageTagParts): Result<ScriptSubtag | undefined> {
        if (parts.script) {
            return this.iana.subtags.scripts.toCanonical(parts.script);
        }
        return succeed(undefined);
    }

    protected _processRegion(parts: LanguageTagParts): Result<RegionSubtag | undefined> {
        if (parts.region) {
            return this.iana.subtags.regions.toCanonical(parts.region);
        }
        return succeed(undefined);
    }

    protected _processVariants(parts: LanguageTagParts): Result<VariantSubtag[] | undefined> {
        if (parts.variants) {
            return mapResults(parts.variants.map((v) => this.iana.subtags.variants.toCanonical(v)));
        }
        return succeed(undefined);
    }

    protected _processExtensionSingleton(singleton: ExtensionSingleton): Result<ExtensionSingleton> {
        return this.iana.extensions.extensions.toCanonical(singleton);
    }

    protected _processExtensionSubtagValue(value: ExtensionSubtag): Result<ExtensionSubtag> {
        return Subtags.Validate.extensionSubtag.toCanonical(value);
    }

    protected _processPrivateUseTags(parts: LanguageTagParts): Result<ExtendedLanguageRange[] | undefined> {
        if (parts.privateUse) {
            return mapResults(parts.privateUse.map((pu) => Iana.LanguageSubtags.Validate.extendedLanguageRange.toCanonical(pu)));
        }
        return succeed(parts.privateUse);
    }

    protected _processGrandfatheredTags(parts: LanguageTagParts): Result<GrandfatheredTag | undefined> {
        if (parts.grandfathered) {
            return this.iana.subtags.grandfathered.toCanonical(parts.grandfathered);
        }
        return succeed(undefined);
    }
}
