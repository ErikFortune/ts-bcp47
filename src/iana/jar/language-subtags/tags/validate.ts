/*
 * Copyright (c) 2021 Erik Fortune
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
    RedundantTag,
    RegionSubtag,
    ScriptSubtag,
    VariantSubtag,
} from './model';

import { RegExpValidationHelpers, ValidationHelpers } from '../../../../utils';
import { Result, succeed } from '@fgv/ts-utils';

/**
 * @internal
 */
export const languageSubtag = new RegExpValidationHelpers<LanguageSubtag>({
    description: 'language subtag',
    wellFormed: /^[A-Za-z]{2,3}$/,
    canonical: /^[a-z]{2,3}$/,
    toCanonical: (from: LanguageSubtag) => succeed(from.toLowerCase() as LanguageSubtag),
});

/**
 * @internal
 */
export const extlangSubtag = new RegExpValidationHelpers<ExtLangSubtag>({
    description: 'extlang subtag',
    wellFormed: /^[A-Za-z]{3}$/,
    canonical: /^[a-z]{3}$/,
    toCanonical: (from: ExtLangSubtag) => succeed(from.toLowerCase() as ExtLangSubtag),
});

/**
 * @internal
 */
export const scriptSubtag = new RegExpValidationHelpers<ScriptSubtag>({
    description: 'script subtag',
    wellFormed: /^[A-Za-z]{4}$/,
    canonical: /^[A-Z][a-z]{3}$/,
    toCanonical: (from: ScriptSubtag) => {
        return succeed(`${from[0].toUpperCase()}${from.slice(1).toLowerCase()}` as ScriptSubtag);
    },
});

/**
 * @internal
 */
export const regionSubtag = new RegExpValidationHelpers<RegionSubtag>({
    description: 'region subtag',
    wellFormed: /^([A-Za-z]{2,3})$|^([0-9]{3})$/,
    canonical: /^([A-Z]{2,3})$|^([0-9]{3})$/,
    toCanonical: (from: RegionSubtag) => succeed(from.toUpperCase() as RegionSubtag),
});

/**
 * @internal
 */
export const variantSubtag = new RegExpValidationHelpers<VariantSubtag>({
    description: 'variant subtag',
    wellFormed: /^([A-Za-z0-9]{5,8})$|^([0-9][A-Za-z0-9]{3})$/,
    canonical: /^([a-z0-9]{5,8})$|^([0-9][a-z0-9]{3})$/,
    toCanonical: (from: VariantSubtag) => succeed(from.toLowerCase() as VariantSubtag),
});

class TagValidationHelpers<T extends string, TC = unknown> extends ValidationHelpers<T, TC> {
    public readonly wellFormed: RegExp = /^([A-Za-z][A-Za-z0-9-]{0,7})(-[A-Za-z][A-Za-z0-9-]{0,7})*$/;

    public constructor(description: string) {
        super({
            description,
            toCanonical: TagValidationHelpers.toCanonicalTag,
            isWellFormed: (from: unknown): from is T => {
                return typeof from === 'string' && this.wellFormed.test(from);
            },
            isCanonical: (from: unknown): from is T => {
                if (this.isWellFormed(from)) {
                    const result = this.toCanonical(from);
                    if (result.isSuccess()) {
                        return result.value === from;
                    }
                }
                return false;
            },
        });
    }

    public static toCanonicalTag<T extends string>(val: T): Result<T> {
        const parts = val.split('-');
        const canonical: string[] = [];
        let isInitial = true;
        for (const part of parts) {
            if (isInitial || (part.length !== 2 && part.length !== 4)) {
                canonical.push(part.toLowerCase());
            } else if (part.length === 2) {
                canonical.push(part.toUpperCase());
            } else if (part.length === 4) {
                canonical.push(`${part[0].toUpperCase()}${part.slice(1).toLowerCase()}`);
            }
            isInitial = part.length === 1;
        }
        return succeed(canonical.join('-') as T);
    }
}

/**
 * @internal
 */
export const grandfatheredTag = new TagValidationHelpers<GrandfatheredTag>('grandfathered tag');

/**
 * @internal
 */
export const redundantTag = new TagValidationHelpers<RedundantTag>('redundant tag');

/**
 * @internal
 */
export const extendedLanguageRange = new TagValidationHelpers<ExtendedLanguageRange>('extended language range');
