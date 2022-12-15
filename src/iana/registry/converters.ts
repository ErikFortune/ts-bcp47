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

import * as Items from './registeredItems';
import * as Model from './model';
import * as TagConverters from '../tags/converters';
import * as Validate from './validate';

import { Converter, Converters, Result, succeed } from '@fgv/ts-utils';
import { convertJsonFileSync } from '@fgv/ts-json/file';
import { strictObject } from '@fgv/ts-utils/converters';

export const registryEntryType = Converters.enumeratedValue<Model.RegistryEntryType>(Model.allRegistryEntryTypes);
export const registryScopeType = Converters.enumeratedValue<Model.RegistryEntryScope>(Model.allRegistryEntryScopes);

export const yearMonthDaySpec = Converters.string.map(Validate.yearMonthDaySpec);

type BaseFields = Omit<Model.RegistrySubtagEntry, 'Type' | 'Subtag'>;
const registryEntryFieldConverters: Converters.FieldConverters<BaseFields> = {
    /* eslint-disable @typescript-eslint/naming-convention */
    Description: Converters.arrayOf(Converters.string),
    Added: yearMonthDaySpec,
    Comments: Converters.arrayOf(Converters.string),
    Deprecated: yearMonthDaySpec,
    Macrolanguage: TagConverters.languageSubtag,
    'Preferred-Value': Converters.string,
    Prefix: Converters.arrayOf(Converters.string),
    Scope: registryScopeType,
    'Suppress-Script': TagConverters.scriptSubtag,
    /* eslint-enable @typescript-eslint/naming-convention */
};
const optionalFields: (keyof BaseFields)[] = [
    'Comments',
    'Deprecated',
    'Macrolanguage',
    'Preferred-Value',
    'Prefix',
    'Scope',
    'Suppress-Script',
];

function registrySubtagEntry<TTYPE extends Model.RegistryEntryType, TSUBTAG extends string>(
    typeConverter: Converter<TTYPE, unknown>,
    subtagConverter: Converter<TSUBTAG, unknown>
): Converter<Model.RegistrySubtagEntry<TTYPE, TSUBTAG>> {
    return strictObject<Model.RegistrySubtagEntry<TTYPE, TSUBTAG>>(
        {
            /* eslint-disable @typescript-eslint/naming-convention */
            Type: typeConverter,
            Subtag: TagConverters.tagOrRange(subtagConverter),
            ...registryEntryFieldConverters,
            /* eslint-enable @typescript-eslint/naming-convention */
        },
        { optionalFields }
    );
}

function registryTagEntry<TTYPE extends Model.RegistryEntryType, TTAG extends string>(
    typeConverter: Converter<TTYPE, unknown>,
    tagConverter: Converter<TTAG, unknown>
): Converter<Model.RegistryTagEntry<TTYPE, TTAG>> {
    return strictObject<Model.RegistryTagEntry<TTYPE, TTAG>>(
        {
            /* eslint-disable @typescript-eslint/naming-convention */
            Type: typeConverter,
            Tag: TagConverters.tagOrRange(tagConverter),
            ...registryEntryFieldConverters,
            /* eslint-enable @typescript-eslint/naming-convention */
        },
        { optionalFields }
    );
}

export const languageSubtagRegistryEntry = registrySubtagEntry(Converters.enumeratedValue(['language']), TagConverters.languageSubtag);
export const extLangSubtagRegistryEntry = registrySubtagEntry(Converters.enumeratedValue(['extlang']), TagConverters.extLangSubtag);
export const regionSubtagRegistryEntry = registrySubtagEntry(Converters.enumeratedValue(['region']), TagConverters.regionSubtag);
export const scriptSubtagRegistryEntry = registrySubtagEntry(Converters.enumeratedValue(['script']), TagConverters.scriptSubtag);
export const variantSubtagRegistryEntry = registrySubtagEntry(Converters.enumeratedValue(['variant']), TagConverters.variantSubtag);
export const grandfatheredTagRegistryEntry = registryTagEntry(
    Converters.enumeratedValue(['grandfathered']),
    TagConverters.grandfatheredTag
);
export const redundantTagRegistryEntry = registryTagEntry(Converters.enumeratedValue(['redundant']), TagConverters.redundantTag);
export const registryEntry = Converters.discriminatedObject<Model.RegistryEntry>('Type', {
    language: languageSubtagRegistryEntry,
    extlang: extLangSubtagRegistryEntry,
    region: regionSubtagRegistryEntry,
    script: scriptSubtagRegistryEntry,
    variant: variantSubtagRegistryEntry,
    grandfathered: grandfatheredTagRegistryEntry,
    redundant: redundantTagRegistryEntry,
});

export function loadIanaRegistrySync(path: string): Result<Model.RegistryEntry[]> {
    return convertJsonFileSync(path, Converters.arrayOf(registryEntry));
}

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

export function loadIanaRegistryItemsSync(path: string): Result<Items.RegisteredItem[]> {
    return convertJsonFileSync(path, Converters.arrayOf(registeredItem));
}
