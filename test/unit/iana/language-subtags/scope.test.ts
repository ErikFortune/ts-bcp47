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

import { ExtLangSubtag, ExtendedLanguageRange, LanguageSubtag, LanguageSubtagRegistry } from '../../../../src/iana/language-subtags';
import { YearMonthDaySpec } from '../../../../src/iana/common/model';

describe('IANA tag registry scope', () => {
    const iana = LanguageSubtagRegistry.loadJsonRegistryFile('data/iana/language-subtag-registry.json').getValueOrThrow();
    const languages = iana.languages;

    describe('getAll and getAllKeys', () => {
        test('tags match values', () => {
            const tags = languages.getAllKeys();
            const records = languages.getAll();
            expect(tags.length).toEqual(records.length);
            for (let i = 0; i < tags.length; i++) {
                if (Array.isArray(records[i].subtag)) {
                    expect(records[i].subtag).toContain(tags[i]);
                } else {
                    expect(records[i].subtag).toEqual(tags[i]);
                }
            }
        });
    });

    describe('tryGet', () => {
        test('retrieves valid values only in canonical or non-canonical form', () => {
            for (const tag of languages.getAllKeys()) {
                expect(languages.tryGet(tag)).toBeDefined();
                expect(languages.tryGet(tag.toUpperCase())).toBeDefined();
            }
        });

        test('returns undefined for undefined', () => {
            expect(languages.tryGet(undefined)).toBe(undefined);
        });
    });

    describe('tryGetCanonical', () => {
        test('retrieves valid values only in canonical form', () => {
            for (const tag of languages.getAllKeys()) {
                expect(languages.tryGetCanonical(tag)).toBeDefined();
                expect(languages.tryGetCanonical(tag.toUpperCase())).not.toBeDefined();
            }
        });

        test('returns undefined for undefined', () => {
            expect(languages.tryGetCanonical(undefined)).toBe(undefined);
        });
    });

    describe('get', () => {
        test('retrieves valid values in canonical or non-canonical form', () => {
            for (const tag of languages.getAllKeys()) {
                expect(languages.get(tag)).toSucceed();
                expect(languages.get(tag.toUpperCase())).toSucceed();
            }
        });

        test('returns an error for an unknown value', () => {
            expect(languages.get('xyzzy')).toFailWith(/invalid language/i);
        });
    });

    describe('getCanonical', () => {
        test('retrieves valid values only in canonical form', () => {
            for (const tag of languages.getAllKeys()) {
                expect(languages.getCanonical(tag)).toSucceed();
                expect(languages.getCanonical(tag.toUpperCase())).toFail();
            }
        });
    });

    describe('validation methods', () => {
        test.each([
            [true, 'feh', 'well-formed, canonical invalid'],
            [true, 'en', 'well-formed, canonical valid'],
            [true, 'EN', 'well-formed, non-canonical valid'],
            [false, '001', 'malformed'],
        ])('isWellFormed returns %p for %p (%p)', (expected, tag) => {
            expect(languages.isWellFormed(tag)).toEqual(expected);
        });

        test.each([
            [true, 'feh', 'well-formed=, canonical invalid'],
            [true, 'en', 'well-formed, canonical valid'],
            [false, 'EN', 'well-formed, non-canonical valid'],
            [false, '001', 'malformed'],
        ])('isCanonical returns %p for %p (%p)', (expected, tag) => {
            expect(languages.isCanonical(tag)).toEqual(expected);
        });

        test.each([
            [false, 'feh', 'well-formed, canonical invalid'],
            [true, 'en', 'well-formed, canonical valid'],
            [true, 'EN', 'well-formed, non-canonical valid'],
            [false, '001', 'malformed'],
        ])('isValid returns %p for %p (%p)', (expected, tag) => {
            expect(languages.isValid(tag)).toEqual(expected);
        });

        test.each([
            [false, 'feh', 'well-formed, canonical invalid'],
            [true, 'en', 'well-formed, canonical valid'],
            [false, 'EN', 'well-formed, non-canonical valid'],
            [false, '001', 'malformed'],
        ])('isValidCanonical returns %p for %p (%p)', (expected, tag) => {
            expect(languages.isValidCanonical(tag)).toEqual(expected);
        });
    });

    describe('conversion methods', () => {
        test.each([
            ['en', 'en', 'well-formed, canonical valid'],
            ['EN', 'en', 'well-formed, non-canonical valid'],
        ])('toValidCanonical converts %p to %p (%p)', (tag, expected) => {
            expect(languages.toValidCanonical(tag)).toSucceedWith(expected as LanguageSubtag);
        });

        test.each([
            ['feh', /invalid language/i],
            ['001', /invalid language/i],
        ])('toValidCanonical fails for %p (%p)', (tag, expected) => {
            expect(languages.toValidCanonical(tag)).toFailWith(expected);
        });
    });

    describe('add method', () => {
        const iana2 = LanguageSubtagRegistry.load('data/iana/language-subtags.json').getValueOrThrow();
        const extlangs = iana2.extlangs;
        test('fails to add an item with a non-canonical tag', () => {
            const validNonCanonical = 'DEU' as ExtLangSubtag;
            expect(
                extlangs.add({
                    type: 'extlang',
                    subtag: validNonCanonical,
                    description: ['test data'],
                    added: '2022-12-01' as YearMonthDaySpec,
                    preferredValue: 'deu' as ExtendedLanguageRange,
                    prefix: 'en' as LanguageSubtag,
                })
            ).toFailWith(/not in canonical form/i);
        });
    });
});
