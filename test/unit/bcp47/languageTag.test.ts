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

import '@fgv/ts-utils-jest';
import * as Iana from '../../../src/iana';
import { LanguageTag } from '../../../src/bcp47';

describe('LanguageTag class', () => {
    const iana = Iana.IanaRegistries.load('data/iana').getValueOrThrow();

    describe('create method', () => {
        describe('well-formed, validated, canonical and script properties', () => {
            xtest.each([
                ['en-US', 'en-US', 'en-US', 'en-US', 'Latn'],
                ['en-latn-us', 'en-latn-us', 'en-Latn-US', 'en-US', 'Latn'],
                ['en-gb-oed', 'en-GB-oed', 'en-GB-oed', 'en-GB-oxendict', 'Latn'],
            ])('%p yields well-formed %p, canonical %p, script %p', (from, wellFormed, valid, canonical, script) => {
                expect(LanguageTag.create(from, iana)).toSucceedAndSatisfy((tag) => {
                    expect(tag.wellFormed.tag).toEqual(wellFormed);
                    expect(tag.validated?.tag).toEqual(valid);
                    expect(tag.canonical?.tag).toEqual(canonical);
                    expect(tag.script).toEqual(script);
                });
            });
        });
    });
});
