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

import { BaseConverter, Converter, Converters, Result, fail, mapResults, succeed } from '@fgv/ts-utils';

export const languageSubtag = Validate.languageSubtag.converter;
export const extlangSubtag = Validate.extlangSubtag.converter;
export const scriptSubtag = Validate.scriptSubtag.converter;
export const regionSubtag = Validate.regionSubtag.converter;
export const variantSubtag = Validate.variantSubtag.converter;

export const grandfatheredTag = Validate.grandfatheredTag.converter;
export const redundantTag = Validate.redundantTag.converter;

export const extendedLanguageRange = Validate.extendedLanguageRange.converter;

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

export function tagOrStartOfTagRange<TTAG extends string>(tagConverter: Converter<TTAG>): Converter<TTAG> {
    return tagOrRange(tagConverter).map((t) => (Array.isArray(t) ? succeed(t[0]) : succeed(t)));
}

export function endOfTagRangeOrUndefined<TTAG extends string>(tagConverter: Converter<TTAG>): Converter<TTAG | undefined> {
    return tagOrRange(tagConverter).map((t) => (Array.isArray(t) ? succeed(t[1]) : succeed(undefined)));
}
