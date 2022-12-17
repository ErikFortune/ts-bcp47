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

import { Result, captureResult, fail, succeed } from '@fgv/ts-utils';

export interface ExtensionTag {
    readonly singleton: string;
    readonly value: string;
}

export interface LanguageTagParts {
    primaryLanguage?: Iana.Tags.LanguageSubtag;
    extlangs?: Iana.Tags.ExtLangSubtag[];
    script?: Iana.Tags.ScriptSubtag;
    region?: Iana.Tags.RegionSubtag;
    variants?: Iana.Tags.VariantSubtag[];
    extensions?: ExtensionTag[];
    private?: string[];

    grandfathered?: Iana.Tags.GrandfatheredTag;
}

export class LanguageTag {
    public readonly primaryLanguage?: Iana.Tags.LanguageSubtag;
    public readonly extlangs?: Iana.Tags.ExtLangSubtag[];
    public readonly script?: Iana.Tags.ScriptSubtag;
    public readonly region?: Iana.Tags.RegionSubtag;
    public readonly variants?: Iana.Tags.VariantSubtag[];
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

    public static parse(tag: string, iana: Iana.TagRegistry): Result<LanguageTagParts> {
        const subtags = tag.split('-');
        const parts: Partial<LanguageTagParts> = {};

        // first tag must be primary language
        let next = subtags.shift();
        if (iana.languages.isWellFormed(next)) {
            parts.primaryLanguage = next;
            next = subtags.shift();
        } else if (next === 'i' || next === 'I') {
            const grandfathered = iana.grandfathered.tryGet(tag);
            if (grandfathered) {
                return succeed({ grandfathered: grandfathered.tag });
            }
            return fail(`${tag}: unrecognized grandfathered tag`);
        } else {
            return fail(`${tag}: no primary language subtag`);
        }

        while (iana.extlangs.isWellFormed(next)) {
            if (parts.extlangs === undefined) {
                parts.extlangs = [next];
            } else if (parts.extlangs.length < 3) {
                parts.extlangs.push(next);
            } else {
                return fail(`${next}: too many extlang subtags`);
            }
            next = subtags.shift();
        }

        if (iana.scripts.isWellFormed(next)) {
            parts.script = next;
            next = subtags.shift();
        }

        if (iana.regions.isWellFormed(next)) {
            parts.region = next;
            next = subtags.shift();
        }

        while (iana.variants.isWellFormed(next)) {
            if (parts.variants === undefined) {
                parts.variants = [next];
            } else {
                parts.variants.push(next);
            }
            next = subtags.shift();
        }

        if (next !== undefined) {
            return fail(`${next}: unexpected subtag`);
        }
        return succeed(parts);
    }

    public static create(tag: string, registry: Iana.TagRegistry): Result<LanguageTag> {
        return captureResult(() => {
            const parts = LanguageTag.parse(tag, registry).getValueOrThrow();
            return new LanguageTag(parts);
        });
    }
}
