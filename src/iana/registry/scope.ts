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

import * as Model from '../model';
import * as Tags from '../tags';

import { ExtLangSubtag, GrandfatheredTag, LanguageSubtag, RedundantTag, RegionSubtag, ScriptSubtag, VariantSubtag } from '../common';
import { Result } from '@fgv/ts-utils';

export class Scope<TTYPE extends Model.RegistryEntryType, TTAG extends string, TENTRY extends Model.RegistryEntry> {
    protected readonly _items: Map<TTAG, TENTRY>;
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

    public getAll(): TENTRY[] {
        return Array.from(this._items.values());
    }

    public tryGet(want: string): TENTRY | undefined {
        return this._items.get(want as TTAG);
    }

    public add(tags: TTAG | TTAG[], entry: TENTRY): void {
        for (const tag of Scope._expandRange(tags)) {
            this._items.set(tag, entry);
        }
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
}

export class LanguageScope extends Scope<'language', LanguageSubtag, Model.LanguageSubtagRegistryEntry> {
    public constructor() {
        super(new Tags.Language());
    }
}

export class ExtLangScope extends Scope<'extlang', ExtLangSubtag, Model.ExtLangSubtagRegistryEntry> {
    public constructor() {
        super(new Tags.ExtLang());
    }
}

export class ScriptScope extends Scope<'script', ScriptSubtag, Model.ScriptSubtagRegistryEntry> {
    public constructor() {
        super(new Tags.Script());
    }
}

export class RegionScope extends Scope<'region', RegionSubtag, Model.RegionSubtagRegistryEntry> {
    public constructor() {
        super(new Tags.Region());
    }
}

export class VariantScope extends Scope<'variant', VariantSubtag, Model.VariantSubtagRegistryEntry> {
    public constructor() {
        super(new Tags.Variant());
    }
}

export class GrandfatheredScope extends Scope<'grandfathered', GrandfatheredTag, Model.GrandfatheredTagRegistryEntry> {
    public constructor() {
        super(new Tags.Grandfathered());
    }
}

export class RedundantScope extends Scope<'redundant', RedundantTag, Model.RedundantTagRegistryEntry> {
    public constructor() {
        super(new Tags.Redundant());
    }
}
