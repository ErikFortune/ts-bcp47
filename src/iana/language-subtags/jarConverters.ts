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

import * as Items from './model';
import * as Model from '../jar/language-subtags/registry/model';
import * as TagConverters from '../jar/language-subtags/tags/converters';

import { Converters, RecordJar, Result, fail, succeed } from '@fgv/ts-utils';
import { datedRegistry, yearMonthDaySpec } from '../common/converters';

import { convertJsonFileSync } from '@fgv/ts-json/file';
import { datedRegistryFromJarRecords } from '../jar/jarConverters';
import { registryScopeType } from '../jar/language-subtags/registry/converters';

export const registeredLanguage = Converters.transformObject<Model.LanguageSubtagRegistryEntry, Items.RegisteredLanguage>(
    {
        type: { from: 'Type', converter: Converters.enumeratedValue<'language'>(['language']) },
        subtag: { from: 'Subtag', converter: TagConverters.tagOrStartOfTagRange(TagConverters.languageSubtag) },
        description: { from: 'Description', converter: Converters.stringArray },
        added: { from: 'Added', converter: yearMonthDaySpec },
        comments: { from: 'Comments', converter: Converters.stringArray, optional: true },
        deprecated: { from: 'Deprecated', converter: yearMonthDaySpec, optional: true },
        macrolanguage: { from: 'Macrolanguage', converter: TagConverters.languageSubtag, optional: true },
        preferredValue: { from: 'Preferred-Value', converter: TagConverters.languageSubtag, optional: true },
        scope: { from: 'Scope', converter: registryScopeType, optional: true },
        suppressScript: { from: 'Suppress-Script', converter: TagConverters.scriptSubtag, optional: true },
        subtagRangeEnd: { from: 'Subtag', converter: TagConverters.endOfTagRangeOrUndefined(TagConverters.languageSubtag), optional: true },
    },
    {
        strict: true,
        description: 'language subtag',
    }
);

export const registeredExtLang = Converters.transformObject<Model.ExtLangSubtagRegistryEntry, Items.RegisteredExtLang>(
    {
        type: { from: 'Type', converter: Converters.enumeratedValue<'extlang'>(['extlang']) },
        subtag: { from: 'Subtag', converter: TagConverters.extLangSubtag },
        preferredValue: { from: 'Preferred-Value', converter: TagConverters.extendedLanguageRange },
        prefix: {
            from: 'Prefix',
            converter: Converters.arrayOf(TagConverters.languageSubtag).map((tags) => {
                if (tags.length !== 1) {
                    return fail(`[${tags.join(', ')}]: malformed extlang prefix`);
                }
                return succeed(tags[0]);
            }),
        },
        description: { from: 'Description', converter: Converters.stringArray },
        added: { from: 'Added', converter: yearMonthDaySpec },
        comments: { from: 'Comments', converter: Converters.stringArray, optional: true },
        deprecated: { from: 'Deprecated', converter: yearMonthDaySpec, optional: true },
        macrolanguage: { from: 'Macrolanguage', converter: TagConverters.languageSubtag, optional: true },
        scope: { from: 'Scope', converter: registryScopeType, optional: true },
        suppressScript: { from: 'Suppress-Script', converter: TagConverters.scriptSubtag, optional: true },
    },
    {
        strict: true,
        description: 'extlang subtag',
    }
);

export const registeredScript = Converters.transformObject<Model.ScriptSubtagRegistryEntry, Items.RegisteredScript>(
    {
        type: { from: 'Type', converter: Converters.enumeratedValue<'script'>(['script']) },
        subtag: { from: 'Subtag', converter: TagConverters.tagOrStartOfTagRange(TagConverters.scriptSubtag) },
        description: { from: 'Description', converter: Converters.stringArray },
        added: { from: 'Added', converter: yearMonthDaySpec },
        comments: { from: 'Comments', converter: Converters.stringArray, optional: true },
        deprecated: { from: 'Deprecated', converter: yearMonthDaySpec, optional: true },
        preferredValue: { from: 'Preferred-Value', converter: TagConverters.scriptSubtag, optional: true },
        subtagRangeEnd: { from: 'Subtag', converter: TagConverters.endOfTagRangeOrUndefined(TagConverters.scriptSubtag), optional: true },
    },
    {
        strict: true,
        description: 'script subtag',
    }
);

export const registeredRegion = Converters.transformObject<Model.RegionSubtagRegistryEntry, Items.RegisteredRegion>(
    {
        type: { from: 'Type', converter: Converters.enumeratedValue<'region'>(['region']) },
        subtag: { from: 'Subtag', converter: TagConverters.tagOrStartOfTagRange(TagConverters.regionSubtag) },
        description: { from: 'Description', converter: Converters.stringArray },
        added: { from: 'Added', converter: yearMonthDaySpec },
        comments: { from: 'Comments', converter: Converters.stringArray, optional: true },
        deprecated: { from: 'Deprecated', converter: yearMonthDaySpec, optional: true },
        preferredValue: { from: 'Preferred-Value', converter: TagConverters.regionSubtag, optional: true },
        subtagRangeEnd: { from: 'Subtag', converter: TagConverters.endOfTagRangeOrUndefined(TagConverters.regionSubtag), optional: true },
    },
    {
        strict: true,
        description: 'region subtag',
    }
);

export const registeredVariant = Converters.transformObject<Model.VariantSubtagRegistryEntry, Items.RegisteredVariant>(
    {
        type: { from: 'Type', converter: Converters.enumeratedValue<'variant'>(['variant']) },
        subtag: { from: 'Subtag', converter: TagConverters.variantSubtag },
        description: { from: 'Description', converter: Converters.stringArray },
        added: { from: 'Added', converter: yearMonthDaySpec },
        comments: { from: 'Comments', converter: Converters.stringArray, optional: true },
        deprecated: { from: 'Deprecated', converter: yearMonthDaySpec, optional: true },
        preferredValue: { from: 'Preferred-Value', converter: TagConverters.variantSubtag, optional: true },
        prefix: { from: 'Prefix', converter: Converters.arrayOf(TagConverters.extendedLanguageRange), optional: true },
    },
    {
        strict: true,
        description: 'variant subtag',
    }
);

export const registeredGrandfatheredTag = Converters.transformObject<Model.GrandfatheredTagRegistryEntry, Items.RegisteredGrandfatheredTag>(
    {
        type: { from: 'Type', converter: Converters.enumeratedValue<'grandfathered'>(['grandfathered']) },
        tag: { from: 'Tag', converter: TagConverters.grandfatheredTag },
        description: { from: 'Description', converter: Converters.stringArray },
        added: { from: 'Added', converter: yearMonthDaySpec },
        comments: { from: 'Comments', converter: Converters.stringArray, optional: true },
        deprecated: { from: 'Deprecated', converter: yearMonthDaySpec, optional: true },
        preferredValue: { from: 'Preferred-Value', converter: TagConverters.extendedLanguageRange, optional: true },
    },
    {
        strict: true,
        description: 'grandfathered tag',
    }
);

export const registeredRedundantTag = Converters.transformObject<Model.RedundantTagRegistryEntry, Items.RegisteredRedundantTag>(
    {
        type: { from: 'Type', converter: Converters.enumeratedValue<'redundant'>(['redundant']) },
        tag: { from: 'Tag', converter: TagConverters.redundantTag },
        description: { from: 'Description', converter: Converters.stringArray },
        added: { from: 'Added', converter: yearMonthDaySpec },
        comments: { from: 'Comments', converter: Converters.stringArray, optional: true },
        deprecated: { from: 'Deprecated', converter: yearMonthDaySpec, optional: true },
        preferredValue: { from: 'Preferred-Value', converter: TagConverters.extendedLanguageRange, optional: true },
    },
    {
        strict: true,
        description: 'redundant tag',
    }
);

export const registeredItem = Converters.discriminatedObject<Items.RegisteredItem>('Type', {
    language: registeredLanguage,
    extlang: registeredExtLang,
    script: registeredScript,
    region: registeredRegion,
    variant: registeredVariant,
    grandfathered: registeredGrandfatheredTag,
    redundant: registeredRedundantTag,
});

export const registryFile = datedRegistry(registeredItem);

export function loadJsonIanaRegistryFileSync(path: string): Result<Items.RegistryFile> {
    return convertJsonFileSync(path, registryFile);
}

export function loadIanaRegistryTxtFileSync(path: string): Result<Items.RegistryFile> {
    return RecordJar.readRecordJarFileSync(path, {
        arrayFields: ['Comments', 'Description', 'Prefix'],
        fixedContinuationSize: 1,
    }).onSuccess((jar) => {
        return datedRegistryFromJarRecords(registeredItem)
            .convert(jar)
            .onSuccess((dr) => {
                return registryFile.convert(dr);
            });
    });
}
