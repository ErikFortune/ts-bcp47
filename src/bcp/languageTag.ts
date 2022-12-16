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

import * as Iana from '../iana';

import { Result, captureResult, succeed } from '@fgv/ts-utils';

export interface ExtensionTag {
    readonly singleton: string;
    readonly value: string;
}

export interface LanguageTagParts {
    readonly primaryLanguage?: Iana.Tags.LanguageSubtag;
    readonly extlangs?: Iana.Tags.ExtLangSubtag[];
    readonly script?: Iana.Tags.ScriptSubtag;
    readonly region?: Iana.Tags.RegionSubtag;
    readonly variants?: Iana.Tags.Variant[];
    readonly extensions?: ExtensionTag[];
    readonly private?: string[];

    readonly grandfathered?: Iana.Tags.GrandfatheredTag;
}

export class LanguageTag {
    public readonly primaryLanguage?: Iana.Tags.LanguageSubtag;
    public readonly extlangs?: Iana.Tags.ExtLangSubtag[];
    public readonly script?: Iana.Tags.ScriptSubtag;
    public readonly region?: Iana.Tags.RegionSubtag;
    public readonly variants?: Iana.Tags.Variant[];
    public readonly extensions?: ExtensionTag[];
    public readonly private?: string[];

    public readonly grandfathered?: Iana.Tags.GrandfatheredTag;

    protected constructor(init: LanguageTagParts) {
        this.primaryLanguage = init.primaryLanguage;
        this.extlangs = init.extlangs;
        this.script = init.script;
        this.region = init.region;
        this.variants = init.variants;
        this.extensions = init.extensions;
        this.private = init.private;
        this.grandfathered = init.grandfathered;
    }

    public static parse(_tag: string, _registry: Iana.TagRegistry): Result<LanguageTagParts> {
        // const subtags = tag.split('-');
        const parts: LanguageTagParts = {};

        // first tag must be primary language
        /*
        let next = subtags.shift();
        if (!registry.languages.isWellFormed(next)) {
            if (next === 'i' || next === 'I') {
                const grandfathered = registry.grandfathered.tryGet(tag);
                if (grandfathered) {
                    return { grandfathered: grandfathered.Tag };
                }
            }
        }
        */
        return succeed(parts);
    }

    public static create(tag: string, registry: Iana.TagRegistry): Result<LanguageTag> {
        return captureResult(() => {
            const parts = LanguageTag.parse(tag, registry).getValueOrThrow();
            return new LanguageTag(parts);
        });
    }
}
