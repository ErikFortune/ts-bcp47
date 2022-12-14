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

import * as Validate from './validate';

import { BaseConverter, Converter, Converters, Result, fail, mapResults } from '@fgv/ts-utils';

export const isoAlpha2RegionCode = Converters.string.map(Validate.isoAlpha2RegionCode);
export const isoAlpha3RegionCode = Converters.string.map(Validate.isoAlpha3RegionCode);
export const unM49RegionCode = Converters.string.map(Validate.unM49RegionCode);

export const languageSubtag = Converters.string.map(Validate.languageSubtag);
export const extLangSubtag = Converters.string.map(Validate.extLangSubtag);
export const scriptSubtag = Converters.string.map(Validate.scriptSubtag);
export const regionSubtag = Converters.string.map(Validate.regionSubtag);
export const variantSubtag = Converters.string.map(Validate.variantSubtag);

export const grandfatheredTag = Converters.string.map(Validate.grandfatheredTag);
export const redundantTag = Converters.string.map(Validate.redundantTag);

export function rangeOfTags<TTAG extends string>(tagConverter: Converter<TTAG>): Converter<TTAG[]> {
    return new BaseConverter<TTAG[]>((from: unknown): Result<TTAG[]> => {
        if (typeof from !== 'string') {
            return fail('tagRange converter: not a string');
        }

        const parts = from.split('..');
        if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
            return fail(`"${from}: malformed tag range`);
        }

        return mapResults(parts.map((tag) => tagConverter.convert(tag)));
    });
}

export function tagOrRange<TTAG extends string>(tagConverter: Converter<TTAG>): Converter<TTAG | TTAG[]> {
    return Converters.oneOf<TTAG | TTAG[]>([tagConverter, rangeOfTags(tagConverter)]);
}
