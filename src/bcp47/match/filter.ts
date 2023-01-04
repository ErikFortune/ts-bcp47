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

import * as Iana from '../../iana';

import { LanguageMatcher } from './match';
import { LanguageTag } from '../languageTag';
import { Subtags } from '../common';

/**
 * @public
 */
export interface FilteredLanguage {
    quality: number;
    tag: string;
    languageTag: LanguageTag;
}

/**
 * @public
 */
export interface LanguageFilterOptions {
    use?: 'desiredLanguage' | 'availableLanguage';
    filter?: 'primaryLanguage' | 'none';
    ultimateFallback?: string | Subtags | LanguageTag;
}

/**
 * @public
 */
export const defaultLanguageFilterOptions: LanguageFilterOptions = Object.freeze({
    use: 'availableLanguage',
    filter: 'primaryLanguage',
});

/**
 * @public
 */
export class LanguageFilter {
    protected readonly _matcher: LanguageMatcher;

    public constructor(iana?: Iana.LanguageRegistries) {
        this._matcher = new LanguageMatcher(iana);
    }

    public filterLanguageTagsWithDetails(
        desiredLanguages: LanguageTag[],
        availableLanguages: LanguageTag[],
        options?: LanguageFilterOptions
    ): FilteredLanguage[] {
        const matched = new Map<string, FilteredLanguage>();
        const decrement = desiredLanguages.length < 10 ? 0.1 : 1.0 / desiredLanguages.length;
        let base = 1.0;

        // fill any missing fields from the default
        options = { ...defaultLanguageFilterOptions, ...options };

        for (const want of desiredLanguages) {
            base -= decrement;
            for (const have of availableLanguages) {
                const similarity = this._matcher.matchLanguageTags(want, have);
                if (similarity > 0.0) {
                    const quality = base + similarity * decrement;
                    const languageTag = options.use === 'availableLanguage' ? have : want;
                    const tag = languageTag.tag;
                    const key = options.filter === 'primaryLanguage' ? languageTag.subtags.primaryLanguage ?? tag : tag;

                    const match: FilteredLanguage = {
                        quality,
                        tag,
                        languageTag,
                    };

                    const existing = matched.get(key);
                    if (!existing || existing.quality < quality) {
                        matched.set(key, match);
                    }
                }
            }
        }

        const values = Array.from(matched.values());
        if (values.length > 1) {
            // want descending order
            values.sort((m1, m2) => m2.quality - m1.quality);
        } else if (values.length === 0 && options.ultimateFallback) {
            const languageTag =
                options.ultimateFallback instanceof LanguageTag
                    ? options.ultimateFallback
                    : LanguageTag.create(options.ultimateFallback).orDefault();
            if (languageTag) {
                return [{ languageTag, tag: languageTag.tag, quality: 0 }];
            }
        }
        return values;
    }

    public filterLanguageTags(
        desiredLanguages: LanguageTag[],
        availableLanguages: LanguageTag[],
        options?: LanguageFilterOptions
    ): LanguageTag[] {
        return this.filterLanguageTagsWithDetails(desiredLanguages, availableLanguages, options).map((t) => t.languageTag);
    }
}
