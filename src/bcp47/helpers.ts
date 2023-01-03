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

import { LanguageTag, LanguageTagInitOptions } from './languageTag';
import { LanguageMatcher } from './match';
import { Result } from '@fgv/ts-utils';
import { Subtags } from './common';

/**
 * Creates a new {@link Bcp47.LanguageTag | language tag} from either a specified `string` description
 * or from (typically parsed) individual {@link Bcp47.Subtags | subtags}.
 *
 * The supplied initializer must be at least
 * {@link https://www.rfc-editor.org/rfc/rfc5646.html#section-2.2.9 | well-formed according to RFC 5646}.
 * Higher degrees of validation along with any normalizations may be optionally specified.
 *
 * @param from - The `string` or {@link Bcp47.Subtags | subtags} from which
 * the processed tag is to be constructed.
 * @param options - (optional) The {@link Bcp47.LanguageTagInitOptions | options} used to construct
 * and validate the tag.
 * @returns `Success` with a valid {@link Bcp47.LanguageTag | language tag} or `Failure` with details
 * if an error occurs.
 * @public
 */
// istanbul ignore next - tests applied for wrapped function
export function tag(from: string | Subtags, options?: LanguageTagInitOptions): Result<LanguageTag> {
    return LanguageTag.create(from, options);
}

/**
 * Determine how well two language tags match each other.
 *
 * @param t1 - First tag to match, supplied as one of `string`, individual
 * {@link Bcp47.Subtags | subtags}, or constructed
 * {@link Bcp47.LanguageTag | language tag}.
 * @param t2 - Second tag to match, supplied as one of `string`, individual
 * {@link Bcp47.Subtags | subtags}, or constructed
 * {@link Bcp47.LanguageTag | language tag}.
 * @param options - (optional) A set of {@link Bcp47.LanguageTagInitOptions | language tag options}
 * which control any necessary conversion or parsing.
 * @returns A numeric value in the range 1.0 (exact match) to 0.0 (no match).
 * @see For a set of common levels of similarity, see {@link Bcp47.matchQuality | matchQuality}.
 * @public
 */
// istanbul ignore next - tests applied for wrapped function
export function match(
    t1: Subtags | LanguageTag | string,
    t2: Subtags | LanguageTag | string,
    options?: LanguageTagInitOptions
): Result<number> {
    return new LanguageMatcher().match(t1, t2, options);
}
