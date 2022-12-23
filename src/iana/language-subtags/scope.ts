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
import { Result, fail, succeed } from '@fgv/ts-utils';
import { ValidationHelpers } from '../../utils';

abstract class RegisteredItemScope<
    TTYPE extends Model.RegistryEntryType,
    TTAG extends string,
    TITEM extends Items.RegisteredTagOrSubtag<TTYPE, TTAG>
> {
    protected readonly _items: Map<TTAG, TITEM>;
    protected readonly _type: TTYPE;
    protected readonly _validate: ValidationHelpers<TTAG>;

    protected constructor(type: TTYPE, validate: ValidationHelpers<TTAG>) {
        this._items = new Map();
        this._type = type;
        this._validate = validate;
    }

    public getAllTags(): TTAG[] {
        return Array.from(this._items.keys());
    }

    public getAll(): TITEM[] {
        return Array.from(this._items.values());
    }

    public tryGet(want: string): TITEM | undefined {
        const got = this._items.get(want as TTAG);
        if (!got) {
            const result = this.toCanonical(want);
            if (result.isSuccess()) {
                return this._items.get(result.value as TTAG);
            }
        }
        return got;
    }

    public tryGetCanonical(want: string): TITEM | undefined {
        return this._items.get(want as TTAG);
    }

    public isWellFormed(val: unknown): val is TTAG {
        return this._validate.isWellFormed(val);
    }

    public isCanonical(val: unknown): val is TTAG {
        return this._validate.isCanonical(val);
    }

    public toCanonical(val: unknown): Result<TTAG> {
        return this._validate.toCanonical(val);
    }

    public toValidCanonical(val: unknown): Result<TTAG> {
        return this._validate.toCanonical(val).onSuccess((canonical) => {
            if (this._items.has(canonical)) {
                return succeed(canonical);
            }
            return fail(`${val}: invalid ${this._type}`);
        });
    }

    public isValid(val: unknown): val is TTAG {
        const result = this.toCanonical(val);
        if (result.isSuccess()) {
            return this._items.has(result.value);
        }
        return false;
    }

    public isValidCanonical(val: unknown): val is TTAG {
        if (this.isCanonical(val)) {
            return this._items.has(val);
        }
        return false;
    }

    protected _validateTag(tag: TTAG): Result<true> {
        if (!this.isCanonical(tag)) {
            return fail(`${tag}: ${this._type} is not in canonical form`);
        }
        return succeed(true);
    }

    public abstract add(entry: TITEM): Result<true>;
    protected abstract _validateEntry(entry: TITEM): Result<true>;
}

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
        return this._validateTag(entry.subtag);
    }
}

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
        return this._validateTag(entry.tag);
    }
}

export class LanguageSubtagScope extends SubtagScopeWithRange<'language', LanguageSubtag, Items.RegisteredLanguage> {
    public constructor() {
        super('language', Validate.languageSubtag);
    }
}

export class ExtLangSubtagScope extends SubtagScope<'extlang', ExtLangSubtag, Items.RegisteredExtLang> {
    public constructor() {
        super('extlang', Validate.extlangSubtag);
    }
}

export class ScriptSubtagScope extends SubtagScopeWithRange<'script', ScriptSubtag, Items.RegisteredScript> {
    public constructor() {
        super('script', Validate.scriptSubtag);
    }
}

export class RegionSubtagScope extends SubtagScopeWithRange<'region', RegionSubtag, Items.RegisteredRegion> {
    public constructor() {
        super('region', Validate.regionSubtag);
    }
}

export class VariantSubtagScope extends SubtagScope<'variant', VariantSubtag, Items.RegisteredVariant> {
    public constructor() {
        super('variant', Validate.variantSubtag);
    }
}

export class GrandfatheredTagScope extends TagScope<'grandfathered', GrandfatheredTag, Items.RegisteredGrandfatheredTag> {
    public constructor() {
        super('grandfathered', Validate.grandfatheredTag);
    }
}

export class RedundantTagScope extends TagScope<'redundant', RedundantTag, Items.RegisteredRedundantTag> {
    public constructor() {
        super('redundant', Validate.redundantTag);
    }
}
