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

import * as Model from './csv/model';

import { Result, allSucceed, succeed } from '@fgv/ts-utils';

import { Areas } from './areas';
import { Regions } from './regions';
import { loadM49cnvFileSync } from './csv/converters';

export class RegionCodes {
    public readonly regions: Regions;
    public readonly areas: Areas;

    protected constructor() {
        this.regions = new Regions();
        this.areas = new Areas();
    }

    public static createFromCsvFile(path: string): Result<RegionCodes> {
        return loadM49cnvFileSync(path).onSuccess((rows) => {
            return this.createFromCsv(rows);
        });
    }

    public static createFromCsv(rows: Model.M49CsvRow[]): Result<RegionCodes> {
        const codes = new RegionCodes();
        return codes._importRows(rows).onSuccess(() => {
            return succeed(codes);
        });
    }

    protected _importRow(row: Model.M49CsvRow): Result<true> {
        return this.regions
            .getOrAddRegionChildRegion('region', this.regions.global, row.regionCode, row.regionName)
            .onSuccess((region) => {
                return this.regions.getOrAddRegionChildRegion('subRegion', region, row.subRegionCode, row.subRegionName);
            })
            .onSuccess((region) => {
                return this.regions.getOrAddRegionChildRegion(
                    'intermediateRegion',
                    region,
                    row.intermediateRegionCode,
                    row.intermediateRegionName
                );
            })
            .onSuccess((region) => {
                return this.areas.addArea({
                    name: row.countryOrArea,
                    code: row.m49Code,
                    tier: 'area',
                    parent: region,
                    isoAlpha2: row.isoAlpha2RegionCode,
                    isoAlpha3: row.isoAlpha3RegionCode,
                    leastDevelopedCountry: row.leastDevelopedCountry,
                    landlockedDevelopingCountry: row.landLockedDevelopingCountry,
                    smallIslandDevelopingState: row.smallIslandDevelopingState,
                });
            })
            .onSuccess(() => {
                return succeed(true);
            });
    }

    protected _importRows(rows: Model.M49CsvRow[]): Result<true> {
        return allSucceed(
            rows.map((row) => this._importRow(row)),
            true
        );
    }
}
