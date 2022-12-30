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
import { Converters, Result, succeed } from '@fgv/ts-utils';
import { Converters as IanaConverters } from '../../iana';
import { RegionTier } from '../model';
import { readCsvFileSync } from '@fgv/ts-utils/csvHelpers';

export const regionTier = Converters.enumeratedValue<RegionTier>(['global', 'intermediateRegion', 'region', 'subRegion']);

const optionalString = Converters.string.optional('ignoreErrors');
const optionalUnM49RegionCode = IanaConverters.unM49RegionCode.optional('ignoreErrors');
const optionalIsoAlpha2RegionCode = IanaConverters.isoAlpha2RegionCode.optional('ignoreErrors');
const optionalIsoAlpha3RegionCode = IanaConverters.isoAlpha3RegionCode.optional('ignoreErrors');

export const m49CsvRow = Converters.transform<Model.M49CsvRow>({
    globalCode: Converters.element(0, IanaConverters.unM49RegionCode),
    globalName: Converters.element(1, Converters.string),
    regionCode: Converters.element(2, optionalUnM49RegionCode),
    regionName: Converters.element(3, optionalString),
    subRegionCode: Converters.element(4, optionalUnM49RegionCode),
    subRegionName: Converters.element(5, optionalString),
    intermediateRegionCode: Converters.element(6, optionalUnM49RegionCode),
    intermediateRegionName: Converters.element(7, optionalString),
    countryOrArea: Converters.element(8, Converters.string),
    m49Code: Converters.element(9, IanaConverters.unM49RegionCode),
    isoAlpha2RegionCode: Converters.element(10, optionalIsoAlpha2RegionCode),
    isoAlpha3RegionCode: Converters.element(11, optionalIsoAlpha3RegionCode),
    leastDevelopedCountry: Converters.element(12, Converters.string).map((s) => succeed(s === 'x')),
    landLockedDevelopingCountry: Converters.element(13, Converters.string).map((s) => succeed(s === 'x')),
    smallIslandDevelopingState: Converters.element(14, Converters.string).map((s) => succeed(s === 'x')),
});

export const m49CsvFile = Converters.arrayOf(m49CsvRow);

export const countryOrAreaRecord = Converters.strictObject<Model.CountryOrAreaRecord>({
    name: Converters.string,
    m49Code: IanaConverters.unM49RegionCode,
    isoAlpha2RegionCode: IanaConverters.isoAlpha2RegionCode,
    isoAlpha3RegionCode: IanaConverters.isoAlpha3RegionCode,
    region: IanaConverters.unM49RegionCode,
    leastDevelopedCountry: Converters.boolean,
    landLockedDevelopingCountry: Converters.boolean,
    smallIslandDevelopingState: Converters.boolean,
});

export const regionRecord = Converters.strictObject<Model.RegionRecord>(
    {
        name: Converters.string,
        m49Code: IanaConverters.unM49RegionCode,
        tier: regionTier,
        parent: IanaConverters.unM49RegionCode,
        regions: Converters.arrayOf(IanaConverters.unM49RegionCode),
        areas: Converters.arrayOf(IanaConverters.unM49RegionCode),
    },
    { optionalFields: ['parent'] }
);

export function loadM49cnvFileSync(csvPath: string): Result<Model.M49CsvRow[]> {
    return readCsvFileSync(csvPath, { delimiter: ';' }).onSuccess((csv) => {
        return m49CsvFile.convert(csv);
    });
}
