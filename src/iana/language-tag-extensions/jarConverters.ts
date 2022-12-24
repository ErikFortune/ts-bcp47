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

import * as Model from './model';

import { Converters, RecordJar, Result } from '@fgv/ts-utils';
import { convertJsonFileSync } from '@fgv/ts-json/file';
import { datedRegistry } from '../common/converters';
import { datedRegistryFromJarRecords } from '../jar/jarConverters';
import { extensionSingleton } from './validate';

export const languageTagExtension = Converters.transformObject<Model.LanguageTagExtensionRegistryEntry, Model.LanguageTagExtension>(
    {
        identifier: { from: 'Identifier', converter: extensionSingleton.converter },
        description: { from: 'Description', converter: Converters.stringArray },
        comments: { from: 'Comments', converter: Converters.stringArray },
        added: { from: 'Added', converter: Iana.Converters.yearMonthDaySpec },
        rfc: { from: 'RFC', converter: Converters.string },
        authority: { from: 'Authority', converter: Converters.string },
        contactEmail: { from: 'Contact_Email', converter: Converters.string },
        mailingList: { from: 'Mailing_List', converter: Converters.string },
        url: { from: 'URL', converter: Converters.string },
    },
    {
        strict: true,
        description: 'registered language tag extension',
    }
);

export const languageTagExtensions = datedRegistry(languageTagExtension);

export function loadJsonLanguageTagExtensionsRegistryFileSync(path: string): Result<Model.LanguageTagExtensions> {
    return convertJsonFileSync(path, languageTagExtensions);
}

export function loadTxtLanguageTagExtensionsRegistryFileSync(path: string): Result<Model.LanguageTagExtensions> {
    return RecordJar.readRecordJarFileSync(path, {
        arrayFields: ['Comments', 'Description'],
        fixedContinuationSize: 1,
    }).onSuccess((jar) => {
        return datedRegistryFromJarRecords(languageTagExtension).convert(jar);
    });
}
