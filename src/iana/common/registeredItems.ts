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

import { Result, fail, succeed } from '@fgv/ts-utils';
import { ValidationHelpers } from '../../utils';

/**
 * @internal
 */
export abstract class RegisteredItemScope<TTYPE extends string, TKEY extends string, TITEM> {
    protected readonly _items: Map<TKEY, TITEM>;
    protected readonly _type: TTYPE;
    protected readonly _validate: ValidationHelpers<TKEY>;

    protected constructor(type: TTYPE, validate: ValidationHelpers<TKEY>) {
        this._items = new Map();
        this._type = type;
        this._validate = validate;
    }

    public getAllKeys(): TKEY[] {
        return Array.from(this._items.keys());
    }

    public getAll(): TITEM[] {
        return Array.from(this._items.values());
    }

    public tryGet(want: string): TITEM | undefined {
        const got = this._items.get(want as TKEY);
        if (!got) {
            const result = this.toCanonical(want);
            if (result.isSuccess()) {
                return this._items.get(result.value as TKEY);
            }
        }
        return got;
    }

    public tryGetCanonical(want: string): TITEM | undefined {
        return this._items.get(want as TKEY);
    }

    public isWellFormed(val: unknown): val is TKEY {
        return this._validate.isWellFormed(val);
    }

    public isCanonical(val: unknown): val is TKEY {
        return this._validate.isCanonical(val);
    }

    public toCanonical(val: unknown): Result<TKEY> {
        return this._validate.toCanonical(val);
    }

    public toValidCanonical(val: unknown): Result<TKEY> {
        return this._validate.toCanonical(val).onSuccess((canonical) => {
            if (this._items.has(canonical)) {
                return succeed(canonical);
            }
            return fail(`${val}: invalid ${this._type}`);
        });
    }

    public isValid(val: unknown): val is TKEY {
        const result = this.toCanonical(val);
        if (result.isSuccess()) {
            return this._items.has(result.value);
        }
        return false;
    }

    public isValidCanonical(val: unknown): val is TKEY {
        if (this.isCanonical(val)) {
            return this._items.has(val);
        }
        return false;
    }

    protected _validateKey(key: TKEY): Result<true> {
        if (!this.isCanonical(key)) {
            return fail(`${key}: ${this._type} is not in canonical form`);
        }
        return succeed(true);
    }

    public abstract add(entry: TITEM): Result<true>;
    protected abstract _validateEntry(entry: TITEM): Result<true>;
}