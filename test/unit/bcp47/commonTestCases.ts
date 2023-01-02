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

import {
    ExtLangSubtag,
    ExtendedLanguageRange,
    GrandfatheredTag,
    LanguageSubtag,
    RegionSubtag,
    ScriptSubtag,
    VariantSubtag,
} from '../../../src/iana/language-subtags';
import {
    GenericLanguageTagTest,
    GenericLanguageTagTestInit,
    allCanonicalTestKeys,
    allNonCanonicalTestKeys,
    allNonPreferredCanonicalKeys,
    allPreferredKeys,
    allTestKeys,
    allValidatingKeys,
} from './languageTagHelpers';
import { Subtags } from '../../../src/bcp47';

const testCaseInit: GenericLanguageTagTestInit<string>[] = [
    {
        description: 'valid canonical primary language',
        from: 'en',
        expected: [['en', allTestKeys]],
    },
    {
        description: 'valid non-canonical primary language',
        from: 'EN',
        expected: [
            ['EN', allNonCanonicalTestKeys],
            ['en', allCanonicalTestKeys],
        ],
    },
    {
        description: 'valid but deprecated primary language',
        from: 'in',
        expected: [
            ['in', [...allNonCanonicalTestKeys, ...allNonPreferredCanonicalKeys]],
            ['id', allPreferredKeys],
        ],
    },
    {
        description: 'invalid primary language',
        from: 'ENG-US',
        expected: [
            ['ENG-US', ['default', 'wellFormed']],
            ['eng-US', ['wellFormedCanonical']],
            [/invalid language/i, allValidatingKeys],
        ],
    },
    {
        description: 'valid canonical extlang',
        from: 'zh-cmn',
        expected: [
            ['zh-cmn', [...allNonCanonicalTestKeys, ...allNonPreferredCanonicalKeys]],
            ['cmn', allPreferredKeys],
        ],
    },
    {
        description: 'valid non-canonical extlang',
        from: 'ZH-Cmn',
        expected: [
            ['ZH-Cmn', allNonCanonicalTestKeys],
            ['zh-cmn', allCanonicalTestKeys],
            ['cmn', allPreferredKeys],
        ],
    },
    {
        description: 'invalid extlang',
        from: 'zh-Han',
        expected: [
            ['zh-Han', ['default', 'wellFormed']],
            ['zh-han', ['wellFormedCanonical']],
            [/invalid extlang/i, allValidatingKeys],
        ],
    },
    {
        description: 'valid extlang with invalid prefix',
        from: 'en-cmn-us',
        expected: [
            ['en-cmn-us', ['default', 'wellFormed', 'valid']],
            ['en-cmn-US', ['wellFormedCanonical', 'validCanonical', 'preferred']],
            [/invalid prefix/i, ['strictlyValid', 'strictlyValidCanonical', 'strictlyValidPreferred']],
        ],
    },
    {
        description: 'multiple extlang',
        from: 'zh-cmn-yue',
        expected: [
            ['zh-cmn-yue', ['default', 'wellFormed', 'wellFormedCanonical']],
            [/multiple extlang/i, allValidatingKeys],
        ],
    },
    {
        description: 'valid non-canonical, non-suppressed script',
        from: 'zh-LATN',
        expected: [
            ['zh-LATN', allNonCanonicalTestKeys],
            ['zh-Latn', allCanonicalTestKeys],
        ],
    },
    {
        description: 'valid non-canonical, suppressed script',
        from: 'en-LATN',
        expected: [
            ['en-LATN', allNonCanonicalTestKeys],
            ['en-Latn', allNonPreferredCanonicalKeys],
            ['en', allPreferredKeys],
        ],
    },
    {
        description: 'invalid script',
        from: 'en-AaaA',
        expected: [
            ['en-AaaA', ['default', 'wellFormed']],
            ['en-Aaaa', ['wellFormedCanonical']],
            [/invalid script/i, allValidatingKeys],
        ],
    },
    {
        description: 'valid non-canonical iso3166-2 region',
        from: 'en-aq',
        expected: [
            ['en-aq', allNonCanonicalTestKeys],
            ['en-AQ', allCanonicalTestKeys],
        ],
    },
    {
        description: 'valid non-canonical UN M.49 region',
        from: 'es-419',
        expected: [['es-419', allTestKeys]],
    },
    {
        description: 'invalid region',
        from: 'en-AJ',
        expected: [
            ['en-AJ', ['default', 'wellFormed', 'wellFormedCanonical']],
            [/invalid region/i, allValidatingKeys],
        ],
    },
    {
        description: 'strictly valid non-canonical variant',
        from: 'ca-Valencia',
        expected: [
            ['ca-Valencia', allNonCanonicalTestKeys],
            ['ca-valencia', allCanonicalTestKeys],
        ],
    },
    {
        description: 'not strictly-valid non-canonical variant',
        from: 'fr-Valencia',
        expected: [
            ['fr-Valencia', ['default', 'wellFormed', 'valid']],
            ['fr-valencia', ['wellFormedCanonical', 'validCanonical', 'preferred']],
            [/invalid prefix/i, ['strictlyValid', 'strictlyValidCanonical', 'strictlyValidPreferred']],
        ],
    },
    {
        description: 'valid but deprecated region',
        from: 'en-BU',
        expected: [
            ['en-BU', [...allNonCanonicalTestKeys, ...allNonPreferredCanonicalKeys]],
            ['en-MM', allPreferredKeys],
        ],
    },
    {
        description: 'any prefix for variant with no registered prefix',
        from: 'en-alalc97',
        expected: [['en-alalc97', allTestKeys]],
    },
    {
        description: 'strictly valid with two variants',
        from: 'SL-Rozaj-Lipaw',
        expected: [
            ['SL-Rozaj-Lipaw', allNonCanonicalTestKeys],
            ['sl-rozaj-lipaw', allCanonicalTestKeys],
        ],
    },
    {
        description: 'strictly valid with multiple variants',
        from: 'SL-Rozaj-biske-1994',
        expected: [
            ['SL-Rozaj-biske-1994', allNonCanonicalTestKeys],
            ['sl-rozaj-biske-1994', allCanonicalTestKeys],
        ],
    },
    {
        description: 'not strictly valid with multiple variants',
        from: 'SL-Rozaj-1996',
        expected: [
            ['SL-Rozaj-1996', ['default', 'wellFormed', 'valid']],
            ['sl-rozaj-1996', ['wellFormedCanonical', 'validCanonical', 'preferred']],
            [/invalid prefix/i, ['strictlyValid', 'strictlyValidCanonical', 'strictlyValidPreferred']],
        ],
    },
    {
        description: 'invalid variant',
        from: 'ca-ES-xyzzy',
        expected: [
            ['ca-ES-xyzzy', ['default', 'wellFormed', 'wellFormedCanonical']],
            [/invalid variant/i, allValidatingKeys],
        ],
    },
    {
        description: 'invalid variant',
        from: 'ca-valencia-valencia',
        expected: [
            ['ca-valencia-valencia', ['default', 'wellFormed', 'wellFormedCanonical']],
            [/duplicate variant/i, allValidatingKeys],
        ],
    },
    {
        description: 'valid extensions',
        from: 'en-us-u-en-US-t-MT',
        expected: [
            ['en-us-u-en-US-t-MT', allNonCanonicalTestKeys],
            ['en-US-u-en-US-t-mt', allCanonicalTestKeys],
        ],
    },
    {
        description: 'invalid extension',
        from: 'es-us-a-extend',
        expected: [
            ['es-us-a-extend', ['default', 'wellFormed']],
            ['es-US-a-extend', ['wellFormedCanonical']],
            [/invalid.*extension/i, allValidatingKeys],
        ],
    },
    {
        description: 'duplicate extension',
        from: 'es-us-u-US-u-GB',
        expected: [
            ['es-us-u-US-u-GB', ['default', 'wellFormed']],
            ['es-US-u-us-u-gb', ['wellFormedCanonical']],
            [/duplicate.*extension/i, allValidatingKeys],
        ],
    },
    {
        description: 'valid private-use subtag',
        from: 'en-x-Pig-Latin',
        expected: [
            ['en-x-Pig-Latin', allNonCanonicalTestKeys],
            ['en-x-pig-latin', allCanonicalTestKeys],
        ],
    },
    {
        description: 'valid grandfathered tag with no preferredValue',
        from: 'i-Mingo',
        expected: [
            ['i-Mingo', allNonCanonicalTestKeys],
            ['i-mingo', allCanonicalTestKeys],
        ],
    },
    {
        description: 'valid grandfathered tag with preferredValue',
        from: 'art-lojban',
        expected: [
            ['art-lojban', [...allNonCanonicalTestKeys, ...allNonPreferredCanonicalKeys]],
            ['jbo', allPreferredKeys],
        ],
    },
    {
        description: 'valid grandfathered tag with complex preferred value',
        from: 'en-gb-oed',
        expected: [
            ['en-gb-oed', allNonCanonicalTestKeys],
            ['en-GB-oed', allNonPreferredCanonicalKeys],
            ['en-GB-oxendict', allPreferredKeys],
        ],
    },
];

const subtagsTestCaseInit: GenericLanguageTagTestInit<Subtags>[] = [
    {
        description: 'valid non-canonical tag with suppressed script',
        from: {
            primaryLanguage: 'en' as LanguageSubtag,
            script: 'latn' as ScriptSubtag,
            region: 'us' as RegionSubtag,
            privateUse: ['Non-Canon' as ExtendedLanguageRange],
        },
        expected: [
            ['en-latn-us-x-Non-Canon', ['default', 'wellFormed', 'valid', 'strictlyValid']],
            ['en-Latn-US-x-non-canon', ['wellFormedCanonical', 'validCanonical', 'strictlyValidCanonical']],
            ['en-US-x-non-canon', ['preferred', 'strictlyValidPreferred']],
        ],
    },
    {
        description: 'missing primary language',
        from: { extlangs: ['cmn' as ExtLangSubtag, 'yue' as ExtLangSubtag] },
        expected: [[/missing primary language/i, allTestKeys]],
    },
    {
        // the grammar allows for up to three extlang tags but the specification reserves
        // and forbids them, so two tags only fails for validating forms.
        description: 'multiple extlang tags',
        from: { primaryLanguage: 'zh' as LanguageSubtag, extlangs: ['cmn', 'yue'] as ExtLangSubtag[] },
        expected: [
            ['zh-cmn-yue', ['default', 'wellFormed', 'wellFormedCanonical']],
            [/multiple extlang/, allValidatingKeys],
        ],
    },
    {
        // the grammar forbids > 3 extlang tags so this fails for all forms
        description: 'too many extlang tags',
        from: { primaryLanguage: 'zh' as LanguageSubtag, extlangs: ['cmn', 'yue', 'cdo', 'cjy'] as ExtLangSubtag[] },
        expected: [[/too many extlang/, allTestKeys]],
    },
    {
        description: 'invalid script tag',
        from: { primaryLanguage: 'en' as LanguageSubtag, script: 'Xyzy' as ScriptSubtag },
        expected: [
            ['en-Xyzy', ['default', 'preferred', 'wellFormed', 'wellFormedCanonical']],
            [/invalid script/i, allValidatingKeys],
        ],
    },
    {
        description: 'duplicate variant tags',
        from: { primaryLanguage: 'ca' as LanguageSubtag, variants: ['valencia', 'Valencia'] as VariantSubtag[] },
        expected: [
            ['ca-valencia-Valencia', ['default', 'wellFormed']],
            ['ca-valencia-valencia', ['wellFormedCanonical']],
            [/duplicate variant/, allValidatingKeys],
        ],
    },
    {
        description: 'invalid grandfathered tag',
        from: { grandfathered: 'i-dothraki' as GrandfatheredTag },
        expected: [
            ['i-dothraki', ['default', 'wellFormed', 'wellFormedCanonical']],
            [/invalid grandfathered/i, [...allValidatingKeys]],
        ],
    },
];

export const tagTestCases = testCaseInit.map(GenericLanguageTagTest.mapInitToTestCases);
export const subtagsTestCases = subtagsTestCaseInit.map(GenericLanguageTagTest.mapInitToTestCases);
