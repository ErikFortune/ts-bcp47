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

import * as Subtags from './model';

export class WellFormed {
    public static extensionSingleton(val: unknown): val is Subtags.ExtensionSingleton {
        return typeof val === 'string' && /^[0-9a-wyzA-WYZ]$/.test(val);
    }

    public static extensionSubtag(val: unknown): val is Subtags.ExtensionSubtag {
        return typeof val === 'string' && /^[0-9a-zA-Z]{2,8}$/.test(val);
    }

    public static privateUsePrefix(val: unknown): val is Subtags.PrivateUsePrefix {
        return typeof val === 'string' && (val === 'x' || val === 'X');
    }

    public static privateUseSubtag(val: unknown): val is Subtags.PrivateUseSubtag {
        return typeof val === 'string' && val !== 'x' && val !== 'X' && /^[0-9a-zA-Z]{1,8}$/.test(val);
    }
}
