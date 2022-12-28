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

import { Model } from './subtags';

export interface ExtensionSubtagValue {
    readonly singleton: Model.ExtensionSingleton;
    readonly value: Model.ExtensionSubtag;
}

export interface LanguageTagParts {
    primaryLanguage?: Iana.LanguageSubtags.LanguageSubtag;
    extlangs?: Iana.LanguageSubtags.ExtLangSubtag[];
    script?: Iana.LanguageSubtags.ScriptSubtag;
    region?: Iana.LanguageSubtags.RegionSubtag;
    variants?: Iana.LanguageSubtags.VariantSubtag[];
    extensions?: ExtensionSubtagValue[];
    privateUse?: Iana.LanguageSubtags.ExtendedLanguageRange[];

    grandfathered?: Iana.LanguageSubtags.GrandfatheredTag;
}

export interface LanguageTagInfo {
    readonly tag: string;
    readonly parts: Readonly<LanguageTagParts>;
}

export function languageTagPartsToString(parts: LanguageTagParts): string {
    if (parts.grandfathered) {
        return parts.grandfathered;
    }
    return [
        parts.primaryLanguage,
        ...(parts.extlangs ?? []),
        parts.script,
        parts.region,
        ...(parts.variants ?? []),
        ...(parts.extensions ?? []).map((e) => `${e.singleton}-${e.value}`),
        ...(parts.privateUse ?? []).map((p) => `x-${p}`),
    ]
        .filter((s): s is string => s !== undefined)
        .join('-');
}

export function languageTagPartsAreEqual(p1: LanguageTagParts, p2: LanguageTagParts): boolean {
    let match =
        p1.primaryLanguage === p2.primaryLanguage &&
        p1.extlangs?.length === p2.extlangs?.length &&
        p1.script === p2.script &&
        p1.region === p2.region &&
        p1.variants?.length === p2.extlangs?.length &&
        p1.extensions?.length === p2.extensions?.length &&
        p1.privateUse?.length === p2.extensions?.length &&
        p1.grandfathered === p2.grandfathered;

    if (match && p1.extlangs) {
        for (let i = 0; i < p1.extlangs.length; i++) {
            match = match && p1.extlangs[i] === p2.extlangs![i];
        }
    }

    if (match && p1.variants) {
        for (let i = 0; i < p1.variants.length; i++) {
            match = match && p1.variants[i] === p2.variants![i];
        }
    }

    if (match && p1.extensions) {
        for (let i = 0; i < p1.extensions.length; i++) {
            match =
                match && p1.extensions[i].singleton === p2.extensions![i].singleton && p1.extensions[i].value === p2.extensions![i].value;
        }
    }

    if (match && p1.privateUse) {
        for (let i = 0; i < p1.privateUse.length; i++) {
            match = match && p1.privateUse[i] === p2.privateUse![i];
        }
    }
    return match;
}
