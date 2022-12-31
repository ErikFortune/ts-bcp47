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

import * as Items from './model';
import * as Model from '../jar/language-subtags/registry/model';

import {
    ExtLangSubtag,
    GrandfatheredTag,
    LanguageSubtag,
    RedundantTag,
    RegionSubtag,
    ScriptSubtag,
    Validate,
    VariantSubtag,
} from '../jar/language-subtags/tags';
import { Result, succeed } from '@fgv/ts-utils';

import { RegisteredItemScope } from '../common/registeredItems';
import { ValidationHelpers } from '../../utils';

/**
 * @internal
 */
class SubtagScope<
    TTYPE extends Model.RegistryEntryType,
    TTAG extends string,
    TITEM extends Items.RegisteredSubtag<TTYPE, TTAG>
> extends RegisteredItemScope<TTYPE, TTAG, TITEM> {
    protected constructor(type: TTYPE, validate: ValidationHelpers<TTAG>) {
        super(type, validate);
    }

    public add(entry: TITEM): Result<true> {
        return this._validateEntry(entry).onSuccess(() => {
            this._items.set(entry.subtag, entry);
            return succeed(true);
        });
    }

    protected _validateEntry(entry: TITEM): Result<true> {
        return this._validateKey(entry.subtag);
    }
}

/**
 * @internal
 */
class SubtagScopeWithRange<
    TTYPE extends Model.RegistryEntryType,
    TTAG extends string,
    TITEM extends Items.RegisteredSubtagWithRange<TTYPE, TTAG>
> extends SubtagScope<TTYPE, TTAG, TITEM> {
    protected constructor(type: TTYPE, validate: ValidationHelpers<TTAG>) {
        super(type, validate);
    }

    public add(entry: TITEM): Result<true> {
        return this._validateEntry(entry).onSuccess(() => {
            this._items.set(entry.subtag, entry);
            return succeed(true);
        });
    }
}

/**
 * @internal
 */
class TagScope<
    TTYPE extends Model.RegistryEntryType,
    TTAG extends string,
    TITEM extends Items.RegisteredTag<TTYPE, TTAG>
> extends RegisteredItemScope<TTYPE, TTAG, TITEM> {
    protected constructor(type: TTYPE, validate: ValidationHelpers<TTAG>) {
        super(type, validate);
    }

    public add(entry: TITEM): Result<true> {
        return this._validateEntry(entry).onSuccess(() => {
            this._items.set(entry.tag, entry);
            return succeed(true);
        });
    }

    protected _validateEntry(entry: TITEM): Result<true> {
        return this._validateKey(entry.tag);
    }
}

/**
 * @public
 */
export class LanguageSubtagScope extends SubtagScopeWithRange<'language', LanguageSubtag, Items.RegisteredLanguage> {
    public constructor() {
        super('language', Validate.languageSubtag);
    }
}

/**
 * @public
 */
export class ExtLangSubtagScope extends SubtagScope<'extlang', ExtLangSubtag, Items.RegisteredExtLang> {
    public constructor() {
        super('extlang', Validate.extlangSubtag);
    }
}

/**
 * @public
 */
export class ScriptSubtagScope extends SubtagScopeWithRange<'script', ScriptSubtag, Items.RegisteredScript> {
    public constructor() {
        super('script', Validate.scriptSubtag);
    }
}

/**
 * @public
 */
export class RegionSubtagScope extends SubtagScopeWithRange<'region', RegionSubtag, Items.RegisteredRegion> {
    public constructor() {
        super('region', Validate.regionSubtag);
    }
}

/**
 * @public
 */
export class VariantSubtagScope extends SubtagScope<'variant', VariantSubtag, Items.RegisteredVariant> {
    public constructor() {
        super('variant', Validate.variantSubtag);
    }
}

/**
 * @public
 */
export class GrandfatheredTagScope extends TagScope<'grandfathered', GrandfatheredTag, Items.RegisteredGrandfatheredTag> {
    public constructor() {
        super('grandfathered', Validate.grandfatheredTag);
    }
}

/**
 * @public
 */
export class RedundantTagScope extends TagScope<'redundant', RedundantTag, Items.RegisteredRedundantTag> {
    public constructor() {
        super('redundant', Validate.redundantTag);
    }
}
