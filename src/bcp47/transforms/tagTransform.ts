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
import { ExtensionSubtagValue, LanguageTagParts, languageTagPartsToString } from '../common';
import { Result, allSucceed, fail, mapResults, populateObject, succeed } from '@fgv/ts-utils';
import { TagNormalization, TagValidity } from '../status';

export abstract class TagTransform {
    public readonly iana: Iana.LanguageRegistries;
    public abstract readonly validity: TagValidity;
    public abstract readonly normalization: TagNormalization;

    public constructor(iana?: Iana.LanguageRegistries) {
        this.iana = iana ?? Iana.DefaultRegistries.languageRegistries;
    }

    public processParts(parts: LanguageTagParts): Result<LanguageTagParts> {
        return populateObject<LanguageTagParts>(
            {
                primaryLanguage: () => this._processLanguage(parts),
                extlangs: () => this._processExtlangs(parts),
                script: () => this._processScript(parts),
                region: () => this._processRegion(parts),
                variants: () => this._processVariants(parts),
                extensions: () => this._processExtensions(parts),
                privateUse: () => this._processPrivateUseTags(parts),
                grandfathered: () => this._processGrandfatheredTags(parts),
            },
            { suppressUndefined: true }
        ).onSuccess((parts) => {
            return this._postValidate(parts);
        });
    }

    protected _basicPostValidation(parts: LanguageTagParts): Result<LanguageTagParts> {
        if (parts.primaryLanguage === undefined && parts.grandfathered === undefined && parts.privateUse === undefined) {
            return fail(`${languageTagPartsToString(parts)}: missing primary language subtag.`);
        }
        if (parts.extlangs && parts.extlangs.length > 3) {
            return fail(`${languageTagPartsToString(parts)}: too many extlang subtags`);
        }
        return succeed(parts);
    }

    protected _postValidate(parts: LanguageTagParts): Result<LanguageTagParts> {
        return this._basicPostValidation(parts);
    }

    protected _processExtensions(parts: LanguageTagParts): Result<ExtensionSubtagValue[] | undefined> {
        if (parts.extensions) {
            return mapResults(
                parts.extensions.map((ex) => {
                    return populateObject<ExtensionSubtagValue>({
                        singleton: () => this._processExtensionSingleton(ex.singleton),
                        value: () => this._processExtensionSubtagValue(ex.value),
                    });
                })
            );
        }
        return succeed(parts.extensions);
    }

    protected _verifyUnique<T, TK extends string>(
        description: string,
        items: T[] | undefined,
        getKey: (item: T) => TK
    ): Result<T[] | undefined> {
        if (items) {
            const present = new Set<TK>();
            return allSucceed(
                items.map((i) => {
                    const key = getKey(i);
                    if (present.has(key)) {
                        return fail(`${key}: duplicate ${description}`);
                    }
                    present.add(key);
                    return succeed(key);
                }),
                items
            );
        }
        return succeed(items);
    }

    protected abstract _processLanguage(parts: LanguageTagParts): Result<LanguageSubtag | undefined>;
    protected abstract _processExtlangs(parts: LanguageTagParts): Result<ExtLangSubtag[] | undefined>;
    protected abstract _processScript(parts: LanguageTagParts): Result<ScriptSubtag | undefined>;
    protected abstract _processRegion(parts: LanguageTagParts): Result<RegionSubtag | undefined>;
    protected abstract _processVariants(parts: LanguageTagParts): Result<VariantSubtag[] | undefined>;
    protected abstract _processExtensionSingleton(singleton: ExtensionSingleton): Result<ExtensionSingleton>;
    protected abstract _processExtensionSubtagValue(value: ExtensionSubtag): Result<ExtensionSubtag>;
    protected abstract _processPrivateUseTags(parts: LanguageTagParts): Result<ExtendedLanguageRange[] | undefined>;
    protected abstract _processGrandfatheredTags(parts: LanguageTagParts): Result<GrandfatheredTag | undefined>;
}
