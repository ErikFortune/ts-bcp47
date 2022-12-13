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

import { Result, succeed } from '@fgv/ts-utils';
import { Model } from '..';

import { RegionSubtag } from '../model';
import { TagOrSubtag } from './tagOrSubtag';

export class Region implements TagOrSubtag<'region', RegionSubtag> {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    public readonly type: 'region' = 'region';
    public readonly isSubtag: boolean = true;

    public isAlpha2RegionCode(val: unknown): val is Model.IsoAlpha2RegionCode {
        return typeof val === 'string' && val.length === 2 && /^[A-Za-z]{2}$/.test(val);
    }

    public isAlpha3RegionCode(val: unknown): val is Model.IsoAlpha3RegionCode {
        return typeof val === 'string' && val.length === 3 && /^[A-Za-z]{3}$/.test(val);
    }

    public isUnM49RegionCode(val: unknown): val is Model.UnM49RegionCode {
        return typeof val === 'string' && val.length === 3 && /^[0-9]{3}$/.test(val);
    }

    public isWellFormed(val: unknown): val is RegionSubtag {
        return this.isAlpha2RegionCode(val) || this.isAlpha3RegionCode(val) || this.isUnM49RegionCode(val);
    }

    public isCanonical(val: unknown): val is RegionSubtag {
        // canonical form is upper case
        return this.isWellFormed(val) && val.toUpperCase() === val;
    }

    public toCanonical(val: unknown): Result<RegionSubtag> {
        if (this.isWellFormed(val)) {
            return succeed(val.toUpperCase() as RegionSubtag);
        }
        return fail(`"${val}: not a well-formed region subtag`);
    }
}
