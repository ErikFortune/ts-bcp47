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
import { ExtensionSingleton, ExtensionSubtag } from '../bcp47Subtags/model';
import { ExtensionSubtagValue, Subtags, subtagsToString } from '../common';
import { Result, allSucceed, fail, mapResults, populateObject, succeed } from '@fgv/ts-utils';
import { TagNormalization } from './common';

/**
 * @public
 */
export interface TagNormalizer {
    readonly normalization: TagNormalization;

    processSubtags(subtags: Subtags): Result<Subtags>;
}

/**
 * @public
 */
export abstract class TagNormalizerBase {
    protected readonly _iana: Iana.LanguageRegistries;

    public abstract readonly normalization: TagNormalization;

    public constructor(iana?: Iana.LanguageRegistries) {
        // istanbul ignore next - dependency injection primarily for test
        this._iana = iana ?? Iana.DefaultRegistries.languageRegistries;
    }

    public processSubtags(subtags: Subtags): Result<Subtags> {
        return populateObject<Subtags>(
            {
                primaryLanguage: () => this._processLanguage(subtags),
                extlangs: () => this._processExtlangs(subtags),
                script: () => this._processScript(subtags),
                region: () => this._processRegion(subtags),
                variants: () => this._processVariants(subtags),
                extensions: () => this._processExtensions(subtags),
                privateUse: () => this._processPrivateUseTags(subtags),
                grandfathered: () => this._processGrandfatheredTags(subtags),
            },
            { suppressUndefined: true }
        ).onSuccess((processed) => {
            return this._postValidate(processed);
        });
    }

    protected _basicPostValidation(subtags: Subtags): Result<Subtags> {
        // istanbul ignore next - any validation whatsoever catches these so should never happen in practice
        if (subtags.primaryLanguage === undefined && subtags.grandfathered === undefined && subtags.privateUse === undefined) {
            return fail(`${subtagsToString(subtags)}: missing primary language subtag.`);
        }

        // istanbul ignore next - any validation whatsoever catches these so should never happen in practice
        if (subtags.extlangs && subtags.extlangs.length > 3) {
            return fail(`${subtagsToString(subtags)}: too many extlang subtags`);
        }
        return succeed(subtags);
    }

    protected _postValidate(subtags: Subtags): Result<Subtags> {
        return this._basicPostValidation(subtags);
    }

    protected _processExtensions(subtags: Subtags): Result<ExtensionSubtagValue[] | undefined> {
        if (subtags.extensions) {
            return mapResults(
                subtags.extensions.map((ex) => {
                    return populateObject<ExtensionSubtagValue>({
                        singleton: () => this._processExtensionSingleton(ex.singleton),
                        value: () => this._processExtensionSubtagValue(ex.value),
                    });
                })
            );
        }
        return succeed(subtags.extensions);
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

    protected abstract _processLanguage(subtags: Subtags): Result<LanguageSubtag | undefined>;
    protected abstract _processExtlangs(subtags: Subtags): Result<ExtLangSubtag[] | undefined>;
    protected abstract _processScript(subtags: Subtags): Result<ScriptSubtag | undefined>;
    protected abstract _processRegion(subtags: Subtags): Result<RegionSubtag | undefined>;
    protected abstract _processVariants(subtags: Subtags): Result<VariantSubtag[] | undefined>;
    protected abstract _processExtensionSingleton(singleton: ExtensionSingleton): Result<ExtensionSingleton>;
    protected abstract _processExtensionSubtagValue(value: ExtensionSubtag): Result<ExtensionSubtag>;
    protected abstract _processPrivateUseTags(subtags: Subtags): Result<ExtendedLanguageRange[] | undefined>;
    protected abstract _processGrandfatheredTags(subtags: Subtags): Result<GrandfatheredTag | undefined>;
}
