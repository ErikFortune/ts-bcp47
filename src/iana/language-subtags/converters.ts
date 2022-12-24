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

import * as Model from './model';
import * as TagConverters from '../jar/language-subtags/tags/converters';

import { Converters, Result } from '@fgv/ts-utils';
import { datedRegistry, yearMonthDaySpec } from '../common/converters';

import { convertJsonFileSync } from '@fgv/ts-json/file';
import { registryScopeType } from '../jar/language-subtags/registry/converters';

export const extendedLanguageRange = TagConverters.extendedLanguageRange;

export const registeredLanguage = Converters.strictObject<Model.RegisteredLanguage>(
    {
        type: Converters.enumeratedValue<'language'>(['language']),
        subtag: TagConverters.languageSubtag,
        description: Converters.stringArray,
        added: yearMonthDaySpec,
        comments: Converters.stringArray,
        deprecated: yearMonthDaySpec,
        macrolanguage: TagConverters.languageSubtag,
        preferredValue: TagConverters.languageSubtag,
        scope: registryScopeType,
        suppressScript: TagConverters.scriptSubtag,
        subtagRangeEnd: TagConverters.languageSubtag,
    },
    {
        description: 'language subtag registry entry',
        optionalFields: ['comments', 'deprecated', 'macrolanguage', 'preferredValue', 'scope', 'suppressScript', 'subtagRangeEnd'],
    }
);

export const registeredExtLang = Converters.strictObject<Model.RegisteredExtLang>(
    {
        type: Converters.enumeratedValue<'extlang'>(['extlang']),
        subtag: TagConverters.tagOrStartOfTagRange(TagConverters.extlangSubtag),
        preferredValue: TagConverters.extendedLanguageRange,
        prefix: TagConverters.extlangPrefix,
        description: Converters.stringArray,
        added: yearMonthDaySpec,
        comments: Converters.stringArray,
        deprecated: yearMonthDaySpec,
        macrolanguage: TagConverters.languageSubtag,
        scope: registryScopeType,
        suppressScript: TagConverters.scriptSubtag,
    },
    {
        description: 'extlang subtag registry entry',
        optionalFields: ['comments', 'deprecated', 'macrolanguage', 'scope', 'suppressScript'],
    }
);

export const registeredScript = Converters.strictObject<Model.RegisteredScript>(
    {
        type: Converters.enumeratedValue<'script'>(['script']),
        subtag: TagConverters.scriptSubtag,
        description: Converters.stringArray,
        added: yearMonthDaySpec,
        comments: Converters.stringArray,
        deprecated: yearMonthDaySpec,
        preferredValue: TagConverters.scriptSubtag,
        subtagRangeEnd: TagConverters.scriptSubtag,
    },
    {
        description: 'script subtag registry entry',
        optionalFields: ['comments', 'deprecated', 'preferredValue', 'subtagRangeEnd'],
    }
);

export const registeredRegion = Converters.strictObject<Model.RegisteredRegion>(
    {
        type: Converters.enumeratedValue<'region'>(['region']),
        subtag: TagConverters.regionSubtag,
        description: Converters.stringArray,
        added: yearMonthDaySpec,
        comments: Converters.stringArray,
        deprecated: yearMonthDaySpec,
        preferredValue: TagConverters.regionSubtag,
        subtagRangeEnd: TagConverters.regionSubtag,
    },
    {
        description: 'region subtag registry entry',
        optionalFields: ['comments', 'deprecated', 'preferredValue', 'subtagRangeEnd'],
    }
);

export const registeredVariant = Converters.strictObject<Model.RegisteredVariant>(
    {
        type: Converters.enumeratedValue<'variant'>(['variant']),
        subtag: TagConverters.variantSubtag,
        description: Converters.stringArray,
        added: yearMonthDaySpec,
        comments: Converters.stringArray,
        deprecated: yearMonthDaySpec,
        preferredValue: TagConverters.variantSubtag,
        prefix: Converters.arrayOf(TagConverters.extendedLanguageRange),
    },
    {
        description: 'variant subtag registry entry',
        optionalFields: ['comments', 'deprecated', 'preferredValue', 'prefix'],
    }
);

export const registeredGrandfatheredTag = Converters.strictObject<Model.RegisteredGrandfatheredTag>(
    {
        type: Converters.enumeratedValue<'grandfathered'>(['grandfathered']),
        tag: TagConverters.grandfatheredTag,
        description: Converters.stringArray,
        added: yearMonthDaySpec,
        comments: Converters.stringArray,
        deprecated: yearMonthDaySpec,
        preferredValue: TagConverters.extendedLanguageRange,
    },
    {
        description: 'grandfathered tag registry entry',
        optionalFields: ['comments', 'deprecated', 'preferredValue'],
    }
);

export const registeredRedundantTag = Converters.strictObject<Model.RegisteredRedundantTag>(
    {
        type: Converters.enumeratedValue<'redundant'>(['redundant']),
        tag: TagConverters.redundantTag,
        description: Converters.stringArray,
        added: yearMonthDaySpec,
        comments: Converters.stringArray,
        deprecated: yearMonthDaySpec,
        preferredValue: TagConverters.extendedLanguageRange,
    },
    {
        description: 'redundant tag registry entry',
        optionalFields: ['comments', 'deprecated', 'preferredValue'],
    }
);

export const registeredItem = Converters.discriminatedObject<Model.RegisteredItem>('type', {
    language: registeredLanguage,
    extlang: registeredExtLang,
    script: registeredScript,
    region: registeredRegion,
    variant: registeredVariant,
    grandfathered: registeredGrandfatheredTag,
    redundant: registeredRedundantTag,
});

export const registryFile = datedRegistry(registeredItem);

export function loadLanguageSubtagsJsonFileSync(path: string): Result<Model.RegistryFile> {
    return convertJsonFileSync(path, registryFile);
}
