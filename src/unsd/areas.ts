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

import { IsoAlpha2RegionCode, IsoAlpha3RegionCode, UnM49RegionCode } from '../iana/model';
import { Result, fail, succeed } from '@fgv/ts-utils';
import { CountryOrArea } from './common';

/**
 * @public
 */
export class Areas {
    /**
     * @internal
     */
    protected _m49: Map<UnM49RegionCode, CountryOrArea> = new Map();

    /**
     * @internal
     */
    protected _isoAlpha2: Map<IsoAlpha2RegionCode, CountryOrArea> = new Map();

    /**
     * @internal
     */
    protected _isoAlpha3: Map<IsoAlpha3RegionCode, CountryOrArea> = new Map();

    public addArea(area: CountryOrArea): Result<CountryOrArea> {
        const existing = {
            m49: this._m49.get(area.code),
            alpha2: area.isoAlpha2 ? this._isoAlpha2.get(area.isoAlpha2) : undefined,
            alpha3: area.isoAlpha3 ? this._isoAlpha3.get(area.isoAlpha3) : undefined,
        };
        if (existing.m49) {
            return fail(`${area.name}: Region ${existing.m49.name} already exists with M.49 code ${area.code}`);
        } else if (existing.alpha2) {
            return fail(`${area.name}: Region ${existing.alpha2.name} already exists with ISO Alpha-2 code ${area.isoAlpha2}`);
        } else if (existing.alpha3) {
            return fail(`${area.name}: Region ${existing.alpha3.name} already exists with ISO Alpha-3 code ${area.isoAlpha3}`);
        }
        const added = { ...area };
        this._m49.set(area.code, added);
        if (area.isoAlpha2) {
            this._isoAlpha2.set(area.isoAlpha2, added);
        }
        if (area.isoAlpha3) {
            this._isoAlpha3.set(area.isoAlpha3, added);
        }
        area.parent.areas.push(added);
        return succeed(added);
    }

    public tryGetArea(from: UnM49RegionCode): CountryOrArea | undefined {
        return this._m49.get(from);
    }

    public tryGetAlpha2Area(from: IsoAlpha2RegionCode): CountryOrArea | undefined {
        return this._isoAlpha2.get(from.toUpperCase() as IsoAlpha2RegionCode);
    }

    public tryGetAlpha3Area(from: IsoAlpha3RegionCode): CountryOrArea | undefined {
        return this._isoAlpha3.get(from.toUpperCase() as IsoAlpha3RegionCode);
    }

    public getArea(from: UnM49RegionCode): Result<CountryOrArea> {
        const got = this._m49.get(from);
        return got ? succeed(got) : fail(`${from}: area not found`);
    }

    public getAlpha2Area(from: IsoAlpha2RegionCode): Result<CountryOrArea> {
        const got = this._isoAlpha2.get(from.toUpperCase() as IsoAlpha2RegionCode);
        return got ? succeed(got) : fail(`${from}: alpha-2 area not found`);
    }

    public getAlpha3Area(from: IsoAlpha3RegionCode): Result<CountryOrArea> {
        const got = this._isoAlpha3.get(from.toUpperCase() as IsoAlpha3RegionCode);
        return got ? succeed(got) : fail(`${from}: alpha-3 area not found`);
    }

    public getAll(): CountryOrArea[] {
        return Array.from(this._m49.values());
    }
}
