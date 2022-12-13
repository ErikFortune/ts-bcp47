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

import * as Model from './model';

export class Scope<TTAG extends string, TENTRY extends Model.RegistryEntry> {
    protected readonly _items: Map<TTAG, TENTRY>;

    public constructor(items?: Map<TTAG, TENTRY>) {
        this._items = items ?? new Map();
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
}
