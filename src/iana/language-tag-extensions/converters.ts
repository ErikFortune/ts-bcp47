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
import * as Validate from './validate';

import { Converters, Result } from '@fgv/ts-utils';
import { convertJsonFileSync } from '@fgv/ts-json/file';
import { datedRegistry } from '../common/converters';

export const extensionSingleton = Validate.extensionSingleton.converter;

export const languageTagExtension = Converters.strictObject<Model.LanguageTagExtension>(
    {
        identifier: extensionSingleton,
        description: Converters.stringArray,
        comments: Converters.stringArray,
        added: Iana.Converters.yearMonthDaySpec,
        rfc: Converters.string,
        authority: Converters.string,
        contactEmail: Converters.string,
        mailingList: Converters.string,
        url: Converters.string,
    },
    {
        description: 'registered language tag extension',
    }
);

export const languageTagExtensions = datedRegistry(languageTagExtension);

export function loadLanguageTagExtensionsJsonFileSync(path: string): Result<Model.LanguageTagExtensions> {
    return convertJsonFileSync(path, languageTagExtensions);
}
