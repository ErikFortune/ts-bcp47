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
import { Result, allSucceed, fail, succeed } from '@fgv/ts-utils';

export class ItemScope<TTYPE extends Model.RegistryEntryType, TTAG extends string, TITEM extends Items.RegisteredItem> {
    protected readonly _items: Map<TTAG, TITEM>;
    protected readonly _tag: Tags.TagOrSubtag<TTYPE, TTAG>;

    protected constructor(tag: Tags.TagOrSubtag<TTYPE, TTAG>) {
        this._items = new Map();
        this._tag = tag;
    }

    protected static _expandRange<TTAG extends string>(tags: TTAG | TTAG[]): TTAG[] {
        return Array.isArray(tags) ? tags : [tags];
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

    public add(tags: TTAG | TTAG[], entry: TITEM): Result<true> {
        return this._validateEntry(entry).onSuccess(() => {
            const expanded = ItemScope._expandRange(tags);
            return allSucceed(
                expanded.map((tag) => {
                    return this._validateTag(tag, entry).onSuccess(() => {
                        this._items.set(tag, entry);
                        return succeed(true);
                    });
                }),
                true
            );
        });
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

    protected _validateTag(tag: TTAG, entry: TITEM): Result<true> {
        if (!this.isCanonical(tag)) {
            return fail(`${tag}: ${entry.type} (sub) is not in canonical form`);
        }
        return succeed(true);
    }

    protected _validateEntry(_entry: TITEM): Result<true> {
        return succeed(true);
    }
}

export class LanguageItemScope extends ItemScope<'language', LanguageSubtag, Items.RegisteredLanguage> {
    public constructor() {
        super(new Tags.Language());
    }
}

export class ExtLangItemScope extends ItemScope<'extlang', ExtLangSubtag, Items.RegisteredExtLang> {
    public constructor() {
        super(new Tags.ExtLang());
    }
}

export class ScriptItemScope extends ItemScope<'script', ScriptSubtag, Items.RegisteredScript> {
    public constructor() {
        super(new Tags.Script());
    }
}

export class RegionItemScope extends ItemScope<'region', RegionSubtag, Items.RegisteredRegion> {
    public constructor() {
        super(new Tags.Region());
    }
}

export class VariantItemScope extends ItemScope<'variant', VariantSubtag, Items.RegisteredVariant> {
    public constructor() {
        super(new Tags.Variant());
    }
}

export class GrandfatheredTagScope extends ItemScope<'grandfathered', GrandfatheredTag, Items.RegisteredGrandfatheredTag> {
    public constructor() {
        super(new Tags.Grandfathered());
    }
}

export class RedundantTagScope extends ItemScope<'redundant', RedundantTag, Items.RegisteredRedundantTag> {
    public constructor() {
        super(new Tags.Redundant());
    }
}
