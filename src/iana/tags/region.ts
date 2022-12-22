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

import { IsoAlpha2RegionCode, IsoAlpha3RegionCode, RegionSubtag, UnM49RegionCode } from './common';
import { Result, fail, succeed } from '@fgv/ts-utils';

import { TagOrSubtag } from './tagOrSubtag';

export class Region implements TagOrSubtag<'region', RegionSubtag> {
    public static readonly wellFormedAlpha2 = /^[A-Za-z]{2}$/;
    public static readonly canonicalAlpha2 = /^[A-Z]{2}$/;
    public static readonly wellFormedAlpha3 = /^[A-Za-z]{3}$/;
    public static readonly canonicalAlpha3 = /^[A-Z]{3}$/;
    public static readonly wellFormedUnM49 = /^[0-9]{3}$/;
    public static readonly canonicalUnM49 = /^[0-9]{3}$/;

    // region is alpha-2, alpha-3 or 3-digit, canonical is upper case
    public static readonly wellFormed = /^([A-Za-z]{2,3})$|^([0-9]{3})$/;
    public static readonly canonical = /^([A-Z]{2,3})$|^([0-9]{3})$/;

    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    public readonly type: 'region' = 'region';
    public readonly isSubtag: boolean = true;

    public isAlpha2RegionCode(val: unknown): val is IsoAlpha2RegionCode {
        return typeof val === 'string' && val.length === 2 && /^[A-Za-z]{2}$/.test(val);
    }

    public isAlpha3RegionCode(val: unknown): val is IsoAlpha3RegionCode {
        return typeof val === 'string' && val.length === 3 && /^[A-Za-z]{3}$/.test(val);
    }

    public isUnM49RegionCode(val: unknown): val is UnM49RegionCode {
        return typeof val === 'string' && val.length === 3 && /^[0-9]{3}$/.test(val);
    }

    public isWellFormed(val: unknown): val is RegionSubtag {
        return typeof val === 'string' && Region.wellFormed.test(val);
    }

    public isCanonical(val: unknown): val is RegionSubtag {
        return typeof val === 'string' && Region.canonical.test(val);
    }

    public toCanonical(val: unknown): Result<RegionSubtag> {
        if (this.isWellFormed(val)) {
            return succeed(val.toUpperCase() as RegionSubtag);
        }
        return fail(`"${val}: malformed region subtag`);
    }
}
