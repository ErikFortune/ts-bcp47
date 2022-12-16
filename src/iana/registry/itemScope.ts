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

import * as Items from './registeredItems';
import * as Model from './model';
import * as Tags from '../tags';

import { ExtLangSubtag, GrandfatheredTag, LanguageSubtag, RedundantTag, RegionSubtag, ScriptSubtag, VariantSubtag } from '../tags/common';
import { Result, fail, succeed } from '@fgv/ts-utils';

abstract class ItemScope<
    TTYPE extends Model.RegistryEntryType,
    TTAG extends string,
    TITEM extends Items.RegisteredTagOrSubtag<TTYPE, TTAG>
> {
    protected readonly _items: Map<TTAG, TITEM>;
    protected readonly _tag: Tags.TagOrSubtag<TTYPE, TTAG>;

    protected constructor(tag: Tags.TagOrSubtag<TTYPE, TTAG>) {
        this._items = new Map();
        this._tag = tag;
    }

    public getAllTags(): TTAG[] {
        return Array.from(this._items.keys());
    }

    public getAll(): TITEM[] {
        return Array.from(this._items.values());
    }

    public tryGetCanonical(want: string): TITEM | undefined {
        return this._items.get(want as TTAG);
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

    public isWellFormed(val: unknown): val is TTAG {
        return this._tag.isWellFormed(val);
    }

    public isCanonical(val: unknown): val is TTAG {
        return this._tag.isCanonical(val);
    }

    public toCanonical(val: unknown): Result<TTAG> {
        return this._tag.toCanonical(val);
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
            return fail(`${tag}: ${this._tag.type} is not in canonical form`);
        }
        return succeed(true);
    }

    public abstract add(entry: TITEM): Result<true>;
    protected abstract _validateEntry(entry: TITEM): Result<true>;
}

class SubtagItemScope<
    TTYPE extends Model.RegistryEntryType,
    TTAG extends string,
    TITEM extends Items.RegisteredSubtag<TTYPE, TTAG>
> extends ItemScope<TTYPE, TTAG, TITEM> {
    protected constructor(tag: Tags.TagOrSubtag<TTYPE, TTAG>) {
        super(tag);
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

class SubtagItemScopeWithRange<
    TTYPE extends Model.RegistryEntryType,
    TTAG extends string,
    TITEM extends Items.RegisteredSubtagWithRange<TTYPE, TTAG>
> extends SubtagItemScope<TTYPE, TTAG, TITEM> {
    protected constructor(tag: Tags.TagOrSubtag<TTYPE, TTAG>) {
        super(tag);
    }

    public add(entry: TITEM): Result<true> {
        return this._validateEntry(entry).onSuccess(() => {
            this._items.set(entry.subtag, entry);
            return succeed(true);
        });
    }
}

class TagItemScope<
    TTYPE extends Model.RegistryEntryType,
    TTAG extends string,
    TITEM extends Items.RegisteredTag<TTYPE, TTAG>
> extends ItemScope<TTYPE, TTAG, TITEM> {
    protected constructor(tag: Tags.TagOrSubtag<TTYPE, TTAG>) {
        super(tag);
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

export class LanguageItemScope extends SubtagItemScopeWithRange<'language', LanguageSubtag, Items.RegisteredLanguage> {
    public constructor() {
        super(new Tags.Language());
    }
}

export class ExtLangItemScope extends SubtagItemScope<'extlang', ExtLangSubtag, Items.RegisteredExtLang> {
    public constructor() {
        super(new Tags.ExtLang());
    }
}

export class ScriptItemScope extends SubtagItemScopeWithRange<'script', ScriptSubtag, Items.RegisteredScript> {
    public constructor() {
        super(new Tags.Script());
    }
}

export class RegionItemScope extends SubtagItemScopeWithRange<'region', RegionSubtag, Items.RegisteredRegion> {
    public constructor() {
        super(new Tags.Region());
    }
}

export class VariantItemScope extends SubtagItemScope<'variant', VariantSubtag, Items.RegisteredVariant> {
    public constructor() {
        super(new Tags.Variant());
    }
}

export class GrandfatheredTagScope extends TagItemScope<'grandfathered', GrandfatheredTag, Items.RegisteredGrandfatheredTag> {
    public constructor() {
        super(new Tags.Grandfathered());
    }
}

export class RedundantTagScope extends TagItemScope<'redundant', RedundantTag, Items.RegisteredRedundantTag> {
    public constructor() {
        super(new Tags.Redundant());
    }
}
