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
import * as Validate from './validate';

import { BaseConverter, Converter, Converters, Result, fail, mapResults } from '@fgv/ts-utils';
import { convertJsonFileSync } from '@fgv/ts-json/file';
import { strictObject } from '@fgv/ts-utils/converters';

export const languageSubtag = Converters.string.map(Validate.languageSubtag);
export const extLangSubtag = Converters.string.map(Validate.extLangSubtag);
export const scriptSubtag = Converters.string.map(Validate.scriptSubtag);
export const regionSubtag = Converters.string.map(Validate.regionSubtag);
export const variantSubtag = Converters.string.map(Validate.variantSubtag);

export const grandfatheredTag = Converters.string.map(Validate.grandfatheredTag);
export const redundantTag = Converters.string.map(Validate.redundantTag);

export const registryEntryType = Converters.enumeratedValue<Model.RegistryEntryType>(Model.allRegistryEntryTypes);
export const registryScopeType = Converters.enumeratedValue<Model.RegistryEntryScope>(Model.allRegistryEntryScopes);

export const yearMonthDaySpec = Converters.string.map(Validate.yearMonthDaySpec);

export function tagRange<TTAG extends string>(tagConverter: Converter<TTAG>): Converter<TTAG[]> {
    return new BaseConverter<TTAG[]>((from: unknown): Result<TTAG[]> => {
        if (typeof from !== 'string') {
            return fail('tagRange converter: not a string');
        }

        const parts = from.split('..');
        if (parts.length !== 2) {
            return fail(`"${from}: malformed tagRange`);
        }

        return mapResults(parts.map((tag) => tagConverter.convert(tag)));
    });
}

export function tagOrRange<TTAG extends string>(tagConverter: Converter<TTAG>): Converter<TTAG | TTAG[]> {
    return Converters.oneOf<TTAG | TTAG[]>([tagConverter, tagRange(tagConverter)]);
}

type BaseFields = Omit<Model.RegistrySubtagEntry, 'Type' | 'Subtag'>;
const registryEntryFieldConverters: Converters.FieldConverters<BaseFields> = {
    /* eslint-disable @typescript-eslint/naming-convention */
    Description: Converters.arrayOf(Converters.string),
    Added: yearMonthDaySpec,
    Comments: Converters.arrayOf(Converters.string),
    Deprecated: yearMonthDaySpec,
    Macrolanguage: languageSubtag,
    'Preferred-Value': Converters.string,
    Prefix: Converters.arrayOf(Converters.string),
    Scope: registryScopeType,
    'Suppress-Script': scriptSubtag,
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
            Subtag: tagOrRange(subtagConverter),
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
            Tag: tagOrRange(tagConverter),
            ...registryEntryFieldConverters,
            /* eslint-enable @typescript-eslint/naming-convention */
        },
        { optionalFields }
    );
}

export const languageSubtagRegistryEntry = registrySubtagEntry(Converters.enumeratedValue(['language']), languageSubtag);
export const extLangSubtagRegistryEntry = registrySubtagEntry(Converters.enumeratedValue(['extlang']), extLangSubtag);
export const regionSubtagRegistryEntry = registrySubtagEntry(Converters.enumeratedValue(['region']), regionSubtag);
export const scriptSubtagRegistryEntry = registrySubtagEntry(Converters.enumeratedValue(['script']), scriptSubtag);
export const variantSubtagRegistryEntry = registrySubtagEntry(Converters.enumeratedValue(['variant']), variantSubtag);
export const grandfatheredTagRegistryEntry = registryTagEntry(Converters.enumeratedValue(['grandfathered']), grandfatheredTag);
export const redundantTagRegistryEntry = registryTagEntry(Converters.enumeratedValue(['redundant']), redundantTag);
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

export function loadIanaRegistryScope<TSUBTAG extends string>(
    path: string,
    subtagConverter: Converter<TSUBTAG>
): Result<Model.RegistryScope<TSUBTAG>> {
    return convertJsonFileSync(path, Converters.recordOf<number, unknown, TSUBTAG>(Converters.number, { keyConverter: subtagConverter }));
}
