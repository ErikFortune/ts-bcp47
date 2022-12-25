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

import * as ExtensionRegistry from '../../iana/language-tag-extensions';
import * as Subtags from './model';

import { RegExpValidationHelpers } from '../../utils';
import { TagValidationHelpers } from '../../iana/jar/language-subtags/tags/tagValidation';

import { succeed } from '@fgv/ts-utils';

export const extensionSingleton = ExtensionRegistry.Validate.extensionSingleton;

export const extensionSubtag = new RegExpValidationHelpers<Subtags.ExtensionSubtag>({
    description: 'language tag extension subtag',
    wellFormed: /^([a-zA-Z0-9]{2,8})(-[a-zA-Z0-9]{2,8})*$/,
    canonical: /^([a-z0-9]{2,8})(-[a-z0-9]{2,8})*$/,
    toCanonical: (from: Subtags.ExtensionSubtag) => TagValidationHelpers.toCanonicalTag(from),
});

export const privateUsePrefix = new RegExpValidationHelpers<Subtags.PrivateUsePrefix>({
    description: 'language tag private-use prefix',
    wellFormed: /^[xX]$/,
    canonical: /^x$/,
    toCanonical: (from: Subtags.PrivateUsePrefix) => succeed(from.toLowerCase() as Subtags.PrivateUsePrefix),
});