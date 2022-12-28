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

import { ExtensionSingleton, ExtensionSubtag } from '../subtags/model';
import { ExtensionSubtagValue, LanguageTagParts, languageTagPartsToString } from '../common';
import { Result, allSucceed, fail, succeed } from '@fgv/ts-utils';
import { TagNormalization, TagValidity } from '../status';

export interface TagValidator {
    readonly validity: TagValidity;
    readonly normalization: TagNormalization;

    check(parts: LanguageTagParts): Result<true>;
}

export abstract class TagValidatorBase implements TagValidator {
    public readonly iana: Iana.LanguageRegistries;
    public abstract readonly validity: TagValidity;
    public abstract readonly normalization: TagNormalization;

    public constructor(iana?: Iana.LanguageRegistries) {
        this.iana = iana ?? Iana.DefaultRegistries.languageRegistries;
    }

    public check(parts: LanguageTagParts): Result<true> {
        return allSucceed(
            [
                this._checkLanguage(parts),
                this._checkExtlangs(parts),
                this._checkScript(parts),
                this._checkRegion(parts),
                this._checkVariants(parts),
                this._checkExtensions(parts),
                this._checkPrivateUseTags(parts),
                this._checkGrandfatheredTags(parts),
            ],
            true
        ).onSuccess(() => {
            return this._postValidate(parts).onSuccess(() => succeed(true));
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

    protected _checkExtensions(parts: LanguageTagParts): Result<ExtensionSubtagValue[] | undefined> {
        if (parts.extensions) {
            return allSucceed(
                parts.extensions.map((ext) => {
                    return this._checkExtensionSingleton(ext.singleton).onSuccess(() => {
                        return this._checkExtensionSubtagValue(ext.value);
                    });
                }),
                parts.extensions
            );
        }
        return succeed(undefined);
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

    protected abstract _checkLanguage(parts: LanguageTagParts): Result<unknown>;
    protected abstract _checkExtlangs(parts: LanguageTagParts): Result<unknown>;
    protected abstract _checkScript(parts: LanguageTagParts): Result<unknown>;
    protected abstract _checkRegion(parts: LanguageTagParts): Result<unknown>;
    protected abstract _checkVariants(parts: LanguageTagParts): Result<unknown>;
    protected abstract _checkExtensionSingleton(singleton: ExtensionSingleton): Result<unknown>;
    protected abstract _checkExtensionSubtagValue(value: ExtensionSubtag): Result<unknown>;
    protected abstract _checkPrivateUseTags(parts: LanguageTagParts): Result<unknown>;
    protected abstract _checkGrandfatheredTags(parts: LanguageTagParts): Result<unknown>;
}
